import type { RouteLeg, RouteOption, TransportModeId } from '../types';
import { accessibilityUnknown } from '../data/accessibility';
import { allPlaces, landmarkStations, networkLines, stations } from '../data/network';
import { haversineKm } from '../data/sriLanka';
import type { NetworkLine } from '../data/network';

const accessible = { ...accessibilityUnknown, 'step-free': 'yes' as const, 'reduced-walking': 'partial' as const, luggage: 'partial' as const };

// --- mode economics: rough speed (km/h) and fare (credits/km) per mode ---
const modeSpeedKmh: Record<TransportModeId, number> = {
  metro: 220,
  intercity: 210,
  airtaxi: 300,
  bus: 45,
  shuttle: 34,
  walk: 4.5
};
const modeFarePerKm: Record<TransportModeId, number> = {
  metro: 0.045,
  intercity: 0.045,
  airtaxi: 0.09,
  bus: 0.02,
  shuttle: 0.06,
  walk: 0
};
const modeEnergyKwhPerKm: Record<TransportModeId, number> = {
  metro: 0.14,
  intercity: 0.12,
  airtaxi: 0.68,
  bus: 0.09,
  shuttle: 0.11,
  walk: 0
};
const lineMode = (line: NetworkLine): TransportModeId => {
  if (line.layer === 'air') return 'airtaxi';
  if (line.layer === 'bus') return line.id.startsWith('R') ? 'shuttle' : 'bus';
  if (line.layer === 'road') return 'shuttle';
  return line.id === 'M3' ? 'intercity' : 'metro';
};

// --- graph built from the network lines: edge = consecutive stop pair ---
interface Edge { to: string; line: NetworkLine; mode: TransportModeId; km: number; minutes: number; cost: number; }
const graph = new Map<string, Edge[]>();
const addEdge = (a: string, b: string, line: NetworkLine) => {
  const from = stations.find((s) => s.id === a);
  const to = stations.find((s) => s.id === b);
  if (!from || !to || !from.lat || !to.lat) return;
  const km = Math.max(0.5, haversineKm({ lat: from.lat!, lon: from.lon! }, { lat: to.lat!, lon: to.lon! }));
  const mode = lineMode(line);
  const minutes = Math.max(2, Math.round((km / modeSpeedKmh[mode]) * 60));
  const cost = Number((km * modeFarePerKm[mode]).toFixed(2));
  const list = graph.get(a) ?? [];
  list.push({ to: b, line, mode, km, minutes, cost });
  graph.set(a, list);
};
networkLines.forEach((line) => {
  for (let i = 0; i < line.path.length - 1; i++) {
    addEdge(line.path[i], line.path[i + 1], line);
    addEdge(line.path[i + 1], line.path[i], line);
  }
});
const networkStationIds = new Set(stations.map((s) => s.id));

// --- resolve free-typed text ("Galle", "kandy skyport"...) to a place ---
export interface ResolvedPlace {
  queryText: string;
  placeId: string; // the id of whatever the traveller actually typed
  entryStationId: string; // the network station used to enter/exit the graph
  accessLeg?: { name: string; lat: number; lon: number; km: number }; // set if the typed place isn't itself a network station
}

function matchPlace(text: string) {
  const q = text.trim().toLowerCase();
  if (!q) return null;
  return (
    allPlaces.find((p) => p.name.toLowerCase() === q) ??
    allPlaces.find((p) => p.name.toLowerCase().startsWith(q)) ??
    allPlaces.find((p) => p.name.toLowerCase().includes(q)) ??
    null);

}

function nearestNetworkStation(lat: number, lon: number) {
  let best = stations[0];
  let bestKm = Infinity;
  for (const s of stations) {
    if (!s.lat || !s.lon) continue;
    const km = haversineKm({ lat, lon }, { lat: s.lat, lon: s.lon });
    if (km < bestKm) { bestKm = km; best = s; }
  }
  return { station: best, km: bestKm };
}

export function resolvePlace(text: string): ResolvedPlace | null {
  const place = matchPlace(text);
  if (!place) return null;
  if (networkStationIds.has(place.id)) {
    return { queryText: place.name, placeId: place.id, entryStationId: place.id };
  }
  // A real-world landmark/town: hop on the network at its nearest station.
  const { station, km } = nearestNetworkStation(place.lat!, place.lon!);
  return {
    queryText: place.name,
    placeId: place.id,
    entryStationId: station.id,
    accessLeg: { name: place.name, lat: place.lat!, lon: place.lon!, km }
  };
}

