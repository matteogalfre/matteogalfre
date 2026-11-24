// Generates the profile banner, in a light and a dark variant (assets/banner-*.svg).
// A git graph of my side projects, in the order they happened: PixelGuard first (2025), then
// SpotWave and its releases, PixelGuard's redesign, and Patrimo, still in progress (its head blinks).
// Run: node scripts/banner.mjs
import { writeFileSync, mkdirSync } from 'node:fs';

const THEMES = {
  light: { ink: '#1f2328', muted: '#59636e', rail: '#8c959f', bg: '#ffffff', tag: '#f6f8fa', tagLine: '#d1d9e0', pg: '#1a7f37', sw: '#0969da', pa: '#8250df' },
  dark: { ink: '#e6edf3', muted: '#9198a1', rail: '#6e7681', bg: '#0d1117', tag: '#161b22', tagLine: '#30363d', pg: '#3fb950', sw: '#58a6ff', pa: '#bc8cff' },
};
const SANS = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial, sans-serif";
const MONO = "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

const MAIN = 150; // main branch
const LOW = 104; // short-lived branches
const HIGH = 60; // SpotWave, a long-running branch

// Up from main to a lane, along it, and (optionally) back down to main.
const up = (x, y) => `M${x} ${MAIN} C${x + 14} ${MAIN} ${x + 10} ${y} ${x + 24} ${y}`;
const down = (x, y) => `C${x + 14} ${y} ${x + 10} ${MAIN} ${x + 24} ${MAIN}`;
const branch = (from, y, to, merge) => `${up(from, y)} L${merge ? to - 24 : to} ${y}${merge ? ' ' + down(to - 24, y) : ''}`;

function svg(t) {
  const anim = (cls, delay) => `class="${cls}" style="animation-delay:${delay}s"`;
  const path = (d, color, delay) => `<path ${anim('draw', delay)} d="${d}" fill="none" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
  const dot = (x, y, color, delay, r = 5.5, cls = 'pop') => `<circle ${anim(cls, delay)} cx="${x}" cy="${y}" r="${r}" fill="${t.bg}" stroke="${color}" stroke-width="3"/>`;
  const label = (x, y, text, color, delay) => `<text ${anim('pop', delay)} x="${x}" y="${y}" font-family="${MONO}" font-size="12" fill="${color}">${text}</text>`;
  const tag = (x, text, delay) =>
    `<g ${anim('pop', delay)}><rect x="${x - 20}" y="${MAIN + 16}" width="40" height="20" rx="10" fill="${t.tag}" stroke="${t.tagLine}"/><text x="${x}" y="${MAIN + 30}" text-anchor="middle" font-family="${MONO}" font-size="11" fill="${t.ink}">${text}</text></g>`;
  const merge = (x, color, text, delay) => dot(x, MAIN, color, delay, 6.5) + tag(x, text, delay + 0.15);

  const parts = [
    // main, then a dashed tail: the story goes on
    path(`M24 ${MAIN} H418`, t.rail, 0),
    `<path d="M428 ${MAIN} H500" fill="none" stroke="${t.rail}" stroke-width="3" stroke-linecap="round" stroke-dasharray="2 7"/>`,
    dot(24, MAIN, t.rail, 0),
    label(24, MAIN + 64, '2025', t.muted, 0.2),
    label(124, MAIN + 64, '2026', t.muted, 0.6),
    // PixelGuard v1.0 (January 2025)
    path(branch(34, LOW, 100, true), t.pg, 0.15),
    label(58, LOW - 16, 'pixelguard', t.pg, 0.35),
    dot(72, LOW, t.pg, 0.4),
    merge(100, t.pg, 'v1.0', 0.6),
    // SpotWave: a long-running branch, released on Google Play several times
    path(branch(138, HIGH, 404, true), t.sw, 0.7),
    label(162, HIGH - 16, 'spotwave', t.sw, 0.9),
    dot(182, HIGH, t.sw, 0.9),
    path(`M252 ${HIGH} ${down(252, HIGH)}`, t.sw, 1.2),
    dot(236, HIGH, t.sw, 1.1),
    merge(276, t.sw, 'v1.0', 1.4),
    dot(310, HIGH, t.sw, 1.5),
    path(`M326 ${HIGH} ${down(326, HIGH)}`, t.sw, 1.6),
    merge(350, t.sw, 'v1.3', 1.8),
    merge(404, t.sw, 'v1.4', 2.0),
    // PixelGuard's redesign (May 2026)
    path(branch(178, LOW, 226, true), t.pg, 1.0),
    dot(204, LOW, t.pg, 1.2),
    merge(226, t.pg, 'v2.0', 1.35),
    // Patrimo, in progress
    path(branch(418, LOW, 472, false), t.pa, 2.2),
    label(442, LOW - 16, 'patrimo · wip', t.pa, 2.4),
    dot(452, LOW, t.pa, 2.45),
    dot(472, LOW, t.pa, 2.6, 6.5, 'pop pulse'),
  ];

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 240" width="900" height="240" role="img" aria-label="A git graph of side projects: PixelGuard v1.0 in 2025, SpotWave released several times in 2026, PixelGuard v2.0, and Patrimo in progress.">
<style>
.draw{stroke-dasharray:600;animation:draw 1s ease-out both}
@keyframes draw{from{stroke-dashoffset:600}to{stroke-dashoffset:0}}
.pop{animation:pop .35s ease-out both}
@keyframes pop{from{opacity:0}to{opacity:1}}
.pulse{animation:pop .35s ease-out both,pulse 1.4s ease-in-out 3.2s infinite}
@keyframes pulse{0%,100%{opacity:1}50%{opacity:.25}}
@media (prefers-reduced-motion: reduce){.draw,.pop,.pulse{animation:none}}
</style>
${parts.join('\n')}
<text x="566" y="106" font-family="${SANS}" font-size="30" font-weight="700" fill="${t.ink}">I build apps</text>
<text x="566" y="142" font-family="${SANS}" font-size="30" font-weight="700" fill="${t.ink}">and give them away.</text>
<text x="568" y="172" font-family="${MONO}" font-size="12" fill="${t.muted}">android · react native · python</text>
</svg>
`;
}

mkdirSync(new URL('../assets/', import.meta.url), { recursive: true });
for (const [name, theme] of Object.entries(THEMES)) {
  writeFileSync(new URL(`../assets/banner-${name}.svg`, import.meta.url), svg(theme));
}
console.log('assets/banner-light.svg, assets/banner-dark.svg');
