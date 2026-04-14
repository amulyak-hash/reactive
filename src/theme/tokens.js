// Design tokens — aligned with Enterprise Brain reactive reference
export const C = {
  bg:     '#050914',
  bgSoft: '#070c17',
  panel:  'rgba(7, 12, 23, 0.94)',
  panelStrong: 'rgba(10, 16, 29, 0.98)',
  sf:     'rgba(12, 20, 32, 0.96)',
  sfAlt:  'rgba(17, 27, 40, 0.96)',
  line:   'rgba(109, 123, 156, 0.12)',
  lineStrong: 'rgba(109, 123, 156, 0.2)',
  bd:     'rgba(109, 123, 156, 0.14)',

  blue:   '#5c83ff',
  cyan:   '#29cfd6',
  teal:   '#29cfd6',
  tealSoft: 'rgba(41, 207, 214, 0.14)',
  gold:   '#9eb2ff',
  goldSoft: 'rgba(158, 178, 255, 0.12)',
  orange: '#F0813A',
  red:    '#F06060',
  green:  '#34D399',
  purple: '#A78BFA',
  amber:  '#FBBF24',

  t1:     '#f5f7fb',
  t2:     'rgba(245, 247, 251, 0.72)',
  t3:     'rgba(156, 163, 175, 0.9)',
  t4:     'rgba(245, 247, 251, 0.45)',
};

export const FONT_SANS  = "'Satoshi', 'Manrope', 'Segoe UI', sans-serif";
export const FONT_SERIF = "'Satoshi', 'Manrope', 'Segoe UI', sans-serif";
export const FONT_MONO  = "'SFMono-Regular', Consolas, 'Liberation Mono', monospace";

export const EASE = 'cubic-bezier(.22, 1, .36, 1)';

export const rgb = (hex, alpha = 1) => {
  if (hex.startsWith('rgba')) return hex;
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const lerp = (a, b, t) => a + (b - a) * t;
