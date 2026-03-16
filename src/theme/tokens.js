export const C = {
  bg:     '#070B12',
  bgL:    '#0C1420',
  sf:     '#111B28',
  bd:     '#1C2D42',

  blue:   '#3B8BF6',
  cyan:   '#22D3EE',
  orange: '#F0813A',
  red:    '#F06060',
  green:  '#34D399',
  purple: '#A78BFA',
  amber:  '#FBBF24',

  t1:     '#F1F5F9',
  t2:     '#94A3B8',
  t3:     '#64748B',
  t4:     '#334155',
};

export const FONT_SERIF = "'Newsreader', serif";
export const FONT_SANS  = "'DM Sans', sans-serif";
export const FONT_MONO  = "'JetBrains Mono', monospace";

export const rgb = (hex, alpha = 1) => {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
};

export const lerp = (a, b, t) => a + (b - a) * t;

export const lerpC = (hex1, hex2, t) => {
  const parse = (h) => {
    h = h.replace('#', '');
    return [
      parseInt(h.substring(0, 2), 16),
      parseInt(h.substring(2, 4), 16),
      parseInt(h.substring(4, 6), 16),
    ];
  };
  const [r1, g1, b1] = parse(hex1);
  const [r2, g2, b2] = parse(hex2);
  const clamp = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(lerp(r1, r2, t));
  const g = clamp(lerp(g1, g2, t));
  const b = clamp(lerp(b1, b2, t));
  return `#${r.toString(16).padStart(2,'0')}${g.toString(16).padStart(2,'0')}${b.toString(16).padStart(2,'0')}`;
};
