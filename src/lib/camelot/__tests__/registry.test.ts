import { describe, it, expect } from 'vitest';
import { THREAD_COLORS, CHARM_OPTIONS, NULL_CHARM } from '../registry';

describe('Camelot Registry', () => {
  it('should have a consistent list of thread colors', () => {
    expect(THREAD_COLORS.length).toBeGreaterThan(0);
    expect(THREAD_COLORS[0]).toHaveProperty('name');
    expect(THREAD_COLORS[0]).toHaveProperty('hex');
  });

  it('should have a consistent list of charm options', () => {
    expect(CHARM_OPTIONS.length).toBeGreaterThan(0);
    expect(CHARM_OPTIONS[0]).toHaveProperty('id');
    expect(CHARM_OPTIONS[0]).toHaveProperty('name');
  });

  it('should define a NULL_CHARM correctly', () => {
    expect(NULL_CHARM.id).toBe('none');
    expect(NULL_CHARM.name).toBe('No Charm');
  });
});
