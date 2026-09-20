/* eslint-disable react-refresh/only-export-components */
import React from 'react';
import {
  BusIcon,
  FootprintsIcon,
  PlaneIcon,
  RailSymbolIcon,
  TrainFrontIcon,
  CarTaxiFrontIcon } from
'lucide-react';
import type { TransportModeId } from '../../types';

const map: Record<TransportModeId, {icon: React.ElementType;color: string;name: string;}> = {
  metro: { icon: TrainFrontIcon, color: '#22D3EE', name: 'Hyper Metro' },
  intercity: { icon: RailSymbolIcon, color: '#5EEAD4', name: 'Intercity Express' },
  airtaxi: { icon: PlaneIcon, color: '#8B5CF6', name: 'Air Taxi' },
  bus: { icon: BusIcon, color: '#5EEAD4', name: 'Autonomous Bus' },
  shuttle: { icon: CarTaxiFrontIcon, color: '#FBBF24', name: 'Smart Shuttle' },
  walk: { icon: FootprintsIcon, color: '#94A3B8', name: 'Walk' }
};

export const modeMeta = (mode: TransportModeId) => map[mode] ?? map.walk;

interface ModeIconProps {
  mode: TransportModeId;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const boxes = { sm: 'h-7 w-7 rounded-lg', md: 'h-9 w-9 rounded-xl', lg: 'h-11 w-11 rounded-xl' };
const glyphs = { sm: 'h-3.5 w-3.5', md: 'h-4.5 w-4.5', lg: 'h-5 w-5' };

export function ModeIcon({ mode, size = 'md', className = '' }: ModeIconProps) {
  const { icon: Icon, color, name } = modeMeta(mode);
  return (
    <span
      title={name}
      className={`inline-flex shrink-0 items-center justify-center border ${boxes[size]} ${className}`}
      style={{ backgroundColor: `${color}1f`, borderColor: `${color}4d`, color }}>
      
      <Icon aria-hidden className={glyphs[size]} />
      <span className="sr-only">{name}</span>
    </span>);

}