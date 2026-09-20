import type { TrackedStep } from '../types';

export const user = {
  name: 'Jayadi',
  fullName: 'Jayadi Perera',
  passId: 'UMP-4471-0092',
  tier: 'Universal Mobility Pass · Civic',
  since: '2094'
};

export const upcomingJourney = {
  origin: 'Colombo Central',
  originDetail: 'Colombo Mobility Hub · Platform 2',
  destination: 'Kandy',
  destinationDetail: 'Kandy Lake Terrace',
  depart: '08:40',
  arrive: '09:32',
  status: 'On schedule' as const,
  date: 'Today · 18 September',
  vehicle: 'HM-3310',
  gate: 'Gate 4 · Platform 2',
  seat: 'Carriage 4 · Seat 12A',
  passengers: 1,
  token: 'UMP-4471-0092-KAN',
  cost: 4.8
};

export const laterJourneys = [
{ id: 'l1', route: 'Kandy → Colombo Central', when: 'Today · 18:10', mode: 'Intercity Express', status: 'Booked' },
{ id: 'l2', route: 'Home → Innovation Campus', when: 'Tomorrow · 07:50', mode: 'Metro + Shuttle', status: 'Auto-booked' },
{ id: 'l3', route: 'Home → Katunayake Aeroport', when: 'Sat 20 Sep · 05:20', mode: 'Metro + Air Taxi', status: 'Booked' }];


export const pastJourneys = [
{ id: 'p1', route: 'Colombo Central → Malabe', when: 'Yesterday · 08:12', spend: 2.4, co2: 1.8 },
{ id: 'p2', route: 'Malabe → Colombo Central', when: 'Yesterday · 17:44', spend: 2.4, co2: 1.8 },
{ id: 'p3', route: 'Home → Port City Skyport', when: '16 Sep · 11:05', spend: 7.9, co2: 0.6 },
{ id: 'p4', route: 'Colombo Central → Moratuwa', when: '15 Sep · 19:20', spend: 1.6, co2: 1.1 }];


export const trackedSteps: TrackedStep[] = [
{ id: 't1', label: 'Colombo Mobility Hub', detail: 'Boarded · Platform 2', state: 'done', time: '08:40' },
{ id: 't2', label: 'Hyper Metro HM-3310', detail: 'Carriage 4 · 612 km/h', state: 'done', time: '08:40 – 08:52', mode: 'metro' },
{ id: 't3', label: 'Kandy Skyport', detail: 'Arriving · Pad B transfer in 4 min', state: 'current', time: '09:06', mode: 'airtaxi' },
{ id: 't4', label: 'Smart Shuttle SS-5521', detail: 'Waiting at bay 3 · held 3 min for you', state: 'upcoming', time: '09:12', mode: 'shuttle' },
{ id: 't5', label: 'Kandy Lake Terrace', detail: 'Destination · 40 m walk', state: 'upcoming', time: '09:32' }];


export const liveTelemetry = {
  speedKmh: 612,
  remainingKm: 38.4,
  etaMinutes: 24,
  etaClock: '09:32',
  nextStation: 'Kandy Skyport',
  nextStationMin: 6,
  progress: 0.58
};