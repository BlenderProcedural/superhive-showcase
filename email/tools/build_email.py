"""Builds the Cyber Sale customer email (an HTML fragment for Superhive's email editor) from the showcase data.

    python build_email.py <showcase_repo> <out_dir>

Writes content.html (paste into Superhive), preview.html (the same inside a mail-client-like page) and subject.txt.
GIF URLs point at the showcase's GitHub Pages site, under email/cyber-2026/."""
import html, json, pathlib, re, sys

REPO, OUT = pathlib.Path(sys.argv[1]), pathlib.Path(sys.argv[2])
data = json.loads((REPO / "data" / "products.json").read_text(encoding="utf-8"))
by = {p["slug"]: p for p in data["products"]}
GIF = "https://blenderprocedural.github.io/superhive-showcase/email/cyber-2026/"
UTM = "utm_source=blenderprocedural_email&utm_medium=email&utm_campaign=cyber_sale_2026"
STORE = f"https://superhivemarket.com/creators/pamir-bal?{UTM}"
BG, CARD, LINE, TEXT, MUTED = "#0b0818", "#15112b", "#2b2350", "#e6e3f3", "#a9a3c4"
CYAN, MAGENTA, VIOLET, GOLD = "#00e5ff", "#ff2bd6", "#8b5cff", "#ffe14d"
FONT = "Arial, Helvetica, sans-serif"

CARDS = [  # slug, short name, one line; order = the showcase widget's picks
    ("mechify", "Mechify", "Procedural sci-fi hard-surface for any mesh, in one click."),
    ("ocean-physics-pro", "Ocean Physics Pro", "Drive boats on a real-time ocean with wake, foam and spray."),
    ("vehicle-physics-pro", "Vehicle Physics Pro", "Drive and crash cars in real time, right in the viewport."),
    ("blend-online", "Blend Online", "Edit one Blender scene together in real time, over the internet."),
    ("autodepth-ai", "AutoDepth AI", "Turn 2D images into 3D with local, offline AI."),
    ("aquaflow-pro", "Aqua Flow Pro", "Detailed fluid, fire and sand effects with Geometry Nodes."),
    ("physics-placer", "Physics Placer", "Drop and scatter objects into place with real physics."),
    ("blenderailibrary", "Blender AI Library Pro", "Text to 3D, image to 3D and text to PBR material."),
    ("knitting-generator-addon", "Knitting Generator", "A knitted look on any model in one click, no UVs needed."),
    ("video-depth-ai", "Video Depth AI", "Turn any video into an animated 3D scene."),
    ("auto-painter-ai", "Auto Painter AI", "AI texture generation for your 3D models."),
    ("bp-geogen-ultimate-generators-bundle", "BP GeoGen Generators Bundle", "A bundle of procedural Geometry Nodes generators."),
    ("fluffy-maker", "Fluffy Maker", "Realistic fur on any object, instantly."),
    ("curve-fluids", "Curve Fluids", "Real-time procedural liquid simulations."),
    ("easy-wake", "Easy Wake", "Dynamic oceans with realistic ship wakes."),
    ("blender-inflate-addon----generate-dynamic-cloth-panels", "Blender Inflate", "Generate dynamic, inflated cloth panels."),
]

SHORT = {"blender-inflate-addon----generate-dynamic-cloth-panels": "blender-inflate"}  # Windows path length


def link(slug):
    return f"https://superhivemarket.com/products/{slug}?{UTM}"


def esc(s):
    return html.escape(s, quote=True)


def pct(p):
    m = re.search(r"\d+", p.get("sale") or "")
    return f"-{m.group(0)}%" if m else ""


def price_html(p, big=17):
    now, was = p["price"], p.get("price_old", "")
    if "-" in now:   # a range of licences: show the lowest sale price
        low = now.split("-")[0]
        return (f'<span style="color:{MUTED};font-size:12px;">from </span>'
                f'<span style="color:#ffffff;font-size:{big}px;font-weight:bold;">{esc(low)}</span>')
    out = f'<s style="color:{MUTED};font-size:12px;">{esc(was)}</s>&nbsp;' if was else ""
    return out + f'<span style="color:#ffffff;font-size:{big}px;font-weight:bold;">{esc(now)}</span>'


def sales_n(p):
    m = re.match(r"(\d+)", (p.get("sales") or "").replace(",", ""))
    return int(m.group(1)) if m else 0


def tags(p):
    t = []
    if p.get("new"):
        t.append(f'<span style="color:{CYAN};">&#10024; NEW</span>')
    if sales_n(p) >= 100:
        t.append(f'<span style="color:{GOLD};">&#128293; {esc(p["sales"])} SALES</span>')
    return "&nbsp;&nbsp;".join(t) or f'<span style="color:{MUTED};">{esc(p.get("category") or "Add-on").upper()}</span>'


