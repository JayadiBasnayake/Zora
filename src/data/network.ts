import type { LiveVehicle, Station } from '../types';
import { MAP_VIEWBOX, project, realPlaces } from './sriLanka';

export { MAP_VIEWBOX };

// Each station now carries its REAL lat/lon (its real-world namesake town),
// and x/y are derived from that with the same projection used for the
// island outline — so every dot lands in its true geographic spot.
const rawStations: (Omit<Station, 'x' | 'y'> & { lat: number; lon: number })[] = [
  // Western / existing 2100 network
  { id: 'NEG', name: 'Negombo Coastal', short: 'NEG', lat: 7.2083, lon: 79.8358, kind: 'station' },
  { id: 'KAT', name: 'Katunayake Aeroport', short: 'KAT', lat: 7.1808, lon: 79.8842, kind: 'hub' },
  { id: 'FRT', name: 'Fort Interchange', short: 'FRT', lat: 6.9344, lon: 79.8428, kind: 'station' },
  { id: 'PRT', name: 'Port City Skyport', short: 'PRT', lat: 6.9271, lon: 79.845, kind: 'skyport' },
  { id: 'CMB', name: 'Colombo Mobility Hub', short: 'CMB', lat: 6.9271, lon: 79.8612, kind: 'hub' },
  { id: 'LOT', name: 'Lotus Plaza', short: 'LOT', lat: 6.9175, lon: 79.8562, kind: 'station' },
  { id: 'BOR', name: 'Borella Node', short: 'BOR', lat: 6.9147, lon: 79.8774, kind: 'station' },
  { id: 'KOT', name: 'Kotte Ring', short: 'KOT', lat: 6.8905, lon: 79.9026, kind: 'station' },
  { id: 'BAT', name: 'Battaramulla Skyport', short: 'BAT', lat: 6.9016, lon: 79.9188, kind: 'skyport' },
  { id: 'MAL', name: 'Malabe Tech District', short: 'MAL', lat: 6.9147, lon: 79.9725, kind: 'station' },
  { id: 'KAD', name: 'Kaduwela Station', short: 'KAD', lat: 6.9333, lon: 79.9833, kind: 'station' },
  { id: 'AVI', name: 'Avissawella Junction', short: 'AVI', lat: 6.9548, lon: 80.2076, kind: 'station' },
  { id: 'KEG', name: 'Kegalle Transit', short: 'KEG', lat: 7.2513, lon: 80.3464, kind: 'station' },
  { id: 'KAN', name: 'Kandy Skyport', short: 'KAN', lat: 7.2906, lon: 80.6337, kind: 'skyport' },
  { id: 'MTL', name: 'Mount Lavinia South', short: 'MTL', lat: 6.8389, lon: 79.8653, kind: 'stop' },
  { id: 'MOR', name: 'Moratuwa Stop', short: 'MOR', lat: 6.773, lon: 79.8816, kind: 'stop' },
  { id: 'HOM', name: 'Homagama Node', short: 'HOM', lat: 6.8444, lon: 80.0027, kind: 'station' },
  { id: 'PAN', name: 'Panadura Coastal', short: 'PAN', lat: 6.7133, lon: 79.9026, kind: 'stop' },

  // Island-wide regional hubs. These are what prevent the map from becoming
  // a Colombo-only network while keeping the original 2100 stations intact.
  { id: 'GLE', name: 'Galle Mobility Hub', short: 'GLE', lat: 6.0535, lon: 80.221, kind: 'hub' },
  { id: 'MTR', name: 'Matara Transit', short: 'MTR', lat: 5.9549, lon: 80.555, kind: 'station' },
  { id: 'HMB', name: 'Hambantota Gateway', short: 'HMB', lat: 6.1246, lon: 81.1185, kind: 'hub' },
  { id: 'RAT', name: 'Ratnapura Transit', short: 'RAT', lat: 6.6828, lon: 80.4012, kind: 'station' },
  { id: 'NUW', name: 'Nuwara Eliya Link', short: 'NUW', lat: 6.9497, lon: 80.7891, kind: 'station' },
  { id: 'ELLA', name: 'Ella Gateway', short: 'ELLA', lat: 6.8667, lon: 81.0466, kind: 'hub' },
  { id: 'BAD', name: 'Badulla Transit', short: 'BAD', lat: 6.9934, lon: 81.055, kind: 'station' },
  { id: 'KUR', name: 'Kurunegala Transit', short: 'KUR', lat: 7.4863, lon: 80.3647, kind: 'hub' },
  { id: 'ANU', name: 'Anuradhapura Hub', short: 'ANU', lat: 8.3114, lon: 80.4037, kind: 'hub' },
  { id: 'PUT', name: 'Puttalam Gateway', short: 'PUT', lat: 8.0362, lon: 79.8283, kind: 'station' },
  { id: 'VAV', name: 'Vavuniya Hub', short: 'VAV', lat: 8.7514, lon: 80.4971, kind: 'hub' },
  { id: 'JAF', name: 'Jaffna Mobility Hub', short: 'JAF', lat: 9.6615, lon: 80.0255, kind: 'hub' },
  { id: 'POL', name: 'Polonnaruwa Transit', short: 'POL', lat: 7.9403, lon: 81.0188, kind: 'station' },
  { id: 'BLC', name: 'Batticaloa Hub', short: 'BLC', lat: 7.7167, lon: 81.7, kind: 'hub' },
  { id: 'TRI', name: 'Trincomalee Hub', short: 'TRI', lat: 8.5874, lon: 81.2152, kind: 'hub' }
];

