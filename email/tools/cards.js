// Which demo GIF (or gallery stills) each email card uses, in the order of the showcase widget's picks.
const A = 'https://assets.superhivemarket.com/cache/';
const P = 'https://assets.superhivemarket.com/store/productimage/';
export const CARDS = [
  { slug: 'mechify', gif: A + 'f98a03b2719d9ce611ccfc725e9a5ffd.gif', start: 0.3, durMs: 2600 },
  { slug: 'ocean-physics-pro', gallery: [P + '1392102/image/xlarge-dbc1af47b2d804f42b219295bc23d9dc.jpeg', P + '1392196/image/xlarge-9b765e0f44c3af5ad4430ebea7553d58.jpeg', P + '1392126/image/xlarge-235412ea8e193b3c4ad23514179b18d1.jpeg'] },
  { slug: 'vehicle-physics-pro', gif: A + 'f5b479038aa8edb9f00aef4cc5a8ec04.gif', start: 0.25, durMs: 2400 },
  { slug: 'blend-online', gallery: [P + '1392058/image/xlarge-a3fc8da8e93c5773a7a85d36622ff2e2.png', P + '1392056/image/xlarge-e5167b224524d912970bd0a5c10e0ae7.png', P + '1392057/image/xlarge-42493f232f95711177d0a126a2edfc52.png'] },
  { slug: 'autodepth-ai', gif: A + 'f50e6270aa95d8f6bb3d7125356f872a.gif', start: 0.06, durMs: 2000 },
  { slug: 'aquaflow-pro', gif: A + 'a84b1162e9587cbd6e7c5e004944b55d.gif', start: 0.2, durMs: 2200 },
  { slug: 'physics-placer', gif: A + '5eb01ef800426f2ca34bcb8997fe1ab2.gif', start: 0.1, zoom: 1.3, fx: 0.35 },
  { slug: 'blenderailibrary', gif: A + '778e48ac91a5d660fe6d3fdaad03db9c.gif', start: 0.0 },
  { slug: 'knitting-generator-addon', gallery: [P + '549500/image/4730cb8a59cd4c724720c63741efa6f4.jpg', P + '549501/image/7ead2e8e7564101f296c4f6f7a8d7246.jpg', P + '549502/image/3166155d7acd872af27a7e8ab6d62614.jpg'] },
  { slug: 'video-depth-ai', gif: A + '1445c9ae03843ba5789d3911d67b148d.gif', start: 0.05, zoom: 1.25, fx: 0.3 },
  { slug: 'auto-painter-ai', gif: A + '768aad43300a41cb0489aea2bd90cac2.gif', start: 0.3 },
  { slug: 'bp-geogen-ultimate-generators-bundle', gif: A + '3d3d1cd17d9ccbbabf3bcb373f825bf5.gif', start: 0.2, zoom: 1.3, fx: 0.3 },
  { slug: 'fluffy-maker', gif: A + 'fb996567961761c856cbdc831ca847db.gif', start: 0.0, durMs: 2000 },
  { slug: 'curve-fluids', gif: A + 'a4b4d8cce4e2774a949d66cdcd59e918.gif', start: 0.1 },
  { slug: 'easy-wake', gif: A + '1cc4f5b24ae8f401c98a66886b0d145b.gif', start: 0.4 },
  { slug: 'blender-inflate-addon----generate-dynamic-cloth-panels', short: 'blender-inflate', gif: A + 'c48ea605d412cea168585c02f0940854.gif', start: 0.2 },
];
export const BUNDLE_CLIPS = [
  { label: 'Aqua Flow Pro', gif: A + 'a84b1162e9587cbd6e7c5e004944b55d.gif', start: 0.25 },
  { label: 'BP GeoGen Generators', gif: A + '3d3d1cd17d9ccbbabf3bcb373f825bf5.gif', start: 0.2, zoom: 1.3, fx: 0.3 },
  { label: 'Curve Fluids', gif: A + 'a4b4d8cce4e2774a949d66cdcd59e918.gif', start: 0.15 },
  { label: 'Fluffy Maker', gif: A + 'fb996567961761c856cbdc831ca847db.gif', start: 0.6, zoom: 1.2, fx: 0.4 },
  { label: 'Auto Painter AI', gif: A + '768aad43300a41cb0489aea2bd90cac2.gif', start: 0.35 },
  { label: 'Easy Wake', gif: A + '1cc4f5b24ae8f401c98a66886b0d145b.gif', start: 0.45 },
];
