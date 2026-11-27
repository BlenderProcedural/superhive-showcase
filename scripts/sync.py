#!/usr/bin/env python3
"""Read a creator's public Superhive store and write data/products.json for the showcase widget.

    python scripts/sync.py            (standard library only; settings in config.json)

The widget shows only the curated products in config.json ("hero" and "picks"); for those the script also opens the
product page for the sales count, rating and large image.

The store pages are public, so no login or token is needed. If a run finds far fewer products than the last
saved file (the site changed or was down), nothing is written and the script exits with an error, so the live
widget keeps its last good data."""

import datetime
import html
import json
import pathlib
import re
import sys
import time
import urllib.request

ROOT = pathlib.Path(__file__).resolve().parent.parent
CONFIG = json.loads((ROOT / "config.json").read_text(encoding="utf-8"))
OUT = ROOT / "data" / "products.json"
BASE = "https://superhivemarket.com"
UA = "Mozilla/5.0 (compatible; superhive-showcase-sync/1.0)"


def get(url, tries=4):
    for t in range(tries):
        try:
            req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
            with urllib.request.urlopen(req, timeout=40) as r:
                return r.read().decode("utf-8", "replace")
        except Exception:  # rate limit (429) or a hiccup: back off and retry
            if t == tries - 1:
                raise
            time.sleep(8 * (t + 1))


def text(s):
    return html.unescape(re.sub(r"<[^>]+>", " ", s)).strip().replace(" ", " ")


def squash(s):
    return re.sub(r"\s+", " ", s).strip()


def parse(page):
    starts = [m.start() for m in re.finditer(r'<div class="card card-product', page)]
    cards = []
    for i, s in enumerate(starts):
        chunk = page[s:starts[i + 1] if i + 1 < len(starts) else s + 6000]
        href = re.search(r'href="/products/([^"?#]+)"', chunk)
        if not href:
            continue
        img = re.search(r'<img class="card-img-top[^"]*"[^>]*src="([^"]+)"', chunk)
        title = re.search(r'<div class="card-title">(.*?)</div>', chunk, re.S)
        price = re.search(r'<div class="card-price[^"]*">(.*?)<(?:img|/div)', chunk, re.S)
        cat = re.search(r'href="/categories/([^"]+)">([^<]+)</a>', chunk)
        sale = re.search(r'<label class="badge bg-sale">(.*?)</label>', chunk, re.S)
        classes = re.match(r'<div class="card card-product([^"]*)"', chunk).group(1)
        image = html.unescape(img.group(1)) if img else ""
        pid = re.search(r"/store/product/(\d+)/", image)
        cards.append({
            "slug": href.group(1),
            "id": int(pid.group(1)) if pid else 0,
            "title": squash(text(title.group(1))) if title else href.group(1),
            "url": f"{BASE}/products/{href.group(1)}",
            "price": squash(text(price.group(1))) if price else "",
            "sale": squash(text(sale.group(1))) if sale else "",
            "on_sale": "on-sale" in classes,
            "category": squash(html.unescape(cat.group(2))) if cat else "",
            "category_slug": cat.group(1) if cat else "",
            "image": image,
        })
    return cards


def details(page):
    """Sales bucket, rating and the large share image from a product page."""
    out = {}
    m = re.search(r'product-info-label[^>]*>\s*Sales\s*</td>\s*<td[^>]*>(.*?)</td>', page, re.S)
    if m:
        out["sales"] = squash(text(m.group(1)))
    m = re.search(r'"ratingValue":"([\d.]+)","reviewCount":"(\d+)"', page)
    if m:
        out["rating"], out["reviews"] = float(m.group(1)), int(m.group(2))
    m = re.search(r'<meta property="og:image" content="([^"]+)"', page)
    if m:
        out["image_hd"] = html.unescape(m.group(1))
    m = re.search(r'product-info-label[^>]*>\s*Published\s*</td>\s*<td[^>]*>(.*?)</td>', page, re.S)
    if m:  # "19 days ago", "about 1 month ago", "almost 2 years ago"
        pub = squash(text(m.group(1)))
        n = re.search(r"(\d+|an?)\s+(minute|hour|day|week|month|year)", pub)
        if n:
            k = 1 if n.group(1) in ("a", "an") else int(n.group(1))
            unit = {"minute": 0, "hour": 0, "day": 1, "week": 7, "month": 30, "year": 365}[n.group(2)]
            out["age_days"] = k * unit
            out["new"] = out["age_days"] <= CONFIG.get("new_days", 60)
    return out


