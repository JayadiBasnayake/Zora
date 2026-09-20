import type { OrbitMessage } from '../types';

export const orbitThread: OrbitMessage[] = [
{
  id: 'o1',
  from: 'orbit',
  body: 'Good morning, Jayadi. Your 08:40 to Kandy is on schedule and your shuttle at the far end is already assigned.',
  time: '07:52',
  severity: 'info'
},
{
  id: 'o2',
  from: 'user',
  body: 'Any risk on the air leg? The weather looked unsettled.',
  time: '07:54'
},
{
  id: 'o3',
  from: 'orbit',
  body: 'Your autonomous train is experiencing a 6-minute delay. I found an alternative route arriving 4 minutes earlier — Metro to Battaramulla, then air taxi through the highland corridor.',
  time: '08:46',
  severity: 'warning',
  actions: [{ label: 'View Alternative', action: 'VIEW_ALTERNATIVE' }, { label: 'Keep Current Journey', action: 'KEEP_JOURNEY' }]
}];


export const orbitSuggestions = [
'Will I make my connection?',
'Find a step-free route home',
'Cheapest way to Malabe tomorrow',
'Hold my shuttle for 5 minutes'];
