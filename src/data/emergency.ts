// TODO: verify national emergency numbers before production launch.
export const EMERGENCY_NUMBER = '119';

export const emergencyOptions = [
{
  id: 'medical',
  title: 'Medical emergency',
  detail: 'Dispatch medical responders and open a priority corridor to the nearest hospital.',
  icon: 'heart' as const
},
{
  id: 'incident',
  title: 'Road or transit incident',
  detail: 'Report a collision, obstruction, or vehicle hazard on the network.',
  icon: 'alert' as const
},
{
  id: 'vehicle',
  title: 'Vehicle failure',
  detail: 'Your autonomous vehicle has stopped or cannot complete the journey.',
  icon: 'bus' as const
},
{
  id: 'person',
  title: 'Lost person',
  detail: 'Report a missing child or companion and alert station staff nearby.',
  icon: 'user' as const
},
{
  id: 'assist',
  title: 'Personal assistance',
  detail: 'Request an on-site human responder for mobility or safety support.',
  icon: 'hand' as const
}];


export const nearbyFacilities = [
{ id: 'f1', name: 'Kandy General Hospital', kind: 'Hospital', distance: '1.2 km', eta: '4 min', open: true },
{ id: 'f2', name: 'Skyport Medical Point', kind: 'First response', distance: '240 m', eta: '1 min', open: true },
{ id: 'f3', name: 'Central Transit Safety Office', kind: 'Transit authority', distance: '600 m', eta: '3 min', open: true },
{ id: 'f4', name: 'Highland Fire & Rescue', kind: 'Fire & rescue', distance: '2.8 km', eta: '6 min', open: true }];


export const currentLocation = {
  label: 'Kandy Skyport · Pad B concourse',
  coords: '7.2906° N, 80.6337° E',
  accuracy: '4 m',
  vehicle: 'HM-3310 · Carriage 4'
};