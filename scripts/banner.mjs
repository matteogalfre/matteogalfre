// Generates the profile banner, in a light and a dark variant (assets/banner-*.svg).
// A git graph of my side projects, in the order they came: each one branches off, gets a few
// commits and merges back with its latest version. The last one is still in progress: its head blinks.
// Run: node scripts/banner.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

const THEMES = {
  light: { ink: '#1f2328', muted: '#59636e', rail: '#8c959f', bg: '#ffffff', tag: '#f6f8fa', tagLine: '#d1d9e0', c: ['#1a7f37', '#0969da', '#8250df'] },
  dark: { ink: '#e6edf3', muted: '#9198a1', rail: '#6e7681', bg: '#0d1117', tag: '#161b22', tagLine: '#30363d', c: ['#3fb950', '#58a6ff', '#bc8cff'] },
};
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const MAIN_Y = 160;
const UP_Y = 96;
// from: where the branch leaves main, commits: along the branch, merge: back on main (null = still open).
const BRANCHES = [
  { name: 'pixelguard', from: 56, commits: [92, 124], merge: 162, tag: 'v2.0', t: 0.3 },
  { name: 'spotwave', from: 176, commits: [212, 244], merge: 282, tag: 'v1.4', t: 1.1 },
  { name: 'patrimo', from: 296, commits: [332, 364], head: 396, merge: null, t: 1.9 },
];

function branchPath(b) {
  const end = b.merge ?? b.head;
  const out = `M${b.from} ${MAIN_Y} C${b.from + 18} ${MAIN_Y} ${b.from + 12} ${UP_Y} ${b.from + 30} ${UP_Y}`;
  const along = `L${b.merge ? b.merge - 30 : end} ${UP_Y}`;
  const back = b.merge ? ` C${b.merge - 12} ${UP_Y} ${b.merge - 18} ${MAIN_Y} ${b.merge} ${MAIN_Y}` : '';
  return out + along + back;
}

function svg(t) {
  const dot = (x, y, color, delay, r = 5.5, cls = 'pop') =>
    `<circle class="${cls}" style="animation-delay:${delay}s" cx="${x}" cy="${y}" r="${r}" fill="${t.bg}" stroke="${color}" stroke-width="3"/>`;
  const branches = BRANCHES.map((b, i) => {
    const color = t.c[i];
    const parts = [
      `<path class="draw" style="animation-delay:${b.t}s" d="${branchPath(b)}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`,
      `<text class="pop" style="animation-delay:${b.t + 0.3}s" x="${b.from + 30}" y="${UP_Y - 16}" font-family="${MONO}" font-size="12" fill="${color}">${b.name}${b.merge ? '' : ' · wip'}</text>`,
      ...b.commits.map((x, k) => dot(x, UP_Y, color, b.t + 0.25 + k * 0.15)),
    ];
    if (b.merge) {
      parts.push(dot(b.merge, MAIN_Y, color, b.t + 0.7, 6.5));
      parts.push(
        `<g class="pop" style="animation-delay:${b.t + 0.85}s"><rect x="${b.merge - 20}" y="${MAIN_Y + 16}" width="40" height="20" rx="10" fill="${t.tag}" stroke="${t.tagLine}"/><text x="${b.merge}" y="${MAIN_Y + 30}" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${t.ink}">${b.tag}</text></g>`
      );
    } else {
      parts.push(dot(b.head, UP_Y, color, b.t + 0.6, 6.5, 'pop pulse'));
    }
    return parts.join('\n');
  }).join('\n');

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 240" width="880" height="240" role="img" aria-label="A git graph of side projects: PixelGuard v2.0, SpotWave v1.4, and Patrimo in progress.">
<style>
.draw{stroke-dasharray:420;animation:draw .9s ease-out both}
@keyframes draw{from{stroke-dashoffset:420}to{stroke-dashoffset:0}}
.pop{animation:pop .35s ease-out both}
@keyframes pop{from{opacity:0}to{opacity:1}}
.pulse{animation:pop .35s ease-out both,pulse 1.4s ease-in-out 3s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@media (prefers-reduced-motion: reduce){.draw,.pop,.pulse{animation:none}}
</style>
<path class="draw" style="animation-delay:0s" d="M28 ${MAIN_Y} H430" fill="none" stroke="${t.rail}" stroke-width="3" stroke-linecap="round"/>
<path d="M440 ${MAIN_Y} H468" fill="none" stroke="${t.rail}" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 7"/>
<text class="pop" style="animation-delay:.2s" x="28" y="${MAIN_Y + 30}" font-family="${MONO}" font-size="12" fill="${t.muted}">main</text>
${dot(28, MAIN_Y, t.rail, 0)}
${branches}
<text x="508" y="104" font-family="${SANS}" font-size="30" font-weight="700" fill="${t.ink}">I build apps</text>
<text x="508" y="140" font-family="${SANS}" font-size="30" font-weight="700" fill="${t.ink}">and give them away.</text>
<text x="510" y="170" font-family="${MONO}" font-size="12" fill="${t.muted}">android · react native · python</text>
</svg>
`;
}

mkdirSync(new URL('../assets/', import.meta.url), { recursive: true });
for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(new URL(`../assets/banner-${name}.svg`, import.meta.url), svg(theme));
}
console.log('assets/banner-light.svg, assets/banner-dark.svg');