def button(href, label, size=16, pad="14px 26px"):
    return (f'<a href="{href}" style="background-color:{VIOLET};background-image:linear-gradient(90deg,#00c8ff,{VIOLET},{MAGENTA});'
            f'color:#ffffff;padding:{pad};border-radius:8px;text-decoration:none;font-weight:bold;display:inline-block;'
            f'font-size:{size}px;font-family:{FONT};">{label}</a>')


def card(slug, name, line):
    p, url = by[slug], link(slug)
    return f"""<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:{CARD};border:1px solid {LINE};border-radius:10px;">
<tr><td style="padding:0;"><a href="{url}"><img src="{GIF}card-{SHORT.get(slug, slug)}.gif" alt="{esc(name)}: demo" width="294" style="width:100%;height:auto;display:block;border:0;border-radius:9px 9px 0 0;"></a></td></tr>
<tr><td style="padding:10px 12px 12px;font-family:{FONT};">
<p style="margin:0 0 5px;font-size:10px;font-weight:bold;letter-spacing:1px;">{tags(p)}</p>
<a href="{url}" style="color:#ffffff;font-size:15px;font-weight:bold;text-decoration:none;line-height:1.3;">{esc(name)}</a>
<p style="margin:4px 0 10px;color:{MUTED};font-size:12.5px;line-height:1.45;">{esc(line)}</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
<td style="font-family:{FONT};white-space:nowrap;">{price_html(p)}</td>
<td align="right" style="font-family:{FONT};"><a href="{url}" style="background-color:{MAGENTA};color:#ffffff;font-size:12px;font-weight:bold;padding:7px 11px;border-radius:6px;text-decoration:none;display:inline-block;white-space:nowrap;">Get it &rarr;</a></td>
</tr></table>
</td></tr></table>"""


bundle = by["blender-addons-bundle"]
b_now = float(bundle["price"].strip("$")); b_was = float(bundle["price_old"].strip("$"))
save = f"${b_was - b_now:.2f}"
per = f"{round(b_now / 106 * 100)}&cent;"
count = data["count"]

rows = []
for i in range(0, len(CARDS), 2):
    a, b = CARDS[i], CARDS[i + 1]
    rows.append(f'<tr><td width="50%" valign="top" style="padding:0 6px 12px 0;">{card(*a)}</td>'
                f'<td width="50%" valign="top" style="padding:0 0 12px 6px;">{card(*b)}</td></tr>')

H1 = f"color:#ffffff;font-family:{FONT};"
P = f"margin:0 0 14px;font-size:15px;line-height:1.6;color:{TEXT};font-family:{FONT};"
EYEBROW = f"margin:0 0 8px;font-size:12px;letter-spacing:2px;font-weight:bold;font-family:{FONT};"

