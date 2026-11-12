// Builds the static README cards (banner, services, workflow, tech stack, contact) in desktop and mobile sizes.
// Run: node scripts/build-assets.mjs
import { writeFile } from 'node:fs/promises';
import { c, mono, text, textWidth, icon, tile, card, ping, delay, svg } from './theme.mjs';

const eyebrow = (x, y, value, size = 11.5) => text(x, y, value, { size, weight: 700, fill: c.teal, font: mono, ls: 1.4 });

function chips(x, y, labels, { size = 13, pad = 26, gap = 8, height = 28 } = {}) {
  let left = x;
  return labels.map(label => {
    const width = textWidth(label, size) + pad;
    const chip = `<g transform="translate(${left} ${y})"><rect width="${width}" height="${height}" rx="${height / 2}" fill="${c.card}" stroke="${c.line}"/>${text(width / 2, height / 2 + size * 0.36, label, { size, weight: 600, anchor: 'middle' })}</g>`;
    left += width + gap;
    return chip;
  }).join('');
}

/* ---------- Banner ---------- */

const focus = ['Integrasi API', 'Otomatisasi', 'Pelaporan', 'Pelatihan'];
const tagline = 'BUSINESS SYSTEMS · DATA · AUTOMATION';

function banner() {
  const satellites = [
    { x: 852, y: 96, icon: 'app', label: 'APLIKASI' }, { x: 852, y: 264, icon: 'table', label: 'EXCEL' },
    { x: 1118, y: 96, icon: 'database', label: 'DATABASE' }, { x: 1118, y: 264, icon: 'chart', label: 'LAPORAN' },
  ];
  const wires = ['M882 96C915 96 904 164 937 164', 'M882 264C915 264 904 196 937 196', 'M1033 164C1066 164 1055 96 1088 96', 'M1033 196C1066 196 1055 264 1088 264'];
  const css = `.march{stroke-dasharray:.01 18;animation:march 1.5s linear infinite}
@keyframes march{to{stroke-dashoffset:-18.01}}
.spin{transform-origin:985px 180px;animation:spin 90s linear infinite}
@keyframes spin{to{transform:rotate(360deg)}}
.hub{transform-box:fill-box;transform-origin:center;animation:hub 3.2s ease-out infinite}
@keyframes hub{0%{transform:scale(1);opacity:.5}70%,to{transform:scale(1.45);opacity:0}}`;
  const body = `<g fill="none" stroke="#7fd0e6">
<circle cx="985" cy="180" r="100" stroke-opacity=".12"/>
<circle cx="985" cy="180" r="157" stroke-opacity=".22" stroke-dasharray="2 10" class="spin"/>
</g>
${wires.map((d, i) => `<path d="${d}" fill="none" stroke="#2c5d7a" stroke-width="1.2"/><path d="${d}" fill="none" stroke="${i < 2 ? c.blue : c.teal}" stroke-width="3" stroke-linecap="round" class="march"${delay(-i * 0.4)}/>`).join('\n')}
<rect x="937" y="132" width="96" height="96" rx="26" fill="none" stroke="${c.teal}" stroke-width="1.5" class="hub"/>
<rect x="937" y="132" width="96" height="96" rx="26" fill="url(#cf)" stroke="url(#ac)" stroke-width="1.5"/>
${icon('link', 967, 162, 36, c.text, 1.8)}
${text(985, 254, 'ACCURATE ONLINE', { size: 10.5, weight: 700, fill: c.teal, anchor: 'middle', font: mono, ls: 1 })}
${satellites.map(s => `<rect x="${s.x - 30}" y="${s.y - 30}" width="60" height="60" rx="17" fill="${c.card}" stroke="url(#cs)"/>${icon(s.icon, s.x - 12, s.y - 12, 24)}${text(s.x, s.y + 49, s.label, { size: 10.5, fill: c.low, anchor: 'middle', font: mono, ls: 1 })}`).join('\n')}
<g class="in">
<rect x="56" y="44" width="346" height="30" rx="15" fill="${c.card}" stroke="${c.line}"/>
${ping(73, 59)}${text(88, 63.5, tagline, { size: 11.5, weight: 700, fill: '#b6e9ec', font: mono, ls: 1.4 })}
</g>
<g class="in"${delay(0.12)}>${text(54, 150, 'Lukman Bijak Bestari', { size: 56, weight: 700, fill: c.text, ls: -0.6 })}</g>
<g class="in"${delay(0.24)}>
${text(56, 193, 'Trainer Accurate Online & Developer Sistem Bisnis', { size: 21 })}
<rect x="56" y="218" width="72" height="3" rx="1.5" fill="url(#ac)" class="grow"/>
</g>
<g class="in"${delay(0.36)}>
${text(56, 261, 'Proses lebih jelas. Data lebih terhubung.', { size: 17, fill: '#d6e6f0' })}
${chips(56, 284, focus)}
</g>`;
  return svg(1200, 360, {
    title: 'Lukman Bijak Bestari',
    desc: 'Trainer Accurate Online dan developer sistem bisnis. Proses lebih jelas, data lebih terhubung. Fokus: integrasi API, otomatisasi, pelaporan, dan pelatihan.',
    css, body, radius: 24, glow: [985, 180, 330],
  });
}