// --- Dijkstra, minimising an arbitrary edge cost function ---
function shortestPath(start: string, end: string, weight: (e: Edge) => number): string[] | null {
  const dist = new Map<string, number>([[start, 0]]);
  const prev = new Map<string, string>();
  const visited = new Set<string>();
  const queue = new Set<string>([start]);

  while (queue.size) {
    let u = '';
    let best = Infinity;
    for (const id of queue) { const d = dist.get(id) ?? Infinity; if (d < best) { best = d; u = id; } }
    queue.delete(u);
    if (u === end) break;
    visited.add(u);
    for (const edge of graph.get(u) ?? []) {
      if (visited.has(edge.to)) continue;
      const next = best + weight(edge);
      if (next < (dist.get(edge.to) ?? Infinity)) {
        dist.set(edge.to, next);
        prev.set(edge.to, u);
        queue.add(edge.to);
      }
    }
  }
  if (!dist.has(end)) return null;
  const path: string[] = [end];
  let cur = end;
  while (cur !== start) {
    const p = prev.get(cur);
    if (!p) return null;
    path.unshift(p);
    cur = p;
  }
  return path;
}

// Merge consecutive same-line hops into a single leg (like a real timetable).
function pathToLegs(path: string[], startDepartMin: number): { legs: RouteLeg[]; totalMin: number; totalCost: number; transfers: number } {
  const legs: RouteLeg[] = [];
  let i = 0;
  let clock = startDepartMin;
  let totalCost = 0;
  while (i < path.length - 1) {
    const edges = graph.get(path[i]) ?? [];
    const edge = edges.find((e) => e.to === path[i + 1])!;
    let j = i + 1;
    let minutes = edge.minutes;
    let cost = edge.cost;
    // extend the leg while consecutive hops stay on the same line
    while (j < path.length - 1) {
      const nextEdges = graph.get(path[j]) ?? [];
      const nextEdge = nextEdges.find((e) => e.to === path[j + 1]);
      if (!nextEdge || nextEdge.line.id !== edge.line.id) break;
      minutes += nextEdge.minutes;
      cost += nextEdge.cost;
      j++;
    }
    const depart = clock;
    const arrive = clock + minutes;
    legs.push({
      mode: edge.mode,
      label: edge.line.name,
      from: stationName(path[i]),
      to: stationName(path[j]),
      depart: fmt(depart),
      arrive: fmt(arrive),
      durationMin: minutes,
      detail: `${edge.line.name} · ${legs.length === 0 ? 'boarding' : 'connection'}`,
      accessibility: accessible
    });
    totalCost += cost;
    clock = arrive + 3; // transfer buffer
    i = j;
  }
  return { legs, totalMin: clock - startDepartMin - (legs.length ? 3 : 0), totalCost, transfers: Math.max(0, legs.length - 1) };
}

