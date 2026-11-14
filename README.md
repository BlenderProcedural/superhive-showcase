# Blender Procedural – Superhive Showcase

A self-updating storefront widget for the [Blender Procedural store on Superhive](https://superhivemarket.com/creators/pamir-bal).
Each product description embeds it with an iframe, so a visitor who opens one product can find the others.

**Live:** https://blenderprocedural.github.io/superhive-showcase/

## What it shows

- **Header:** the store's avatar and name, the live product count, and a *Visit the store* button.
- **Spotlight:** bestsellers and new products rotate automatically. Each slide has a progress bar, dots and
  swipe support, and shows its badges (Bestseller, New, sale percentage, Free).
- **New releases:** the four newest products.
- **Filters:** All, Bestsellers, each category, On sale and Free, plus a search box.
- **Product rail:** every product as a card. The rail scrolls gently on its own and stops when the visitor uses it.
- **Links:** every link opens on Superhive in the same tab (`target="_top"`), so the visitor stays in the store.

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
| `exclude` | `?exclude=mechify` or `?exclude=a,b` | Hides these products everywhere |
| `theme` | `?theme=light` | Light colour scheme |

## How it stays up to date

`.github/workflows/sync.yml` runs `scripts/sync.py` every day and on demand (Actions > *Sync products from
Superhive* > *Run workflow*). The script:

1. reads the public store pages, with no login needed;
2. takes each product's title, price, sale price, badge, category and image;
3. writes `data/products.json`.

GitHub Pages republishes the widget after each commit.

If a run finds far fewer products than the last good file, it keeps the old data and fails, so a site hiccup
never empties the widget.

## Settings

`config.json`:

- **creator_slug:** the store to read.
- **tagline:** the line under the store name.
- **featured:** the product slugs, in order, that lead the spotlight and get the *Bestseller* badge.
- **new_count:** how many of the newest products get the *New* badge.

To run the sync locally: `python scripts/sync.py`. It uses only the standard library.