function bannerMobile() {
  const body = `<g fill="none" stroke="#7fd0e6"><circle cx="404" cy="34" r="58" stroke-opacity=".14"/><circle cx="404" cy="34" r="96" stroke-opacity=".2" stroke-dasharray="2 10"/></g>
<g class="in">
<rect x="24" y="24" width="312" height="28" rx="14" fill="${c.card}" stroke="${c.line}"/>
${ping(40, 38, 3)}${text(53, 42, tagline, { size: 10.5, weight: 700, fill: '#b6e9ec', font: mono, ls: 1.2 })}
</g>
<g class="in"${delay(0.12)}>${text(23, 110, 'Lukman Bijak', { size: 42, weight: 700, fill: c.text, ls: -0.4 })}${text(23, 156, 'Bestari', { size: 42, weight: 700, fill: c.text, ls: -0.4 })}</g>
<g class="in"${delay(0.24)}>
<rect x="24" y="176" width="64" height="3" rx="1.5" fill="url(#ac)" class="grow"/>
${text(24, 212, 'Trainer Accurate Online', { size: 17, fill: '#c6dce8' })}${text(24, 236, 'Developer Sistem Bisnis', { size: 17, fill: '#c6dce8' })}
</g>
<g class="in"${delay(0.36)}>${chips(24, 258, focus, { size: 12, pad: 18, gap: 6, height: 26 })}</g>`;
  return svg(440, 308, { title: 'Lukman Bijak Bestari', desc: 'Trainer Accurate Online dan developer sistem bisnis.', body, glow: [404, 34, 190] });
}

/* ---------- What I Build ---------- */

const services = [
  { icon: 'app', title: 'Business Applications', lines: ['Aplikasi web untuk aktivitas operasional', 'dalam satu alur kerja yang terstruktur.'], mobile: ['Aplikasi web untuk aktivitas operasional', 'dalam alur kerja yang terstruktur.'], result: 'Pekerjaan harian lebih jelas' },
  { icon: 'link', title: 'Accurate Online Integrations', lines: ['Hubungkan Accurate Online dengan', 'aplikasi, Excel, dan platform lain.'], result: 'Data terhubung, input berulang berkurang', mobileResult: 'Input berulang berkurang' },
  { icon: 'chart', title: 'Reporting & Dashboards', lines: ['Laporan keuangan dan operasional', 'dalam tampilan yang mudah dipantau.'], mobile: ['Laporan keuangan dan operasional', 'yang mudah dipantau.'], result: 'Keputusan didukung data yang relevan', mobileResult: 'Keputusan didukung data relevan' },
  { icon: 'database', title: 'Data Processing Tools', lines: ['Validasi, rekonsiliasi, konversi,', 'dan pemindahan data antar sistem.'], result: 'Data lebih konsisten dan siap digunakan', mobileResult: 'Data konsisten dan siap digunakan' },
  { icon: 'zap', title: 'Workflow Automation', lines: ['Tugas terjadwal, sinkronisasi, dan pelaporan', 'berjalan dengan aturan validasi yang jelas.'], mobile: ['Tugas terjadwal, sinkronisasi,', 'dan pelaporan dengan validasi.'], result: 'Lebih sedikit langkah manual' },
];
const servicesDesc = 'Lima solusi: aplikasi bisnis untuk alur operasional yang jelas; integrasi Accurate Online untuk mengurangi input berulang; laporan dan dashboard untuk memantau kinerja; alat pengolahan data untuk data yang konsisten; dan otomatisasi workflow untuk mengurangi pekerjaan manual.';
const number = i => String(i + 1).padStart(2, '0');
const result = (x, y, value) => `<circle cx="${x + 9}" cy="${y}" r="9" fill="${c.teal}" fill-opacity=".14"/>${icon('check', x + 4, y - 5, 10, c.teal, 1.8)}${text(x + 27, y + 4.5, value, { size: 13.5, fill: '#a5e6dc' })}`;

