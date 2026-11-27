export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const pad = (n) => String(n).padStart(2, '0');
// tiny seeded RNG so every cloth's grain is stable between reloads
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// pick the readable text colour for a given background: dark brown ink or warm cream
const lum = (hex) => {
  const n = parseInt(hex.replace('#', ''), 16);
  const f = (c) => { c /= 255; return c <= .03928 ? c / 12.92 : Math.pow((c + .055) / 1.055, 2.4); };
  return .2126 * f((n >> 16) & 255) + .7152 * f((n >> 8) & 255) + .0722 * f(n & 255);
};
export function inkFor(bg, dark = '#21130b', light = '#f6eee3') {
  const L = lum(bg), cd = (L + .05) / (lum(dark) + .05), cl = (lum(light) + .05) / (L + .05);
  return cd >= cl ? dark : light;
}