MONTHS = {m: i for i, m in enumerate("jan feb mar apr may jun jul aug sep oct nov dec".split(), 1)}


def site_event(page, today):
    """The site-wide sale banner ("Cyber Sale now LIVE through 02 Dec!") as {name, text, url, ends}, or None."""
    m = re.search(r'<a class="banner"[^>]*href="([^"]*)"[^>]*>(.*?)</a>', page, re.S)
    if not m:
        return None
    content = re.search(r'banner-content">(.*?)<span class="banner-label"', m.group(2), re.S)
    line = squash(text(content.group(1) if content else m.group(2)))
    name = re.search(r"\b((?:[A-Z][A-Za-z]+ )*[A-Z][A-Za-z]+ Sale)\b", line)
    if not name:
        return None
    ev = {"name": name.group(1), "text": line, "url": html.unescape(m.group(1))}
    d = (re.search(r"(?:through|until|thru|ends?)\s+(\d{1,2})\s+([A-Za-z]{3})", line, re.I)
         or re.search(r"(?:through|until|thru|ends?)\s+([A-Za-z]{3})[a-z]*\.?\s+(\d{1,2})", line, re.I))
    if d:
        a, b = d.groups()
        day, mon = (int(a), b) if a.isdigit() else (int(b), a)
        month = MONTHS.get(mon[:3].lower())
        if month:
            year = today.year + (1 if month < today.month - 6 else 0)
            ev["ends"] = datetime.date(year, month, day).isoformat()
    return ev


def main():
    slug = CONFIG["creator_slug"]
    products, seen, avatar, event = [], set(), "", None
    today = datetime.datetime.now(datetime.timezone.utc).date()
    for page in range(1, 40):
        doc = get(f"{BASE}/creators/{slug}?page={page}")
        if not avatar:
            m = re.search(r'<img class="avatar[^"]*"[^>]*src="([^"]+)"', doc)
            avatar = html.unescape(m.group(1)) if m else ""
        if page == 1:
            event = CONFIG.get("event") or site_event(doc, today)
        cards = [c for c in parse(doc) if c["slug"] not in seen]
        if not cards:
            break
        for c in cards:
            seen.add(c["slug"])
            # "$19 $13.30" = list price then sale price; ranges ("$12.60-$34.30") are already the sale range
            parts = re.findall(r"\$[\d,.]+(?:-\$[\d,.]+)?", c["price"])
            c["price_old"] = parts[0] if len(parts) > 1 and parts[0] != parts[-1] else ""
            c["price"] = parts[-1] if parts else c["price"]
            low = re.match(r"\$([\d,.]+)", c["price"])
            c["free"] = bool(low) and float(low.group(1).replace(",", "")) == 0.0
            products.append(c)
        time.sleep(1.0)
    previous, old, prev = 0, {}, {}
    if OUT.exists():
        try:
            prev = json.loads(OUT.read_text(encoding="utf-8"))
            previous = prev.get("count", 0)
            old = {p["slug"]: p for p in prev.get("products", [])}
        except ValueError:
            pass
    if len(products) < max(5, previous * 0.6):
        sys.exit(f"only {len(products)} products found (last run: {previous}); keeping the old data")

    # only the curated products are shown: the bundle(s) on top, then the bestseller picks
    hero = [dict(h) for h in CONFIG.get("hero", []) if h.get("slug") in seen]
    picks = [s for s in CONFIG.get("picks", []) if s in seen]
    by_slug = {c["slug"]: c for c in products}
    for s in dict.fromkeys([h["slug"] for h in hero] + picks):
        time.sleep(1.5)
        try:
            extra = details(get(by_slug[s]["url"]))
        except Exception as e:  # keep yesterday's numbers rather than dropping them
            print(f"details for {s} failed ({e}); keeping the previous values")
            keep = ("sales", "rating", "reviews", "image_hd", "age_days", "new")
            extra = {k: old.get(s, {})[k] for k in keep if k in old.get(s, {})}
        by_slug[s].update(extra)

    data = {
        "updated": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat(),
        "creator": {"name": CONFIG["creator_name"], "url": f"{BASE}/creators/{slug}", "avatar": avatar,
                    "tagline": CONFIG.get("tagline", "")},
        "count": len(products),
        "event": event,
        "hero": hero,
        "picks": picks,
        "products": products,
    }
    # keep the old timestamp when nothing changed, so a frequent schedule doesn't commit (and redeploy) for nothing
    if prev and {k: v for k, v in prev.items() if k != "updated"} == {k: v for k, v in data.items() if k != "updated"}:
        print("no changes since the last run")
        return
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {len(products)} products to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