function whatIBuild() {
  const css = `.sweep{animation:sweep 5s ease-in-out infinite}
@keyframes sweep{0%{transform:translateX(0);opacity:0}15%,85%{opacity:.85}to{transform:translateX(792px);opacity:0}}`;
  const small = services.slice(0, 4).map((s, i) => `<g transform="translate(${24 + (i % 2) * 486} ${24 + Math.floor(i / 2) * 166})"><g class="in"${delay(i * 0.09)}>
${card(466, 150)}
${tile(20, 20, 44, s.icon)}
${text(78, 40, s.title, { size: 19, weight: 700, fill: c.text })}${text(446, 38, number(i), { size: 12, fill: c.low, anchor: 'end', font: mono })}
${text(78, 64, s.lines[0], { size: 14.5 })}${text(78, 85, s.lines[1], { size: 14.5 })}
<path d="M20 105.5H446" stroke="${c.line}"/>
${result(20, 127, s.result)}
</g></g>`).join('\n');
  const s = services[4];
  const featured = `<g transform="translate(24 356)"><g class="in"${delay(0.36)}>
${card(952, 128, { featured: true })}
${tile(20, 20, 44, s.icon)}
${text(78, 40, s.title, { size: 19, weight: 700, fill: c.text })}${text(446, 38, number(4), { size: 12, fill: c.low, anchor: 'end', font: mono })}
${text(78, 64, s.lines[0], { size: 14.5, fill: '#c7dce6' })}${text(78, 85, s.lines[1], { size: 14.5, fill: '#c7dce6' })}
<path d="M476.5 22V90" stroke="#3a7189"/>
${eyebrow(506, 40, 'HASIL UNTUK TIM')}
${text(506, 66, 'Lebih sedikit langkah manual.', { size: 18, weight: 600, fill: c.text })}
${text(506, 89, 'Lebih banyak waktu untuk keputusan.', { size: 14.5 })}
<rect x="20" y="109" width="912" height="2" rx="1" fill="url(#ac)" opacity=".5"/>
<rect x="20" y="109" width="120" height="2" rx="1" fill="#eafcff" class="sweep" opacity="0"/>
</g></g>`;
  return svg(1000, 508, { title: 'What I Build — solusi sistem bisnis', desc: servicesDesc, css, body: `${small}\n${featured}` });
}

function whatIBuildMobile() {
  const body = services.map((s, i) => {
    const lines = s.mobile || s.lines;
    const featured = i === 4;
    return `<g transform="translate(20 ${20 + i * 168})"><g class="in"${delay(i * 0.09)}>
${card(400, 156, { featured })}
${tile(18, 18, 40, s.icon)}
${text(70, 44, s.title, { size: 18, weight: 700, fill: c.text })}
${text(18, 84, lines[0], { size: 15 })}${text(18, 106, lines[1], { size: 15 })}
<path d="M18 120.5H382" stroke="${featured ? '#3a7189' : c.line}"/>
${result(18, 138, s.mobileResult || s.result)}
</g></g>`;
  }).join('\n');
  return svg(440, 868, { title: 'What I Build — solusi sistem bisnis', desc: servicesDesc, body });
}

/* ---------- How I Work ---------- */

