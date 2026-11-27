// Which demo GIF (or gallery stills) each email card uses, ordered by the last three months' sales.
const A = 'https://assets.superhivemarket.com/cache/';
const P = 'https://assets.superhivemarket.com/store/productimage/';
const S = 'https://assets.superhivemarket.com/store/product/';
const PW = 'https://blenderprocedural.github.io/plotwright/media/email/';
export const CARDS = [
  { slug: 'mechify', gif: A + 'f98a03b2719d9ce611ccfc725e9a5ffd.gif', start: 0.3, durMs: 2600 },
  { slug: 'ocean-physics-pro', gallery: [P + '1392102/image/xlarge-dbc1af47b2d804f42b219295bc23d9dc.jpeg', P + '1392196/image/xlarge-9b765e0f44c3af5ad4430ebea7553d58.jpeg', P + '1392126/image/xlarge-235412ea8e193b3c4ad23514179b18d1.jpeg'] },
  { slug: 'vehicle-physics-pro', gif: A + 'f5b479038aa8edb9f00aef4cc5a8ec04.gif', start: 0.25, durMs: 2400 },
  { slug: 'blend-online', gallery: [P + '1392058/image/xlarge-a3fc8da8e93c5773a7a85d36622ff2e2.png', P + '1392056/image/xlarge-e5167b224524d912970bd0a5c10e0ae7.png', P + '1392057/image/xlarge-42493f232f95711177d0a126a2edfc52.png'] },
  { slug: 'lithos-terrain', cover: S + '271297/image/xlarge-4f0c354ed87a010821eb16013fdb1b43.png', gallery: [P + '1425747/image/xlarge-12bae1238a15bda6ba06e8af1e616715.jpeg', P + '1425745/image/xlarge-ab7f0d4da1bf73bb2b8fb7818933b621.jpeg', P + '1425742/image/xlarge-fac6e1d3363663742a1b8d18b731ab95.jpeg'] },
  { slug: 'playrig', cover: S + '267370/image/xlarge-a8ae5507a4ca75970e0adfaeb5764cc5.png', gif: A + '843b08e307ae2e7ab7028cc9eb6660c1.gif', start: 0.1 },
  { slug: 'auto-painter-ai', gif: A + '768aad43300a41cb0489aea2bd90cac2.gif', start: 0.3 },
  { slug: 'plotwright', cover: S + '272010/image/xlarge-8def34fbe59e6e787e3836da724ace05.jpeg', gif: PW + 'email-plan.gif', start: 0.15, durMs: 2400 },
  { slug: 'blenderailibrary', gif: A + '778e48ac91a5d660fe6d3fdaad03db9c.gif', start: 0.0 },
  { slug: 'video-depth-ai', gif: A + '1445c9ae03843ba5789d3911d67b148d.gif', start: 0.05, zoom: 1.25, fx: 0.3 },
  { slug: 'easy-wake', gif: A + '1cc4f5b24ae8f401c98a66886b0d145b.gif', start: 0.4 },
  { slug: 'bp-geogen-ultimate-generators-bundle', gif: A + '3d3d1cd17d9ccbbabf3bcb373f825bf5.gif', start: 0.2, zoom: 1.3, fx: 0.3 },
];
// Only products the bundle's code unlocks.
export const BUNDLE_CLIPS = [
  { label: 'BP GeoGen Generators', gif: A + '3d3d1cd17d9ccbbabf3bcb373f825bf5.gif', start: 0.2, zoom: 1.3, fx: 0.3 },
  { label: 'Auto Painter AI', gif: A + '768aad43300a41cb0489aea2bd90cac2.gif', start: 0.35 },
  { label: 'Blender AI Library Pro', gif: A + '778e48ac91a5d660fe6d3fdaad03db9c.gif', start: 0.1 },
  { label: 'Video Depth AI', gif: A + '1445c9ae03843ba5789d3911d67b148d.gif', start: 0.08, zoom: 1.25, fx: 0.3 },
  { label: 'Easy Wake', gif: A + '1cc4f5b24ae8f401c98a66886b0d145b.gif', start: 0.45 },
  { label: 'Fluffy Maker', gif: A + 'fb996567961761c856cbdc831ca847db.gif', start: 0.6, zoom: 1.2, fx: 0.4 },
];