content = f"""<div style="background:{BG};color:{TEXT};font-family:{FONT};max-width:640px;margin:auto;border:1px solid {LINE};border-radius:14px;overflow:hidden;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:{BG};">Every Blender Procedural add-on is 35% off until Dec 2, and the Ultimate Bundle gets you 106 products for ${b_now:.2f}.</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
<tr><td style="padding:20px 20px 12px;"><p style="{EYEBROW}color:{CYAN};">BLENDER PROCEDURAL &middot; CYBER SALE</p></td></tr>
<tr><td style="padding:0 20px;"><a href="{STORE}"><img src="{GIF}banner.gif" alt="Cyber Sale: 35% off everything, 27 Nov to 02 Dec" width="600" style="width:100%;max-width:600px;height:auto;display:block;border:0;border-radius:10px;"></a></td></tr>
<tr><td style="padding:26px 24px 4px;">
<h1 style="{H1}font-size:28px;line-height:1.25;margin:0 0 16px;">Everything is 35% off until December&nbsp;2</h1>
<p style="{P}">Hi there,</p>
<p style="{P}">The Superhive Cyber Sale is live, and every product in the Blender Procedural store is <strong style="color:#ffffff;">35% off</strong>. The discount is already in the price, so there is no code to type.</p>
<p style="{P}">Below you'll find the best deal in the store, then the add-ons people buy most, each with a short demo. Click any of them to open it on Superhive.</p>
</td></tr>
<tr><td align="center" style="padding:6px 24px 34px;">{button(STORE, "Shop the Cyber Sale &rarr;")}</td></tr>

<tr><td style="padding:0 20px;"><div style="border-top:1px solid {LINE};font-size:0;line-height:0;">&nbsp;</div></td></tr>
<tr><td style="padding:28px 24px 14px;">
<p style="{EYEBROW}color:{MAGENTA};">&#128293; BEST VALUE</p>
<h2 style="{H1}font-size:24px;line-height:1.3;margin:0;">Ultimate Blender Addons Bundle: 106 products for ${b_now:.2f}</h2>
</td></tr>
<tr><td style="padding:0 20px;"><a href="{link('blender-addons-bundle')}"><img src="{GIF}bundle.gif" alt="Ultimate Blender Addons Bundle: 106 products, $119 now ${b_now:.2f}" width="560" style="width:100%;max-width:600px;height:auto;display:block;border:0;border-radius:10px;"></a></td></tr>
<tr><td style="padding:18px 24px 4px;">
<p style="{P}">One purchase unlocks a 100% off code for <strong style="color:#ffffff;">106 Blender Procedural products</strong>: everything released before the bundle and the add-ons released since, including many of the bestsellers below. That's about {per} per product.</p>
</td></tr>
<tr><td align="center" style="padding:4px 24px 6px;font-family:{FONT};">
<s style="color:{MUTED};font-size:22px;">${b_was:g}</s>&nbsp;&nbsp;<span style="color:#ffffff;font-size:38px;font-weight:bold;">${b_now:.2f}</span>&nbsp;&nbsp;<span style="background-color:{MAGENTA};color:#ffffff;font-size:14px;font-weight:bold;padding:4px 9px;border-radius:12px;vertical-align:middle;">{pct(bundle)}</span>
<p style="margin:6px 0 0;color:{GOLD};font-size:14px;font-weight:bold;font-family:{FONT};">You save {save}</p>
</td></tr>
<tr><td align="center" style="padding:18px 24px 36px;">{button(link('blender-addons-bundle'), f"Get the bundle for ${b_now:.2f} &rarr;")}</td></tr>

<tr><td style="padding:0 20px;"><div style="border-top:1px solid {LINE};font-size:0;line-height:0;">&nbsp;</div></td></tr>
<tr><td style="padding:28px 24px 16px;">
<p style="{EYEBROW}color:{CYAN};">&#127942; BESTSELLERS</p>
<h2 style="{H1}font-size:24px;line-height:1.3;margin:0 0 8px;">The add-ons Blender artists buy most</h2>
<p style="margin:0;font-size:14px;line-height:1.5;color:{MUTED};font-family:{FONT};">Recent hits and all-time favourites, all 35% off. Click a card to open it.</p>
</td></tr>
<tr><td style="padding:0 20px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:collapse;">
{chr(10).join(rows)}
</table>
</td></tr>

<tr><td style="padding:10px 20px 8px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-collapse:separate;background:{CARD};border:1px solid {VIOLET};border-radius:12px;">
<tr><td align="center" style="padding:26px 20px 28px;font-family:{FONT};">
<p style="margin:0 0 6px;color:{GOLD};font-size:13px;font-weight:bold;letter-spacing:2px;">&#9203; ENDS DECEMBER 2</p>
<p style="margin:0 0 18px;color:#ffffff;font-size:20px;font-weight:bold;line-height:1.35;">All {count} products in the store are 35% off until then.</p>
{button(STORE, f"Browse all {count} products &rarr;")}
</td></tr></table>
</td></tr>
<tr><td style="padding:22px 24px 26px;">
<p style="{P}margin-bottom:0;">Thank you for following Blender Procedural!<br><strong style="color:#ffffff;">Blender Procedural</strong></p>
</td></tr>
</table>
</div>
"""

subject = f"⚡ Cyber Sale: 35% off everything + 106 products for ${b_now:.2f}"
OUT.mkdir(parents=True, exist_ok=True)
(OUT / "content.html").write_text(content, encoding="utf-8")
(OUT / "subject.txt").write_text(subject, encoding="utf-8")
(OUT / "preview.html").write_text(
    f'<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">'
    f'<title>Cyber Sale email</title></head><body style="margin:0;padding:24px 8px;background:#e9e7f0;">'
    f'<p style="font:13px Arial;color:#555;max-width:640px;margin:0 auto 10px;"><b>Subject:</b> {esc(subject)}</p>'
    f'{content}</body></html>', encoding="utf-8")
(OUT / "preview_local.html").write_text((OUT / "preview.html").read_text(encoding="utf-8").replace(GIF, "out/"), encoding="utf-8")
print(f"content.html {len(content.encode())/1024:.1f} KB, {len(CARDS)} cards; subject: {subject}")
