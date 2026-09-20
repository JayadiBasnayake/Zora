import { describe, expect, it } from 'vitest';
import { resolveIntent } from '../src/services/orbit';

describe('ORBIT emergency intent', () => {
  it.each([
    'help', 'SOS', 'there is a fire', "I'm hurt", 'I am injured', 'someone is unconscious',
    'a person collapsed', 'I am under attack', 'There was an accident', 'call police',
    'I feel unsafe', 'send an ambulance', 'emergency', 'I need help now', 'ORBIT, emergency'
  ])('recognizes %s as emergency', (message) => {
    expect(resolveIntent(message, { hasJourney: true, emergencyActive: false, zeroBalance: false }).intent).toBe('EMERGENCY');
  });

  it('prioritizes the emergency keyword even inside an ordinary-sounding request', () => {
    expect(resolveIntent('Can you help me find a bus?', { hasJourney: true, emergencyActive: false, zeroBalance: false }).intent).toBe('EMERGENCY');
    expect(resolveIntent('translate this', { hasJourney: true, emergencyActive: false, zeroBalance: false }).intent).toBe('UNKNOWN');
  });
});