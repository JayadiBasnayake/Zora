import { stationById } from '../data/network';

export interface Point {
  x: number;
  y: number;
}

export const pathPoints = (ids: string[]): Point[] =>
ids.map((id) => {
  const s = stationById(id);
  return { x: s.x, y: s.y };
});

export const toPolyline = (ids: string[]): string =>
pathPoints(ids).
map((p) => `${p.x},${p.y}`).
join(' ');

const dist = (a: Point, b: Point) => Math.hypot(b.x - a.x, b.y - a.y);

/** Position and heading at a normalised distance t (0–1) along a polyline. */
export function pointAt(ids: string[], t: number): {x: number;y: number;angle: number;} {
  const pts = pathPoints(ids);
  if (pts.length < 2) return { x: pts[0]?.x ?? 0, y: pts[0]?.y ?? 0, angle: 0 };

  const segs = pts.slice(1).map((p, i) => dist(pts[i], p));
  const total = segs.reduce((a, b) => a + b, 0);
  let target = Math.max(0, Math.min(1, t)) * total;

  for (let i = 0; i < segs.length; i++) {
    if (target <= segs[i] || i === segs.length - 1) {
      const ratio = segs[i] === 0 ? 0 : target / segs[i];
      const a = pts[i];
      const b = pts[i + 1];
      return {
        x: a.x + (b.x - a.x) * ratio,
        y: a.y + (b.y - a.y) * ratio,
        angle: Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI
      };
    }
    target -= segs[i];
  }
  const last = pts[pts.length - 1];
  return { x: last.x, y: last.y, angle: 0 };
}

/** Ping-pong so vehicles shuttle back and forth along their line. */
export const oscillate = (v: number): number => {
  const m = v % 2;
  return m <= 1 ? m : 2 - m;
};