export const stations: Station[] = rawStations.map((s) => ({ ...s, ...project(s, MAP_VIEWBOX) }));

// Real Sri Lankan towns/cities/landmarks plotted for geographic realism.
// They aren't part of the 2100 transit lines, but the planner will route a
// traveller to/from any of them via the nearest network station (see
// utils/routing.ts), and they render on the map as their own layer.
export const landmarkStations: Station[] = realPlaces.map((p) => ({
  id: p.id,
  name: p.name,
  short: p.name.slice(0, 3).toUpperCase(),
  lat: p.lat,
  lon: p.lon,
  kind: 'landmark',
  ...project(p, MAP_VIEWBOX)
}));

export const allPlaces: Station[] = [...stations, ...landmarkStations];

export const stationById = (id: string): Station =>
allPlaces.find((s) => s.id === id) ?? stations[0];

export type LayerId = 'metro' | 'bus' | 'air' | 'road';
export interface NetworkLine {
  id: string;
  name: string;
  layer: LayerId;
  color: string;
  dashed?: boolean;
  path: string[];
}

export const networkLines: NetworkLine[] = [
  // Existing Colombo-area services
  { id: 'M1', name: 'Hyper Metro · Coastal', layer: 'metro', color: '#22D3EE', path: ['NEG', 'KAT', 'FRT', 'CMB', 'MTL', 'MOR', 'PAN'] },
  { id: 'M2', name: 'Hyper Metro · East', layer: 'metro', color: '#8B5CF6', path: ['CMB', 'LOT', 'BOR', 'KOT', 'MAL', 'KAD'] },
  { id: 'M3', name: 'Intercity Express · Kandy', layer: 'metro', color: '#5EEAD4', path: ['CMB', 'KOT', 'KEG', 'KAN'] },

  // New island-wide corridors
  { id: 'M4', name: 'Island Express · North', layer: 'metro', color: '#38BDF8', path: ['KAN', 'KEG', 'KUR', 'ANU', 'VAV', 'JAF'] },
  { id: 'M5', name: 'Coastal Express · South', layer: 'metro', color: '#34D399', path: ['PAN', 'GLE', 'MTR', 'HMB'] },
  { id: 'M6', name: 'Eastern Intercity', layer: 'metro', color: '#F472B6', path: ['KAN', 'POL', 'BLC', 'TRI'] },
  { id: 'M7', name: 'Highland Connector', layer: 'metro', color: '#A78BFA', path: ['KAN', 'NUW', 'ELLA', 'BAD', 'HMB'] },
  { id: 'M8', name: 'North-East Link', layer: 'metro', color: '#FB7185', path: ['ANU', 'POL', 'TRI'] },
  { id: 'M9', name: 'Hill Country Link', layer: 'metro', color: '#2DD4BF', path: ['AVI', 'RAT', 'NUW'] },
  { id: 'M10', name: 'North-West Link', layer: 'metro', color: '#60A5FA', path: ['NEG', 'PUT', 'ANU'] },

  // Air corridors now connect the regions instead of only Colombo
  { id: 'A1', name: 'Air Corridor · North', layer: 'air', color: '#8B5CF6', dashed: true, path: ['PRT', 'KAT', 'JAF'] },
  { id: 'A2', name: 'Air Corridor · Highland', layer: 'air', color: '#8B5CF6', dashed: true, path: ['PRT', 'BAT', 'KAN', 'ELLA'] },
  { id: 'A3', name: 'Air Corridor · East', layer: 'air', color: '#C084FC', dashed: true, path: ['KAT', 'TRI', 'BLC', 'HMB'] },
  { id: 'A4', name: 'Air Corridor · South', layer: 'air', color: '#C084FC', dashed: true, path: ['PRT', 'GLE', 'HMB'] },

  // Bus / shuttle feeders keep local connectivity around the major hubs
  { id: 'B1', name: 'Autonomous Bus 14', layer: 'bus', color: '#5EEAD4', path: ['CMB', 'BOR', 'HOM', 'MOR'] },
  { id: 'B2', name: 'Autonomous Bus 27', layer: 'bus', color: '#5EEAD4', path: ['FRT', 'LOT', 'BAT', 'MAL'] },
  { id: 'B3', name: 'Regional Shuttle · Central', layer: 'bus', color: '#34D399', path: ['KUR', 'KEG', 'KAN', 'NUW'] },
  { id: 'B4', name: 'Regional Shuttle · East', layer: 'bus', color: '#34D399', path: ['POL', 'BLC', 'TRI'] },
  { id: 'B5', name: 'Regional Shuttle · North', layer: 'bus', color: '#34D399', path: ['ANU', 'VAV', 'JAF'] },

  // Roads are deliberately low-opacity background connections
  { id: 'R1', name: 'Smart Road E1', layer: 'road', color: 'rgba(148,163,184,0.5)', path: ['MTL', 'CMB', 'KOT', 'KAD', 'AVI', 'RAT'] },
  { id: 'R2', name: 'Smart Road S3', layer: 'road', color: 'rgba(148,163,184,0.5)', path: ['PAN', 'GLE', 'MTR', 'HMB'] },
  { id: 'R3', name: 'Smart Road N1', layer: 'road', color: 'rgba(148,163,184,0.5)', path: ['PUT', 'ANU', 'POL', 'TRI'] },
  { id: 'R4', name: 'Smart Road Uva', layer: 'road', color: 'rgba(148,163,184,0.5)', path: ['RAT', 'NUW', 'BAD', 'ELLA', 'HMB'] }
];


