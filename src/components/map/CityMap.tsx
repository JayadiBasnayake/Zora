import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MinusIcon, PlusIcon, RotateCcwIcon } from 'lucide-react';
import { MAP_VIEWBOX, landmarkStations, liveVehicles, networkAlerts, networkLines, stationById, stations } from '../../data/network';
import type { LayerId } from '../../data/network';
import { coastlinePath, project, sriLankaRelief, sriLankaRivers } from '../../data/sriLanka';
import { oscillate, pointAt, toPolyline } from '../../utils/geo';
import { useElapsed } from '../../hooks/useElapsed';
import { modeMeta } from '../ui/ModeIcon';

interface CityMapProps {
  layers?: LayerId[];
  showVehicles?: boolean;
  showLabels?: boolean;
  showAlerts?: boolean;
  showLandmarks?: boolean;
  /** Lets the visitor drag to pan and scroll/pinch to zoom around the island. Defaults to on. */
  navigable?: boolean;
  dimension?: '2d' | '3d';
  highlightPath?: string[];
  selectedStation?: string | null;
  onSelectStation?: (id: string) => void;
  className?: string;
}

const stationRadius: Record<string, number> = {
  hub: 7,
  skyport: 6,
  station: 4.5,
  stop: 3.5,
  landmark: 3
};

const alertTone: Record<string, string> = {
  traffic: '#FBBF24',
  closure: '#FBBF24',
  delay: '#8B5CF6'
};

const MIN_ZOOM = 1;
const MAX_ZOOM = 7;
const ISLAND_PATH = coastlinePath();