const stationName = (id: string) => stations.find((s) => s.id === id)?.name ?? landmarkStations.find((s) => s.id === id)?.name ?? id;
const fmt = (mins: number) => { const m = ((mins % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`; };
const toMinutes = (t: string) => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };

function accessLegLeading(access: ResolvedPlace['accessLeg'], toStationId: string, departMin: number): { leg: RouteLeg; minutes: number } | null {
  if (!access) return null;
  const mode: TransportModeId = access.km <= 1.2 ? 'walk' : 'shuttle';
  const minutes = Math.max(3, Math.round((access.km / modeSpeedKmh[mode]) * 60));
  return {
    minutes,
    leg: {
      mode,
      label: mode === 'walk' ? 'Walk to network' : 'Smart Shuttle · pickup at door',
      from: access.name,
      to: stationName(toStationId),
      depart: fmt(departMin),
      arrive: fmt(departMin + minutes),
      durationMin: minutes,
      detail: mode === 'walk' ? `${access.km.toFixed(1)} km on foot` : `${access.km.toFixed(1)} km · door-to-door pickup`,
      accessibility: accessible
    }
  };
}

export interface BuildRouteOptions {
  timeHHMM: string;
  passengers: number;
}

/**
 * Computes up to 3 distinct journey options between any two places the
 * traveller types in (network stations, or real towns/landmarks, which are
 * reached via a walk/shuttle leg to the nearest network station).
 */
export function buildRouteOptions(fromText: string, toText: string, opts: BuildRouteOptions): RouteOption[] {
  const from = resolvePlace(fromText);
  const to = resolvePlace(toText);
  if (!from || !to || from.entryStationId === to.entryStationId && !from.accessLeg && !to.accessLeg) return [];

  const startMin = /^\d{2}:\d{2}$/.test(opts.timeHHMM) ? toMinutes(opts.timeHHMM) : toMinutes('08:40');

  type Objective = { key: 'fastest' | 'eco' | 'accessible'; tag: string; name: string; description: string; weight: (e: Edge) => number };
  const objectives: Objective[] = [
  { key: 'fastest', tag: 'Fastest', name: 'High-speed route', description: 'Prioritises the shortest travel time.', weight: (e) => e.minutes },
  { key: 'eco', tag: 'Eco', name: 'Low-energy route', description: 'Prioritises electric rail and low energy use.', weight: (e) => e.km * modeEnergyKwhPerKm[e.mode] },
  { key: 'accessible', tag: 'Accessible', name: 'Accessibility route', description: 'Prioritises fewer changes and step-free connections.', weight: (e) => e.minutes + 8 }];


  const seen = new Set<string>();
  const options: RouteOption[] = [];

  for (const obj of objectives) {
    const path = shortestPath(from.entryStationId, to.entryStationId, obj.weight);
    if (!path) continue;
    const key = path.join('-');
    if (seen.has(key)) continue;
    seen.add(key);

    let departMin = startMin;
    const legs: RouteLeg[] = [];
    let walkingM = 0;

    const lead = accessLegLeading(from.accessLeg, from.entryStationId, departMin);
    if (lead) { legs.push(lead.leg); departMin += lead.minutes + 2; if (lead.leg.mode === 'walk') walkingM += Math.round(lead.leg.durationMin * (modeSpeedKmh.walk * 1000 / 60)); }

    const core = pathToLegs(path, departMin);
    legs.push(...core.legs);
    departMin = toMinutes(core.legs.length ? core.legs[core.legs.length - 1].arrive : fmt(departMin)) + (to.accessLeg ? 2 : 0);

    if (to.accessLeg) {
      const tail = accessLegLeading(to.accessLeg, to.entryStationId, departMin);
      if (tail) {
        // tail leg direction is reversed (network -> destination)
        tail.leg.from = stationName(to.entryStationId);
        tail.leg.to = to.accessLeg.name;
        legs.push(tail.leg);
        if (tail.leg.mode === 'walk') walkingM += Math.round(tail.minutes * (modeSpeedKmh.walk * 1000 / 60));
      }
    }

    if (!legs.length) continue;
    const totalMin = toMinutes(legs[legs.length - 1].arrive) - toMinutes(legs[0].depart);
    const totalCost = Number((legs.reduce((sum, leg) => {
      const mode = leg.mode;
      const km = leg.durationMin / 60 * modeSpeedKmh[mode];
      return sum + km * modeFarePerKm[mode];
    }, 0) * Math.max(1, opts.passengers)).toFixed(2));
    const energyKwh = Number(legs.reduce((sum, leg) => {
      const km = leg.durationMin / 60 * modeSpeedKmh[leg.mode];
      return sum + km * modeEnergyKwhPerKm[leg.mode];
    }, 0).toFixed(1));
    const transfers = Math.max(0, legs.length - 1);
    const airtaxiLegs = legs.filter((l) => l.mode === 'airtaxi').length;
    const reliability = Math.max(90, Math.min(99, 99 - transfers * 2 - airtaxiLegs * 2));

    options.push({
      id: obj.key.toUpperCase(),
      name: obj.name,
      durationMin: totalMin,
      cost: totalCost || 0.5,
      transfers,
      reliability,
      walkingM,
      energyKwh,
      description: obj.description,
      departs: legs[0].depart,
      arrives: legs[legs.length - 1].arrive,
      tag: obj.tag,
      legs,
      accessibility: accessible,
      stationPath: [
      ...(from.accessLeg ? [from.placeId] : []),
      ...path,
      ...(to.accessLeg ? [to.placeId] : [])]

    });
  }

  return options;
}