const steps = [
  { icon: 'search', title: 'Pahami proses', note: 'Kebutuhan & alur kerja' },
  { icon: 'link', title: 'Hubungkan sistem', note: 'Data & integrasi API' },
  { icon: 'zap', title: 'Otomatisasi', note: 'Validasi & sinkronisasi' },
  { icon: 'chart', title: 'Evaluasi hasil', note: 'Laporan & perbaikan' },
];
const workflowCss = (axis, distance) => `.draw{stroke-dasharray:${distance};animation:draw 1.8s ease-out both}
@keyframes draw{from{stroke-dashoffset:${distance}}}
.run{animation:run 6s linear infinite}
@keyframes run{0%{transform:translate${axis}(0);opacity:0}4%{opacity:1}75%{transform:translate${axis}(${distance}px);opacity:1}80%,to{transform:translate${axis}(${distance}px);opacity:0}}
.halo{transform-box:fill-box;transform-origin:center;opacity:0;animation:halo 6s ease-out infinite}
@keyframes halo{0%{transform:scale(1);opacity:.75}22%,to{transform:scale(1.75);opacity:0}}`;
// The runner reaches step i after i * 1.5s, so each halo fires as the runner arrives.
const node = (x, y, step, i, radius) => `<circle cx="${x}" cy="${y}" r="${radius}" fill="none" stroke="${c.teal}" stroke-width="1.5" class="halo"${delay(i * 1.5)}/>
<circle cx="${x}" cy="${y}" r="${radius}" fill="${c.card}" stroke="url(#ac)" stroke-width="1.5"/>${icon(step.icon, x - 10, y - 10, 20)}`;
const runner = (x, y) => `<g class="run" opacity="0"><circle cx="${x}" cy="${y}" r="9" fill="${c.teal}" fill-opacity=".22"/><circle cx="${x}" cy="${y}" r="3.5" fill="#dffaf5"/></g>`;
const workflowDesc = 'Empat tahap: pahami proses, hubungkan sistem, otomatisasi pekerjaan, evaluasi hasil.';

function workflow() {
  const xs = [125, 375, 625, 875], y = 68;
  const body = `<path d="M125 ${y}H875" stroke="${c.line}" stroke-width="2"/>
<path d="M125 ${y}H875" stroke="url(#ac)" stroke-width="2" stroke-opacity=".75" class="draw"/>
${runner(125, y)}
${steps.map((s, i) => `${node(xs[i], y, s, i, 24)}
${text(xs[i], 28, number(i), { size: 11.5, weight: 700, fill: c.teal, anchor: 'middle', font: mono, ls: 1 })}
${text(xs[i], 124, s.title, { size: 17.5, weight: 600, fill: c.text, anchor: 'middle' })}
${text(xs[i], 147, s.note, { size: 13.5, anchor: 'middle' })}`).join('\n')}`;
  return svg(1000, 174, { title: 'Dari proses bisnis menjadi solusi digital', desc: workflowDesc, css: workflowCss('X', 750), body, radius: 18, glow: [1000, 0, 260] });
}

function workflowMobile() {
  const x = 50, ys = [52, 134, 216, 298];
  // Gradient strokes need a non-zero bounding box, so the vertical line is drawn as a thin rect.
  const body = `<rect x="${x - 1}" y="52" width="2" height="246" fill="${c.line}"/>
<path d="M${x} 52V298" stroke="${c.blue}" stroke-width="2" stroke-opacity=".75" class="draw"/>
${runner(x, 52)}
${steps.map((s, i) => `${node(x, ys[i], s, i, 22)}
${text(92, ys[i] - 14, number(i), { size: 11, weight: 700, fill: c.teal, font: mono, ls: 1 })}
${text(92, ys[i] + 8, s.title, { size: 19, weight: 600, fill: c.text })}
${text(92, ys[i] + 29, s.note, { size: 14.5 })}`).join('\n')}`;
  return svg(440, 350, { title: 'Dari proses bisnis menjadi solusi digital', desc: workflowDesc, css: workflowCss('Y', 246), body, radius: 18, glow: [440, 0, 200] });
}

/* ---------- Tech Stack ---------- */

const stack = [
  { icon: 'code', title: 'Pengembangan aplikasi', short: 'Aplikasi', items: ['PHP', 'Laravel', 'JavaScript', 'HTML', 'CSS'] },
  { icon: 'database', title: 'Data & pelaporan', items: ['MySQL', 'PostgreSQL', 'SQL', 'Microsoft Excel', 'JasperReports'] },
  { icon: 'link', title: 'Integrasi', items: ['Accurate Online API', 'REST API', 'JSON', 'CSV'] },
  { icon: 'server', title: 'Infra & workflow', items: ['Linux', 'Nginx', 'Git', 'GitHub', 'Vercel'] },
];
const stackDesc = stack.map(group => `${group.title}: ${group.items.join(', ')}`).join('. ') + '.';

