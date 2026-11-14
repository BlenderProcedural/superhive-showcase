#!/usr/bin/env python3
"""Read a creator's public Superhive store and write data/products.json for the showcase widget.

    python scripts/sync.py            (standard library only; settings in config.json)

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


def get(url):
    req = urllib.request.Request(url, headers={"User-Agent": UA, "Accept": "text/html"})
    with urllib.request.urlopen(req, timeout=40) as r:
        return r.read().decode("utf-8", "replace")


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


def main():
    slug = CONFIG["creator_slug"]
    products, seen, avatar = [], set(), ""
    for page in range(1, 40):
        doc = get(f"{BASE}/creators/{slug}?page={page}")
        if not avatar:
            m = re.search(r'<img class="avatar[^"]*"[^>]*src="([^"]+)"', doc)
            avatar = html.unescape(m.group(1)) if m else ""
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
    previous = 0
    if OUT.exists():
        try:
            previous = json.loads(OUT.read_text(encoding="utf-8")).get("count", 0)
        except ValueError:
            pass
    if len(products) < max(5, previous * 0.6):
        sys.exit(f"only {len(products)} products found (last run: {previous}); keeping the old data")
    newest = sorted(products, key=lambda c: -c["id"])[:CONFIG.get("new_count", 4)]
    for c in products:
        c["new"] = c in newest
    data = {
        "updated": datetime.datetime.now(datetime.timezone.utc).replace(microsecond=0).isoformat(),
        "creator": {"name": CONFIG["creator_name"], "url": f"{BASE}/creators/{slug}", "avatar": avatar,
                    "tagline": CONFIG.get("tagline", "")},
        "count": len(products),
        "featured": [s for s in CONFIG.get("featured", []) if s in seen],
        "products": products,
    }
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(json.dumps(data, ensure_ascii=False, indent=1), encoding="utf-8")
    print(f"wrote {len(products)} products to {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