export const liveVehicles: LiveVehicle[] = [
  { id: 'v1', code: 'HM-1187', mode: 'metro', path: ['NEG', 'KAT', 'FRT', 'CMB', 'MTL', 'MOR', 'PAN'], offset: 0.1, speedKmh: 620, occupancy: 64 },
  { id: 'v2', code: 'HM-2042', mode: 'metro', path: ['JAF', 'VAV', 'ANU', 'KUR', 'KEG', 'KAN'], offset: 0.42, speedKmh: 608, occupancy: 38 },
  { id: 'v3', code: 'HM-3310', mode: 'metro', path: ['KAN', 'POL', 'BLC', 'TRI'], offset: 0.66, speedKmh: 480, occupancy: 71 },
  { id: 'v4', code: 'IX-0440', mode: 'intercity', path: ['KAN', 'NUW', 'ELLA', 'BAD', 'HMB'], offset: 0.24, speedKmh: 650, occupancy: 52 },
  { id: 'v5', code: 'AX-772', mode: 'airtaxi', path: ['PRT', 'GLE', 'HMB'], offset: 0.55, speedKmh: 280, occupancy: 50 },
  { id: 'v6', code: 'AX-318', mode: 'airtaxi', path: ['KAT', 'TRI', 'JAF'], offset: 0.8, speedKmh: 274, occupancy: 25 },
  { id: 'v7', code: 'AB-1402', mode: 'bus', path: ['ANU', 'VAV', 'JAF'], offset: 0.32, speedKmh: 82, occupancy: 88 },
  { id: 'v8', code: 'AB-2708', mode: 'bus', path: ['POL', 'BLC', 'TRI'], offset: 0.6, speedKmh: 78, occupancy: 41 },
  { id: 'v9', code: 'SS-5521', mode: 'shuttle', path: ['RAT', 'NUW', 'BAD'], offset: 0.15, speedKmh: 56, occupancy: 62 },
  { id: 'v10', code: 'SS-6190', mode: 'shuttle', path: ['PAN', 'GLE', 'MTR', 'HMB'], offset: 0.7, speedKmh: 61, occupancy: 25 }
];


export interface NetworkAlert {
  id: string;
  kind: 'traffic' | 'closure' | 'delay';
  station: string;
  label: string;
  detail: string;
}

export const networkAlerts: NetworkAlert[] = [
{ id: 'n1', kind: 'traffic', station: 'BOR', label: 'Dense flow', detail: 'Borella surface lanes at 78% capacity · rerouting active' },
{ id: 'n2', kind: 'delay', station: 'KAN', label: 'Air delay', detail: 'Highland air corridor limited to 180 km/h until 10:20' },
{ id: 'n3', kind: 'closure', station: 'AVI', label: 'Lane closure', detail: 'Smart Road E1 eastbound lane 3 resurfacing until 14:00' }];


export const searchablePlaces = [
...stations.map((s) => s.name),
...landmarkStations.map((s) => s.name)];