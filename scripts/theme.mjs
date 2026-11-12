// Shared visual system for every SVG card in the profile README.
// SVGs are shown through <img>, so only system fonts, inline CSS and no scripts are available.

export const c = {
  bg0: '#06121f', bg1: '#0c2539', edge: '#1e3d56',
  card: '#0e273b', tile: '#143a52', line: '#234861', track: '#1a3d55',
  text: '#f2f8fc', mid: '#b7cbda', low: '#86a3b8',
  blue: '#45b9f7', teal: '#7ce4cf', ink: '#052033',
};
export const sans = "'Segoe UI', system-ui, -apple-system, 'Helvetica Neue', Arial, sans-serif";
export const mono = "ui-monospace, 'Cascadia Mono', 'SF Mono', Consolas, 'Liberation Mono', monospace";

export const esc = value => String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;');

// Rough text width for sizing pills; text is centred, so font differences stay symmetric.
export const textWidth = (value, size, ratio = 0.56) => Math.ceil(String(value).length * size * ratio);

export function text(x, y, value, { size = 14, weight, fill = c.mid, anchor, font, ls, attrs = '' } = {}) {
  return `<text x="${x}" y="${y}" font-size="${size}"${weight ? ` font-weight="${weight}"` : ''} fill="${fill}"${anchor ? ` text-anchor="${anchor}"` : ''}${font ? ` font-family="${font}"` : ''}${ls ? ` letter-spacing="${ls}"` : ''}${attrs}>${esc(value)}</text>`;
}

// 24x24 line icons (Lucide geometry, ISC licence).
const icons = {
  app: '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="M2 8h20M6 4v4M10 4v4"/>',
  link: '<path d="M8 3 4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>',
  chart: '<path d="M3 3v18h18M18 17V9M13 17V5M8 17v-3"/>',
  database: '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5v14a9 3 0 0 0 18 0V5M3 12a9 3 0 0 0 18 0"/>',
  zap: '<path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/>',
  code: '<path d="m16 18 6-6-6-6M8 6l-6 6 6 6"/>',
  server: '<rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><path d="M6 6h.01M6 18h.01"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  activity: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>',
  award: '<circle cx="12" cy="8" r="6"/><path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11"/>',
  book: '<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  star: '<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/>',
  fork: '<circle cx="12" cy="18" r="3"/><circle cx="6" cy="6" r="3"/><circle cx="18" cy="6" r="3"/><path d="M18 9v2c0 .6-.4 1-1 1H7c-.6 0-1-.4-1-1V9M12 12v3"/>',
  chat: '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22z"/>',
  arrow: '<path d="M5 12h14M12 5l7 7-7 7"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
};

export function icon(name, x, y, size = 22, color = c.teal, stroke = 1.7) {
  if (!icons[name]) throw new Error(`Unknown icon: ${name}`);
  const scale = size / 24;
  return `<g transform="translate(${x} ${y}) scale(${+scale.toFixed(4)})" fill="none" stroke="${color}" stroke-width="${+(stroke / scale).toFixed(2)}" stroke-linecap="round" stroke-linejoin="round">${icons[name]}</g>`;
}

// Rounded icon tile with a centred icon.
export function tile(x, y, size, name, { iconSize = Math.round(size / 2), color = c.teal } = {}) {
  const inset = (size - iconSize) / 2;
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${Math.round(size * 0.28)}" fill="${c.tile}" stroke="#25566f"/>${icon(name, x + inset, y + inset, iconSize, color)}`;
}

export function card(width, height, { featured = false, radius = 14 } = {}) {
  return `<rect width="${width}" height="${height}" rx="${radius}" fill="${featured ? 'url(#cf)' : c.card}" stroke="url(#${featured ? 'csf' : 'cs'})"/>`;
}

// Live indicator: solid dot with an expanding ring.
export const ping = (x, y, radius = 3.5) =>
  `<circle cx="${x}" cy="${y}" r="${radius}" fill="${c.teal}" class="ping"/><circle cx="${x}" cy="${y}" r="${radius}" fill="${c.teal}"/>`;

export const delay = seconds => ` style="animation-delay:${+seconds.toFixed(2)}s"`;

// Content stays visible when animation is unsupported or reduced: every base state is the final state.
const baseCss = `.in{animation:in .8s cubic-bezier(.2,.7,.2,1) both}
@keyframes in{from{opacity:0;transform:translateY(10px)}}
.ping{transform-box:fill-box;transform-origin:center;animation:ping 2.6s ease-out infinite}
@keyframes ping{0%{transform:scale(1);opacity:.55}70%,to{transform:scale(2.9);opacity:0}}
.grow{transform-box:fill-box;transform-origin:left center;animation:grow 1.1s cubic-bezier(.2,.7,.2,1) .3s both}
@keyframes grow{from{transform:scaleX(0)}}
@media(prefers-reduced-motion:reduce){*{animation:none!important}}`;

export function svg(width, height, { title, desc, css = '', body, radius = 20, glow = [width, 0, Math.round(Math.min(width, 900) * 0.42)] }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="title desc">
<title id="title">${esc(title)}</title>
<desc id="desc">${esc(desc)}</desc>
<defs>
<linearGradient id="bg" x2="1" y2="1"><stop stop-color="${c.bg0}"/><stop offset="1" stop-color="${c.bg1}"/></linearGradient>
<linearGradient id="ac" x2="1"><stop stop-color="${c.blue}"/><stop offset="1" stop-color="${c.teal}"/></linearGradient>
<linearGradient id="cs" x2="0" y2="1"><stop stop-color="#2f5d79"/><stop offset="1" stop-color="#1b3a51"/></linearGradient>
<linearGradient id="csf" x2="0" y2="1"><stop stop-color="#4f9bb0"/><stop offset="1" stop-color="#28607a"/></linearGradient>
<linearGradient id="cf" x2="1"><stop stop-color="#12364d"/><stop offset="1" stop-color="#0f2c42"/></linearGradient>
<radialGradient id="glow"><stop stop-color="#2f8fc0" stop-opacity=".3"/><stop offset="1" stop-color="#2f8fc0" stop-opacity="0"/></radialGradient>
<pattern id="dots" width="22" height="22" patternUnits="userSpaceOnUse"><circle cx="1.5" cy="1.5" r="1" fill="#a6d8ec" fill-opacity=".13"/></pattern>
<linearGradient id="fade" x1="1" y1="0" x2="0" y2="1"><stop stop-color="#fff"/><stop offset=".75" stop-color="#fff" stop-opacity=".1"/></linearGradient>
<mask id="fm"><rect width="${width}" height="${height}" fill="url(#fade)"/></mask>
<clipPath id="clip"><rect width="${width}" height="${height}" rx="${radius}"/></clipPath>
</defs>
<style>${baseCss}${css ? `\n${css}` : ''}</style>
<g clip-path="url(#clip)">
<rect width="${width}" height="${height}" fill="url(#bg)"/>
<rect width="${width}" height="${height}" fill="url(#dots)" mask="url(#fm)"/>
<circle cx="${glow[0]}" cy="${glow[1]}" r="${glow[2]}" fill="url(#glow)"/>
</g>
<rect x=".5" y=".5" width="${width - 1}" height="${height - 1}" rx="${radius - 0.5}" fill="none" stroke="${c.edge}"/>
<g font-family="${sans}">
${body}
</g>
</svg>
`;
}
