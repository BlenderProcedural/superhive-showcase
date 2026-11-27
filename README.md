# Blender Procedural – Superhive Showcase

A self-updating storefront widget for the [Blender Procedural store on Superhive](https://superhivemarket.com/creators/pamir-bal).
Each product description embeds it with an iframe, so a visitor who opens one product finds the store's best work.

**Live:** https://blenderprocedural.github.io/superhive-showcase/

## What it shows

- **Header:** the store's avatar and name, the live product count, and a *Visit the store* button.
- **Hero:** the *Ultimate Blender Addons Bundle*, large, with its live price, discount, savings, sales count, rating and a
  *Get the bundle* button.
- **Bestsellers:** a curated rail of the store's best-selling products, ranked, with sales and sale badges. It scrolls
  gently on its own and stops when the visitor uses it; the arrows step through it.
- **Links:** every link opens on Superhive in the same tab (`target="_top"`), so the visitor stays in the store.

Only the products listed in `config.json` are shown. Everything else stays reachable through *Visit the store*.

### Sale mode

When Superhive runs a site-wide sale, the widget switches to sale mode by itself. The sync reads the sale from the
banner at the top of the store (for example *Cyber Sale now LIVE through 02 Dec!*). Sale mode adds:

- a neon theme;
- *Cyber Sale is live* above the store name and *35% off everything · ends Dec 2* under it;
- a days-left counter and a *Shop the sale* button;
- a sale ribbon on the hero.

The widget returns to normal after the end date, or as soon as the banner is gone. To force a sale, or name one
the banner doesn't show, add `"event": {"name": "Spring Sale", "ends": "2027-03-05"}` to `config.json`.

## Embed in a Superhive product description

Paste this at the end of the description in code view. Replace `THIS-PRODUCT-SLUG` with the product's slug, the
last part of its URL, so the widget doesn't advertise the page it is on:

```html
<iframe src="https://blenderprocedural.github.io/superhive-showcase/?exclude=THIS-PRODUCT-SLUG"
  title="More from Blender Procedural" width="100%" height="580" frameborder="0"
  style="width:100%;height:auto;aspect-ratio:760/560;border:0;display:block"></iframe>
```

The widget scales with its width, so the `aspect-ratio` keeps the iframe exactly as tall as the widget at any
column width. Superhive keeps this style; `height` is only a fallback.

| Option | Example | Effect |
|---|---|---|
| `exclude` | `?exclude=mechify` or `?exclude=a,b` | Hides these products; on the bundle's own page the next hero takes its place |
| `theme` | `?theme=light` | Light colour scheme |

## How it stays up to date

`.github/workflows/sync.yml` runs `scripts/sync.py` every 3 hours and on demand (Actions > *Sync products from
Superhive* > *Run workflow*). A run that finds nothing new commits nothing. The script:

1. reads the public store pages, with no login needed;
2. takes each product's title, price, sale price, badge, category and image;
3. opens the page of every hero and pick product for its sales count, rating and large image;
4. writes `data/products.json`.

GitHub Pages republishes the widget after each commit.

If a run finds far fewer products than the last good file, it keeps the old data and fails, so a site hiccup
never empties the widget. If one product page can't be read, that product keeps yesterday's numbers.

## Settings

`config.json`:

- **creator_slug:** the store to read.
- **tagline:** the line under the store name.
- **hero:** the big product on top. The first entry that isn't the current page is shown. Each entry has `slug`,
  `headline` (wrap words in `*stars*` to colour them), `kicker`, `eyebrow` and `cta`.
- **picks:** the product slugs, in order, for the bestseller rail. Add or remove slugs here to change what is shown.
- **new_days:** a pick published within this many days gets the *New* badge.

Star ratings appear only when they help (4.0 or more, from at least 3 reviews).

To run the sync locally: `python scripts/sync.py`. It uses only the standard library.
