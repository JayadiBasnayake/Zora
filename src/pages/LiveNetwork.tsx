import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchIcon, XIcon } from 'lucide-react';
import { CityMap } from '../components/map/CityMap';
import type { LayerId } from '../data/network';
import { liveVehicles, networkAlerts, stationById, stations } from '../data/network';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ModeIcon, modeMeta } from '../components/ui/ModeIcon';
import { useAppState } from '../state/AppState';

const alertTone = {
  traffic: 'amber',
  closure: 'amber',
  delay: 'violet'
} as const;

// The four modes in the brief. The chips double as the map legend (colours match the lines).
const layerOptions: { id: LayerId; label: string; color: string }[] = [
  { id: 'metro', label: 'Rail', color: '#22D3EE' },
  { id: 'bus', label: 'Bus & shuttle', color: '#5EEAD4' },
  { id: 'air', label: 'Air taxi', color: '#8B5CF6' },
  { id: 'road', label: 'Smart roads', color: '#94A3B8' }
];

// Stations on the demo user's active journey (used to show "On your route" honestly).
const journeyStops = ['CMB', 'LOT', 'BOR', 'KOT', 'BAT', 'KAN'];

const isWide = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function' && window.matchMedia('(min-width: 640px)').matches;

export function LiveNetwork() {
  const { activeJourney, updatePlannerQuery } = useAppState();
  const navigate = useNavigate();
  const [layers, setLayers] = useState<LayerId[]>(['metro', 'bus', 'air', 'road']);
  const [query, setQuery] = useState('');
  // On phones start with the map clear; on wider screens open the hub panel as before.
  const [selected, setSelected] = useState<string | null>(() => isWide() ? 'CMB' : null);
  const [panelOpen, setPanelOpen] = useState<boolean>(isWide);

  const toggleLayer = (id: LayerId) =>
  setLayers((l) => l.includes(id) ? l.filter((x) => x !== id) : [...l, id]);

  const matches = query ?
  stations.filter((s) => s.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5) :
  [];

  const station = selected ? stationById(selected) : null;
  const nearby = liveVehicles.filter((v) => selected ? v.path.includes(selected) : false);
  const stationAlerts = station ? networkAlerts.filter((a) => a.station === station.id) : [];
  const onRoute = Boolean(activeJourney && station && journeyStops.includes(station.id));

  return (
    <div className="relative h-[calc(100dvh-9rem)] min-h-[560px] w-full overflow-hidden lg:h-[calc(100dvh-10rem)]">
      <CityMap
        className="absolute inset-0 h-full w-full"
        layers={layers}
        showAlerts
        selectedStation={selected}
        onSelectStation={(id) => {
          setSelected(id);
          setPanelOpen(true);
        }} />

      {/* Search stays centered while the mode controls occupy a separate side rail. */}
      <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex justify-center p-3 sm:top-4 sm:p-0">
        <div className="pointer-events-auto relative w-full max-w-[520px]">
          <div className="glass flex h-12 items-center gap-2.5 rounded-xl border border-hairline px-3.5 focus-within:border-cyan-line">
            <SearchIcon aria-hidden className="h-4 w-4 text-ink-dim" />
            <label htmlFor="map-search" className="sr-only">
              Search the network
            </label>
            <input
              id="map-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a station"
              className="w-full bg-transparent text-sm text-ink placeholder:text-ink-dim focus:outline-none" />

            {query &&
            <button type="button" onClick={() => setQuery('')} aria-label="Clear search" className="-mr-1 rounded-lg p-2 text-ink-dim hover:text-ink">
                <XIcon aria-hidden className="h-4 w-4" />
              </button>
            }
          </div>
          {matches.length > 0 &&
          <ul className="glass absolute inset-x-0 top-full z-30 mt-2 overflow-hidden rounded-xl border border-hairline">
              {matches.map((m) =>
            <li key={m.id}>
                  <button
                type="button"
                onClick={() => {
                  setSelected(m.id);
                  setQuery('');
                  setPanelOpen(true);
                }}
                className="flex min-h-11 w-full items-center justify-between gap-3 px-3.5 text-left text-[13px] text-ink transition-colors duration-150 ease-out hover:bg-white/5">

                    {m.name}
                    <span className="text-[11px] uppercase tracking-[0.08em] text-ink-dim">{m.kind}</span>
                  </button>
                </li>
            )}
            </ul>
          }
          {query && matches.length === 0 && <p role="status" className="glass absolute inset-x-0 top-full z-30 mt-2 rounded-xl border border-hairline p-3 text-[13px] text-ink-muted">No stations match “{query}”.</p>}
        </div>

        <div className="pointer-events-auto absolute right-3 top-16 flex w-[164px] flex-col gap-2 sm:right-6 sm:top-20" role="group" aria-label="Transport modes shown on the map">
          {layerOptions.map((l) => {
            const on = layers.includes(l.id);
            return (
              <button
                key={l.id}
                type="button"
                aria-pressed={on}
                onClick={() => toggleLayer(l.id)}
                className={`flex min-h-11 w-full items-center gap-2 rounded-xl border px-3 text-xs font-semibold shadow-lg backdrop-blur-xl transition-colors duration-150 ease-out ${on ? 'border-cyan-line bg-base/85 text-ink' : 'border-hairline bg-base/60 text-ink-dim'}`}>
                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: on ? l.color : 'transparent', border: `2px solid ${l.color}` }} />
                {l.label}
              </button>);

          })}
        </div>
      </div>

      {/* Station panel: bottom sheet on phones, floating card on wider screens. */}
      {panelOpen && station &&
      <aside
        aria-label={`${station.name} details`}
        className="glass absolute inset-x-0 bottom-0 z-30 max-h-[45%] overflow-y-auto border-t border-hairline p-4 pb-20 sm:inset-x-auto sm:bottom-6 sm:right-6 sm:max-h-[70%] sm:w-[360px] sm:rounded-2xl sm:border sm:p-5 sm:pb-5">

          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-cyan">
                {station.kind === 'hub' ? 'Interchange hub' : station.kind}
              </p>
              <h2 className="mt-1 font-display text-lg font-semibold text-ink">{station.name}</h2>
            </div>
            <button
            type="button"
            onClick={() => setPanelOpen(false)}
            aria-label="Close station panel"
            className="rounded-lg p-2.5 text-ink-muted transition-colors duration-150 ease-out hover:bg-white/5 hover:text-ink">

              <XIcon aria-hidden className="h-4.5 w-4.5" />
            </button>
          </div>

          <Button variant="primary" block className="mt-3" onClick={() => { updatePlannerQuery({ from: station.name }); navigate('/plan'); }}>
            Plan a journey from here
          </Button>

          {onRoute &&
          <p className="mt-3 rounded-xl border border-cyan-line bg-cyan-soft p-3 text-[13px] font-medium text-ink">On your route to {activeJourney?.destination}</p>
          }

          <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-dim">
            Services at this stop
          </p>
          <ul className="mt-2 space-y-2">
            {nearby.length === 0 && <li className="rounded-xl border border-hairline bg-surface px-3 py-3 text-[13px] text-ink-muted">No services at this stop right now.</li>}
            {nearby.slice(0, 4).map((v) =>
          <li key={v.id} className="flex items-center gap-3 rounded-xl border border-hairline bg-surface px-3 py-2.5">
                <ModeIcon mode={v.mode} size="sm" />
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-[13px] text-ink">{v.code}</p>
                  <p className="text-[11px] text-ink-dim">{modeMeta(v.mode).name}</p>
                </div>
              </li>
          )}
          </ul>

          {stationAlerts.length > 0 &&
          <>
              <p className="mt-5 text-[10px] font-semibold uppercase tracking-[0.12em] text-ink-dim">
                Alerts here
              </p>
              <ul className="mt-2 space-y-2">
                {stationAlerts.map((a) =>
              <li key={a.id} className="rounded-xl border border-hairline bg-surface p-3">
                    <Badge tone={alertTone[a.kind]}>{a.label}</Badge>
                    <p className="mt-1.5 text-[12px] leading-relaxed text-ink-muted">{a.detail}</p>
                  </li>
              )}
              </ul>
            </>
          }
        </aside>
      }
    </div>);

}