function techStack(mobile = false) {
  const width = mobile ? 192 : 229, height = 228;
  const body = stack.map((group, i) => {
    const x = mobile ? 20 + (i % 2) * 208 : 24 + i * 241;
    const y = mobile ? 20 + Math.floor(i / 2) * 244 : 24;
    return `<g transform="translate(${x} ${y})"><g class="in"${delay(i * 0.09)}>
${card(width, height)}
${tile(18, 18, 38, group.icon, { iconSize: 20 })}
${text(width - 18, 42, number(i), { size: 12, fill: c.low, anchor: 'end', font: mono })}
${text(18, 84, mobile && group.short || group.title, { size: 15, weight: 700, fill: c.text })}
<path d="M18 97.5H${width - 18}" stroke="${c.line}"/>
${group.items.map((item, row) => `<circle cx="22" cy="${116.5 + row * 23}" r="2.5" fill="url(#ac)"/>${text(34, 121 + row * 23, item, { size: 14 })}`).join('')}
</g></g>`;
  }).join('\n');
  return svg(mobile ? 440 : 1000, mobile ? 512 : 276, { title: 'Tech Stack', desc: stackDesc, body });
}

/* ---------- Let's Connect ---------- */

const connectCss = `.nudge{animation:nudge 1.8s ease-in-out infinite}
@keyframes nudge{50%{transform:translateX(5px)}}`;
const connectDesc = 'Ingin mengintegrasikan Accurate Online atau menyederhanakan proses bisnis Anda? Ceritakan alur kerja Anda dan bagian yang ingin diperbaiki. Chat via WhatsApp: 0812-8552-5538.';
function button(x, y, width, height) {
  const middle = x + width / 2;
  return `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="${height / 2}" fill="url(#ac)"/>
${icon('chat', middle - 100, y + height / 2 - 10, 20, c.ink, 2)}
${text(middle - 2, y + height / 2 + 5.5, 'Chat via WhatsApp', { size: 16, weight: 700, fill: c.ink, anchor: 'middle' })}
<g class="nudge">${icon('arrow', middle + 76, y + height / 2 - 9, 18, c.ink, 2.2)}</g>
${text(middle, y + height + 26, '0812-8552-5538', { size: 12.5, fill: c.low, anchor: 'middle', font: mono, ls: 1 })}`;
}

function connect() {
  const body = `<g class="in">
${ping(30, 39.5)}${eyebrow(44, 44, 'MARI BERDISKUSI')}
${text(24, 84, 'Ingin mengintegrasikan Accurate Online', { size: 25, weight: 700, fill: c.text, ls: -0.2 })}
${text(24, 116, 'atau menyederhanakan proses bisnis Anda?', { size: 25, weight: 700, fill: c.text, ls: -0.2 })}
${text(24, 149, 'Ceritakan alur kerja Anda dan bagian yang ingin diperbaiki.', { size: 15 })}
</g>
<g class="in"${delay(0.15)}>${button(704, 58, 268, 54)}</g>`;
  return svg(1000, 180, { title: 'Mari berdiskusi', desc: connectDesc, css: connectCss, body, glow: [860, 90, 300] });
}

function connectMobile() {
  const body = `<g class="in">
${ping(27, 39.5, 3)}${eyebrow(40, 44, 'MARI BERDISKUSI', 11)}
${text(20, 84, 'Ingin mengintegrasikan Accurate', { size: 23, weight: 700, fill: c.text, ls: -0.2 })}
${text(20, 113, 'Online atau menyederhanakan', { size: 23, weight: 700, fill: c.text, ls: -0.2 })}
${text(20, 142, 'proses bisnis Anda?', { size: 23, weight: 700, fill: c.text, ls: -0.2 })}
${text(20, 174, 'Ceritakan alur kerja Anda dan bagian', { size: 15 })}${text(20, 196, 'yang ingin diperbaiki.', { size: 15 })}
</g>
<g class="in"${delay(0.15)}>${button(20, 218, 400, 52)}</g>`;
  return svg(440, 318, { title: 'Mari berdiskusi', desc: connectDesc, css: connectCss, body, glow: [440, 318, 240] });
}

const files = {
  'profile-banner.svg': banner(), 'profile-banner-mobile.svg': bannerMobile(),
  'what-i-build.svg': whatIBuild(), 'what-i-build-mobile.svg': whatIBuildMobile(),
  'workflow.svg': workflow(), 'workflow-mobile.svg': workflowMobile(),
  'tech-stack.svg': techStack(), 'tech-stack-mobile.svg': techStack(true),
  'connect.svg': connect(), 'connect-mobile.svg': connectMobile(),
};
await Promise.all(Object.entries(files).map(([name, content]) => writeFile(new URL(`../assets/${name}`, import.meta.url), content)));
console.log(`Built ${Object.keys(files).length} assets`);
