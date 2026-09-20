// Real-world geography for Sri Lanka.
// Every place on the map (network stations AND the new real-world landmarks)
// is projected from the SAME lat/lon bounding box as the coastline outline
// below, so the dots always line up correctly on the island shape.

export interface LatLon {
  lat: number;
  lon: number;
}

// Sri Lanka's approximate bounding box (Point Pedro in the north to Dondra
// Head in the south; the west/east coast extremes).
export const SL_BOUNDS = { minLat: 5.85, maxLat: 9.9, minLon: 79.6, maxLon: 81.95 };

// Portrait viewBox that matches Sri Lanka's real north-south / east-west
// aspect ratio (~450km tall, ~250km wide).
export const MAP_VIEWBOX = { width: 560, height: 1000 };

export function project({ lat, lon }: LatLon, viewBox: { width: number; height: number } = MAP_VIEWBOX) {
  const { minLat, maxLat, minLon, maxLon } = SL_BOUNDS;
  const x = ((lon - minLon) / (maxLon - minLon)) * viewBox.width;
  const y = ((maxLat - lat) / (maxLat - minLat)) * viewBox.height;
  return { x, y };
}

export function haversineKm(a: LatLon, b: LatLon): number {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLon = ((b.lon - a.lon) * Math.PI) / 180;
  const la1 = (a.lat * Math.PI) / 180;
  const la2 = (b.lat * Math.PI) / 180;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// Simplified real coastline of Sri Lanka, clockwise from Point Pedro (the
// northern tip). This is a hand-simplified outline (not survey-grade
// GeoJSON) intended for a legible illustrative map — swap in a precise
// GeoJSON coastline here if pixel-perfect accuracy is ever required.
export const SRI_LANKA_COASTLINE: LatLon[] = [
{ lat: 9.835, lon: 80.235 }, // Point Pedro
{ lat: 9.79, lon: 80.17 }, // Valvettithurai
{ lat: 9.72, lon: 80.02 }, // Jaffna town (north)
{ lat: 9.6, lon: 79.98 }, // Jaffna peninsula west
{ lat: 9.35, lon: 80.1 }, // Elephant Pass causeway
{ lat: 9.27, lon: 80.81 }, // Mullaitivu
{ lat: 9.05, lon: 80.95 }, // Nayaru lagoon
{ lat: 8.7, lon: 81.1 }, // approach to Trincomalee
{ lat: 8.55, lon: 81.15 }, // Trincomalee inner bay
{ lat: 8.58, lon: 81.28 }, // Trincomalee headland
{ lat: 8.2, lon: 81.4 }, // Kuchchaveli-Kalkudah coast
{ lat: 7.93, lon: 81.55 }, // Kalkudah
{ lat: 7.72, lon: 81.7 }, // Batticaloa
{ lat: 7.42, lon: 81.82 }, // Kalmunai
{ lat: 6.95, lon: 81.85 }, // Pottuvil
{ lat: 6.84, lon: 81.83 }, // Arugam Bay
{ lat: 6.55, lon: 81.7 }, // Yala coast
{ lat: 6.36, lon: 81.52 }, // Kirinda
{ lat: 6.12, lon: 81.13 }, // Hambantota
{ lat: 6.02, lon: 80.8 }, // Tangalle
{ lat: 5.92, lon: 80.59 }, // Dondra Head (southern tip)
{ lat: 5.95, lon: 80.54 }, // Matara
{ lat: 5.97, lon: 80.43 }, // Weligama
{ lat: 6.03, lon: 80.22 }, // Galle
{ lat: 6.14, lon: 80.1 }, // Hikkaduwa
{ lat: 6.42, lon: 80.0 }, // Bentota
{ lat: 6.585, lon: 79.96 }, // Kalutara
{ lat: 6.77, lon: 79.88 }, // Moratuwa
{ lat: 6.93, lon: 79.845 }, // Colombo
{ lat: 7.21, lon: 79.835 }, // Negombo
{ lat: 7.58, lon: 79.795 }, // Chilaw
{ lat: 8.03, lon: 79.79 }, // Puttalam lagoon (inward notch)
{ lat: 8.23, lon: 79.72 }, // Kalpitiya peninsula (bulge)
{ lat: 8.5, lon: 79.8 }, // Mannar coast approach
{ lat: 8.98, lon: 79.86 }, // Mannar Island tip
{ lat: 9.05, lon: 79.95 }, // Mannar mainland
{ lat: 9.35, lon: 80.1 }, // Vidattaltivu
{ lat: 9.6, lon: 79.98 }, // Jaffna peninsula west (rejoin)
{ lat: 9.835, lon: 80.235 } // close loop at Point Pedro
];


/** Turns a closed ring of lat/lon points into a smooth SVG path string. */
export function coastlinePath(points: LatLon[] = SRI_LANKA_COASTLINE, viewBox = MAP_VIEWBOX): string {
  const pts = points.map((p) => project(p, viewBox));
  if (pts.length < 3) return '';
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)} `;
  for (let i = 0; i < pts.length; i++) {
    const curr = pts[i];
    const next = pts[(i + 1) % pts.length];
    const midX = (curr.x + next.x) / 2;
    const midY = (curr.y + next.y) / 2;
    d += `Q ${curr.x.toFixed(1)} ${curr.y.toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)} `;
  }
  d += 'Z';
  return d;
}

export const sriLankaRivers: LatLon[][] = [
  [{ lat: 7.29, lon: 80.63 }, { lat: 7.55, lon: 80.76 }, { lat: 7.92, lon: 80.91 }, { lat: 8.58, lon: 81.21 }],
  [{ lat: 7.29, lon: 80.63 }, { lat: 7.13, lon: 80.36 }, { lat: 6.93, lon: 79.84 }],
  [{ lat: 7.49, lon: 80.36 }, { lat: 7.2, lon: 80.3 }, { lat: 6.68, lon: 80.4 }, { lat: 6.05, lon: 80.22 }]
];

export const sriLankaRelief: LatLon[][] = [
  [{ lat: 8.3, lon: 80.4 }, { lat: 7.8, lon: 80.55 }, { lat: 7.29, lon: 80.63 }, { lat: 6.95, lon: 80.79 }, { lat: 6.68, lon: 80.83 }],
  [{ lat: 7.95, lon: 80.76 }, { lat: 7.55, lon: 80.72 }, { lat: 7.0, lon: 80.95 }, { lat: 6.68, lon: 81.05 }],
  [{ lat: 7.3, lon: 80.63 }, { lat: 7.0, lon: 80.45 }, { lat: 6.68, lon: 80.4 }, { lat: 6.3, lon: 80.28 }]
];

export interface RealPlace {
  id: string;
  name: string;
  lat: number;
  lon: number;
  kind: 'city' | 'town' | 'landmark';
}

// Real Sri Lankan places added purely for geographic realism. These sit
// alongside (not replacing) the existing fictional-future network stations
// in data/network.ts, so the map reads as "the real island" with both the
// 2100 network AND real towns/landmarks visible.
export const realPlaces: RealPlace[] = [
{ id: 'RL-GAL', name: 'Galle', lat: 6.0535, lon: 80.221, kind: 'city' },
{ id: 'RL-MAT', name: 'Matara', lat: 5.9549, lon: 80.555, kind: 'town' },
{ id: 'RL-JAF', name: 'Jaffna', lat: 9.6615, lon: 80.0255, kind: 'city' },
{ id: 'RL-TRN', name: 'Trincomalee', lat: 8.5874, lon: 81.2152, kind: 'city' },
{ id: 'RL-BAT', name: 'Batticaloa', lat: 7.7167, lon: 81.7, kind: 'city' },
{ id: 'RL-ANU', name: 'Anuradhapura', lat: 8.3114, lon: 80.4037, kind: 'city' },
{ id: 'RL-POL', name: 'Polonnaruwa', lat: 7.9403, lon: 81.0188, kind: 'town' },
{ id: 'RL-SIG', name: 'Sigiriya', lat: 7.957, lon: 80.7603, kind: 'landmark' },
{ id: 'RL-NUW', name: 'Nuwara Eliya', lat: 6.9497, lon: 80.7891, kind: 'town' },
{ id: 'RL-ELL', name: 'Ella', lat: 6.8667, lon: 81.0466, kind: 'landmark' },
{ id: 'RL-RAT', name: 'Ratnapura', lat: 6.6828, lon: 80.4012, kind: 'town' },
{ id: 'RL-BAD', name: 'Badulla', lat: 6.9934, lon: 81.055, kind: 'town' },
{ id: 'RL-KUR', name: 'Kurunegala', lat: 7.4863, lon: 80.3647, kind: 'town' },
{ id: 'RL-PUT', name: 'Puttalam', lat: 8.0362, lon: 79.8283, kind: 'town' },
{ id: 'RL-HAM', name: 'Hambantota', lat: 6.1246, lon: 81.1185, kind: 'town' },
{ id: 'RL-VAV', name: 'Vavuniya', lat: 8.7514, lon: 80.4971, kind: 'town' },
{ id: 'RL-MON', name: 'Monaragala', lat: 6.8724, lon: 81.3507, kind: 'town' },
{ id: 'RL-ADM', name: "Adam's Peak", lat: 6.8096, lon: 80.4994, kind: 'landmark' }];
