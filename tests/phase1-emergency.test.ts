import { describe, expect, it } from 'vitest';
import { EMERGENCY_NUMBER } from '../src/data/emergency';
import { dispatchEmergency } from '../src/services/mockApi';

describe('emergency safety contract', () => {
  it('uses the single verified emergency number constant', () => {
    expect(EMERGENCY_NUMBER).toBe('119');
  });

  it('keeps the exact location in the mock dispatch payload', async () => {
    const result = await dispatchEmergency('Medical', 'Approximate location supplied by citizen');
    expect(result.location).toBe('Approximate location supplied by citizen');
  });
});