import type { RouteOption } from '../types';
import { accessibilityUnknown } from './accessibility';

const accessible = { ...accessibilityUnknown, 'step-free': 'yes' as const, 'reduced-walking': 'partial' as const, luggage: 'partial' as const };

export const routeOptions: RouteOption[] = [
{
  id: 'A',
  name: 'Option A',
  durationMin: 32,
  cost: 4.8,
  transfers: 2,
  reliability: 99,
  walkingM: 180,
  departs: '08:40',
  arrives: '09:12',
  tag: 'Recommended',
  legs: [
  {
    mode: 'metro',
    label: 'Hyper Metro · East',
    from: 'Colombo Mobility Hub',
    to: 'Battaramulla Skyport',
    depart: '08:40',
    arrive: '08:52',
    durationMin: 12,
    detail: 'Carriage 4 · step-free',
     platform: 'Platform 2',
     accessibility: accessible
  },
  {
    mode: 'airtaxi',
    label: 'Air Taxi AX-772',
    from: 'Battaramulla Skyport',
    to: 'Kandy Skyport',
    depart: '08:56',
    arrive: '09:06',
    durationMin: 10,
    detail: 'Pad B · 4 seats',
     platform: 'Pad B',
     accessibility: accessible
  },
  {
    mode: 'shuttle',
    label: 'Smart Shuttle SS-5521',
    from: 'Kandy Skyport',
    to: 'Kandy Lake Terrace',
    depart: '09:07',
    arrive: '09:12',
    durationMin: 5,
    detail: 'Door-to-door · ramp equipped',
      accessibility: accessible
    }
    ],
  accessibility: accessible

},
{
  id: 'B',
  name: 'Option B',
  durationMin: 41,
  cost: 2.6,
  transfers: 1,
  reliability: 97,
  walkingM: 320,
  departs: '08:44',
  arrives: '09:25',
  tag: 'Cheapest',
  legs: [
  {
    mode: 'intercity',
    label: 'Intercity Express · Kandy',
    from: 'Colombo Mobility Hub',
    to: 'Kegalle Transit',
    depart: '08:44',
    arrive: '09:08',
    durationMin: 24,
    detail: 'Quiet carriage 2',
     platform: 'Platform 6',
     accessibility: accessible
  },
  {
    mode: 'bus',
    label: 'Autonomous Bus 27',
    from: 'Kegalle Transit',
    to: 'Kandy Lake Terrace',
    depart: '09:12',
    arrive: '09:25',
    durationMin: 13,
    detail: 'Level boarding · 42 seats',
      accessibility: accessible
    }
    ],
  accessibility: accessible

},
{
  id: 'C',
  name: 'Option C',
  durationMin: 28,
  cost: 9.4,
  transfers: 0,
  reliability: 94,
  walkingM: 60,
  departs: '08:47',
  arrives: '09:15',
  tag: 'Fastest',
  legs: [
  {
    mode: 'airtaxi',
    label: 'Air Taxi AX-318 · direct',
    from: 'Port City Skyport',
    to: 'Kandy Skyport',
    depart: '08:47',
    arrive: '09:15',
    durationMin: 28,
    detail: 'Private cabin · highland corridor',
     platform: 'Pad A',
      accessibility: accessible
    }
    ],
  accessibility: accessible

},
{
  id: 'D',
  name: 'Option D',
  durationMin: 38,
  cost: 5.2,
  transfers: 1,
  reliability: 99,
  walkingM: 0,
  departs: '08:52',
  arrives: '09:30',
  tag: 'Step-free',
  legs: [
  {
    mode: 'shuttle',
    label: 'Smart Shuttle · pickup at door',
    from: '21 Rosmead Place',
    to: 'Colombo Mobility Hub',
    depart: '08:52',
    arrive: '09:01',
    durationMin: 9,
    detail: 'Ramp deployed · companion seat',
     accessibility: accessible
  },
  {
    mode: 'intercity',
    label: 'Intercity Express · Kandy',
    from: 'Colombo Mobility Hub',
    to: 'Kandy Skyport',
    depart: '09:06',
    arrive: '09:30',
    durationMin: 24,
    detail: 'Assisted boarding booked',
     platform: 'Platform 6',
      accessibility: accessible
    }
    ],
  accessibility: accessible

}];


