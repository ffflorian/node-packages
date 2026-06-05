import {describe, expect, test} from 'vitest';

import {isWithinLastDay} from './FileService.js';

describe('isWithinLastDay', () => {
  test('returns true when date is just after the same time yesterday', () => {
    const now = new Date('2026-01-15T12:00:00.000Z');
    const justAfter = new Date('2026-01-14T12:00:00.001Z');
    expect(isWithinLastDay(justAfter, now)).toBe(true);
  });

  test('returns false when date is exactly the same time yesterday', () => {
    const now = new Date('2026-01-15T12:00:00.000Z');
    const exactlyYesterday = new Date('2026-01-14T12:00:00.000Z');
    expect(isWithinLastDay(exactlyYesterday, now)).toBe(false);
  });

  test('returns false when date is before yesterday', () => {
    const now = new Date('2026-01-15T12:00:00.000Z');
    const twoDaysAgo = new Date('2026-01-13T12:00:00.000Z');
    expect(isWithinLastDay(twoDaysAgo, now)).toBe(false);
  });

  test('returns true when date equals now', () => {
    const now = new Date('2026-01-15T12:00:00.000Z');
    expect(isWithinLastDay(now, now)).toBe(true);
  });
});
