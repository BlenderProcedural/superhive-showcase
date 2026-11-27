# Customer emails

Animated GIFs and the HTML for Superhive customer emails. The GIFs are served from GitHub Pages, for example
`https://blenderprocedural.github.io/superhive-showcase/email/cyber-2026/banner.gif`.

- `cyber-2026/`: the Cyber Sale 2026 email. `content.html` is pasted into *Email Customers* on Superhive (code view);
  `subject.txt` is its subject line.
- `tools/`: how the GIFs and the HTML were made.
  1. Run `python tools/mailsrv.py 8765` and open `http://localhost:8765/studio.html` in Chrome. The server caches
     the store's demo GIFs and saves what the page makes into `out/`.
  2. In the page's console, `await import('./makers.js')` gives `banner()`, `bundle()` and `card()`; `cards.js`
     lists which demo GIF each product card uses. Cards shrink themselves (shorter clip, fewer colours) to stay
     under 300 KB.
  3. `python tools/build_email.py <this repo> <out dir>` writes `content.html`, `subject.txt` and a preview, with the
     prices from `data/products.json`.