export function CityMap({
  layers = ['metro', 'bus', 'air', 'road'],
  showVehicles = true,
  showLabels = true,
  showAlerts = false,
  showLandmarks = true,
  navigable = true,
  dimension = '2d',
  highlightPath,
  selectedStation = null,
  onSelectStation,
  className = ''
}: CityMapProps) {
  const t = useElapsed(20);
  const visibleLines = useMemo(() => networkLines.filter((l) => layers.includes(l.layer)), [layers]);
  const routePoints = useMemo(() => (highlightPath ?? []).map((id) => stationById(id)).filter((station) => station.lat !== undefined && station.lon !== undefined), [highlightPath]);

  const vehicles = useMemo(
    () =>
    liveVehicles.filter((v) => {
      if (v.mode === 'airtaxi') return layers.includes('air');
      if (v.mode === 'bus' || v.mode === 'shuttle') return layers.includes('bus') || layers.includes('road');
      return layers.includes('metro');
    }),
    [layers]
  );

  // --- pan & zoom -----------------------------------------------------
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const [view, setView] = useState({ x: 0, y: 0, k: 1 });
  const drag = useRef<{ startX: number; startY: number; viewX: number; viewY: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    if (routePoints.length < 2) {
      setView({ x: 0, y: 0, k: 1 });
      return;
    }
    const padding = 120;
    const minX = Math.min(...routePoints.map((point) => point.x));
    const maxX = Math.max(...routePoints.map((point) => point.x));
    const minY = Math.min(...routePoints.map((point) => point.y));
    const maxY = Math.max(...routePoints.map((point) => point.y));
    const routeWidth = Math.max(1, maxX - minX);
    const routeHeight = Math.max(1, maxY - minY);
    const k = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Math.min(
      (MAP_VIEWBOX.width - padding * 2) / routeWidth,
      (MAP_VIEWBOX.height - padding * 2) / routeHeight
    )));
    const centerX = (minX + maxX) / 2;
    const centerY = (minY + maxY) / 2;
    setView({
      k,
      x: MAP_VIEWBOX.width / 2 - centerX * k,
      y: MAP_VIEWBOX.height / 2 - centerY * k
    });
  }, [routePoints]);

  const clampK = (k: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, k));

  const zoomAt = useCallback((factor: number, anchorClientX?: number, anchorClientY?: number) => {
    setView((prev) => {
      const nextK = clampK(prev.k * factor);
      if (nextK === prev.k) return prev;
      const rect = wrapRef.current?.getBoundingClientRect();
      // Zoom towards the cursor/pinch centre when we know it, otherwise the map centre.
      const px = rect && anchorClientX !== undefined ? (anchorClientX - rect.left) / rect.width * MAP_VIEWBOX.width : MAP_VIEWBOX.width / 2;
      const py = rect && anchorClientY !== undefined ? (anchorClientY - rect.top) / rect.height * MAP_VIEWBOX.height : MAP_VIEWBOX.height / 2;
      const ratio = nextK / prev.k;
      return {
        k: nextK,
        x: px - (px - prev.x) * ratio,
        y: py - (py - prev.y) * ratio
      };
    });
  }, []);

  const clampPan = (x: number, y: number, k: number) => {
    // Don't let the island drift entirely out of view.
    const maxX = MAP_VIEWBOX.width * (k - 1) + MAP_VIEWBOX.width * 0.4;
    const maxY = MAP_VIEWBOX.height * (k - 1) + MAP_VIEWBOX.height * 0.4;
    return {
      x: Math.min(maxX, Math.max(-maxX, x)),
      y: Math.min(maxY, Math.max(-maxY, y))
    };
  };

  const onWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (!navigable) return;
    e.preventDefault();
    const factor = Math.exp(-e.deltaY * 0.0016);
    zoomAt(factor, e.clientX, e.clientY);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!navigable) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    drag.current = { startX: e.clientX, startY: e.clientY, viewX: view.x, viewY: view.y };
    setDragging(true);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!navigable || !drag.current) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const dxScreen = e.clientX - drag.current.startX;
    const dyScreen = e.clientY - drag.current.startY;
    const dx = (dxScreen / rect.width) * MAP_VIEWBOX.width;
    const dy = (dyScreen / rect.height) * MAP_VIEWBOX.height;
    setView((prev) => ({ ...prev, ...clampPan(drag.current!.viewX + dx, drag.current!.viewY + dy, prev.k) }));
  };

  const endDrag = () => { drag.current = null; setDragging(false); };

  const resetView = () => setView({ x: 0, y: 0, k: 1 });

  return (
    <div
      ref={wrapRef}
      className={`relative overflow-hidden ${className} ${navigable ? (dragging ? 'cursor-grabbing' : 'cursor-grab') : ''}`}
      style={dimension === '3d' ? { perspective: '1400px' } : undefined}
      onWheel={onWheel}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerLeave={endDrag}
      onPointerCancel={endDrag}
      onDoubleClick={navigable ? resetView : undefined}>

      <div className="absolute inset-0 grid-field opacity-70" aria-hidden />
        <div className="map-canvas absolute inset-0" aria-hidden />
        <div className="grid-field absolute inset-0 opacity-70" aria-hidden />
      <div
        className="absolute inset-0 transition-transform duration-300 ease-out"
        style={
        dimension === '3d' ?
        { transform: 'rotateX(46deg) rotateZ(-14deg) scale(0.86)', transformOrigin: '50% 60%' } :
        undefined
        }>
        
        <svg
          viewBox={`0 0 ${MAP_VIEWBOX.width} ${MAP_VIEWBOX.height}`}
          className="h-full w-full touch-none select-none"
          role="img"
          aria-label="Interactive map of Sri Lanka's 2100 metropolitan mobility network — drag to pan, scroll or pinch to zoom"
          preserveAspectRatio="xMidYMid meet">
          
          <defs>
            <radialGradient id="mapGlow" cx="35%" cy="30%" r="75%">
              <stop offset="0%" stopColor="var(--map-ocean-highlight)" stopOpacity="0.9" />
              <stop offset="100%" stopColor="var(--map-ocean)" stopOpacity="0" />
            </radialGradient>
            <filter id="islandShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="var(--map-shadow)" floodOpacity="0.42" />
            </filter>
          </defs>
          <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="var(--map-ocean)" />
          <rect width={MAP_VIEWBOX.width} height={MAP_VIEWBOX.height} fill="url(#mapGlow)" />

          {/* everything geographic pans/zooms together */}
          <g style={{ transition: dragging ? 'none' : 'transform 120ms ease-out' }} transform={`translate(${view.x} ${view.y}) scale(${view.k})`}>

            {/* real Sri Lanka coastline */}
            {/* real Sri Lanka coastline and restrained physical geography */}
            <path d={ISLAND_PATH} fill="var(--map-island)" stroke="var(--map-coastline)" strokeWidth={2 / view.k} filter="url(#islandShadow)" />
            {sriLankaRelief.map((line, index) =>
            <polyline
              key={`relief-${index}`}
              points={line.map((place) => { const p = project(place); return `${p.x},${p.y}`; }).join(' ')}
              fill="none"
              stroke="var(--map-relief)"
              strokeWidth={8 / view.k}
              strokeOpacity="0.22"
              strokeLinecap="round" />
            )}
            {sriLankaRivers.map((line, index) =>
            <polyline
              key={`river-${index}`}
              points={line.map((place) => { const p = project(place); return `${p.x},${p.y}`; }).join(' ')}
              fill="none"
              stroke="var(--map-river)"
              strokeWidth={1.8 / view.k}
              strokeOpacity="0.7"
              strokeLinecap="round" />
            )}
            {/* network lines */}
            {visibleLines.map((line) =>
            <g key={line.id}>
                <polyline
                points={toPolyline(line.path)}
                fill="none"
                stroke={line.color}
                strokeOpacity={line.layer === 'road' ? 0.32 : 0.18}
                strokeWidth={line.layer === 'metro' ? 5 : 3.5}
                strokeLinecap="round"
                strokeLinejoin="round" />
              
                <polyline
                points={toPolyline(line.path)}
                fill="none"
                stroke={line.color}
                strokeWidth={line.layer === 'metro' ? 1.5 : 1.1}
                strokeDasharray={line.dashed ? '8 10' : undefined}
                strokeLinecap="round"
                strokeLinejoin="round" />
              
              </g>
            )}

            {/* highlighted journey */}
            {highlightPath && highlightPath.length > 1 &&
            <polyline
              points={toPolyline(highlightPath)}
              fill="none"
              stroke="#F8FAFC"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray="14 8" />

            }

            {routePoints.length > 1 &&
            <g aria-label="Selected journey endpoints">
                {[routePoints[0], routePoints[routePoints.length - 1]].map((point, index) =>
              <g key={`${point.id}-${index}`}>
                    <circle cx={point.x} cy={point.y} r={13} fill={index === 0 ? '#22D3EE' : '#FB7185'} fillOpacity={0.18} />
                    <circle cx={point.x} cy={point.y} r={6} fill={index === 0 ? '#0E7490' : '#BE123C'} stroke="#FFFFFF" strokeWidth={2} />
                    {showLabels &&
                <text x={point.x + 11} y={point.y - 10} fill="var(--map-label-active)" fontSize={11} fontWeight={700} fontFamily="Inter, sans-serif">
                          {index === 0 ? 'Origin' : 'Destination'}
                        </text>
                }
                  </g>
              )}
              </g>
            }

            {/* alerts */}
            {showAlerts &&
            networkAlerts.map((a) => {
              const s = stationById(a.station);
              return (
                <g key={a.id}>
                    <circle cx={s.x} cy={s.y} r={16} fill={alertTone[a.kind]} fillOpacity={0.1} />
                    <circle cx={s.x} cy={s.y} r={16} fill="none" stroke={alertTone[a.kind]} strokeOpacity={0.5} strokeWidth={1} />
                  </g>);

            })}

            {/* real Sri Lankan towns / landmarks, for geographic context */}
            {showLandmarks &&
            landmarkStations.map((p) =>
            <g key={p.id}>
                <circle cx={p.x} cy={p.y} r={stationRadius.landmark} fill="var(--map-landmark)" fillOpacity={0.72} stroke="var(--map-landmark-stroke)" strokeWidth={1} />
                {showLabels && !highlightPath?.length &&
              <text
                x={p.x + stationRadius.landmark + 5}
                y={p.y + 3}
                fill="var(--map-label-muted)"
                fontSize={9.5}
                fontStyle="italic"
                fontFamily="Inter, sans-serif">
                  
                    {p.name}
                  </text>
              }
              </g>
            )}

            {/* stations */}
            {stations.map((s) => {
              const active = selectedStation === s.id;
              const r = stationRadius[s.kind] ?? 4;
              return (
                <g
                  key={s.id}
                  onClick={onSelectStation ? () => onSelectStation(s.id) : undefined}
                  className={onSelectStation ? 'cursor-pointer' : undefined}>
                  
                  {(s.kind === 'hub' || active) &&
                  <circle cx={s.x} cy={s.y} r={r + 8} fill="#22D3EE" fillOpacity={active ? 0.18 : 0.09} />
                  }
                  <circle
                    cx={s.x}
                    cy={s.y}
                    r={r}
                    fill="var(--map-station)"
                    stroke={s.kind === 'skyport' ? 'var(--map-air)' : 'var(--map-transit)'}
                    strokeWidth={s.kind === 'hub' ? 3 : 2} />
                  
                  {showLabels && (s.kind === 'hub' || s.kind === 'skyport' || active) &&
                  <text
                    x={s.x + r + 7}
                    y={s.y + 4}
                    fill={active ? 'var(--map-label-active)' : 'var(--map-label)'}
                    fontSize={s.kind === 'hub' ? 13 : 11}
                    fontWeight={s.kind === 'hub' ? 600 : 500}
                    fontFamily="Inter, sans-serif">
                    
                      {s.name}
                    </text>
                  }
                </g>);

            })}

            {/* vehicles */}
            {showVehicles &&
            vehicles.map((v) => {
              const speed = v.mode === 'airtaxi' ? 0.03 : v.mode === 'metro' || v.mode === 'intercity' ? 0.024 : 0.016;
              const p = pointAt(v.path, oscillate(v.offset * 2 + t * speed));
              const color = modeMeta(v.mode).color;
              return (
                <g key={v.id} transform={`translate(${p.x} ${p.y})`}>
                    <circle r={10} fill={color} fillOpacity={0.12} />
                    <g transform={`rotate(${p.angle})`}>
                      <rect x={-6} y={-3} width={12} height={6} rx={3} fill={color} />
                      <rect x={2} y={-1.2} width={4} height={2.4} rx={1.2} fill="#030B16" fillOpacity={0.55} />
                                          <rect x={2} y={-1.2} width={4} height={2.4} rx={1.2} fill="var(--map-vehicle-window)" fillOpacity={0.7} />
                    </g>
                  </g>);

            })}
          </g>
        </svg>
      </div>

      {navigable &&
      <div className="absolute bottom-20 left-3 z-10 flex flex-col overflow-hidden rounded-xl border border-hairline bg-surface/90 shadow-lg backdrop-blur sm:bottom-4 sm:left-4">
          <button
          type="button"
          aria-label="Zoom in"
          onClick={() => zoomAt(1.4)}
          className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors duration-150 hover:bg-cyan-soft hover:text-cyan">
          
            <PlusIcon aria-hidden className="h-4 w-4" />
          </button>
          <div className="h-px w-full bg-hairline" />
          <button
          type="button"
          aria-label="Zoom out"
          onClick={() => zoomAt(1 / 1.4)}
          className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors duration-150 hover:bg-cyan-soft hover:text-cyan">
          
            <MinusIcon aria-hidden className="h-4 w-4" />
          </button>
          <div className="h-px w-full bg-hairline" />
          <button
          type="button"
          aria-label="Reset map view"
          onClick={resetView}
          className="flex h-9 w-9 items-center justify-center text-ink-muted transition-colors duration-150 hover:bg-cyan-soft hover:text-cyan">
          
            <RotateCcwIcon aria-hidden className="h-3.5 w-3.5" />
          </button>
        </div>
      }
    </div>);

}
