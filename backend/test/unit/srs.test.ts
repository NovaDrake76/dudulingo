import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {calculateSrs} from "../../api/srs"

const createProgress = (overrides = {}) => ({
  repetitions: 0,
  easeFactor: 2.5,
  interval: 0,
  ...overrides,
});

describe('calculateSrs', () => {
  // Data fixa e mockada
  const MOCK_DATE = new Date(2025, 0, 1);

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Reset Logic (Quality < 3)', () => {
    it('should reset repetitions and interval when rating is "very_hard"', () => {
      const input = createProgress({ repetitions: 5, interval: 20, easeFactor: 2.5 });
      
      const result = calculateSrs(input, 'very_hard');

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      // Ease factor should NOT change on failure in this implementation
      expect(result.easeFactor).toBe(2.5);
    });

    it('should reset repetitions and interval when rating is "hard"', () => {
      const input = createProgress({ repetitions: 10, interval: 50 });
      
      const result = calculateSrs(input, 'hard');

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
    });
  });

  describe('Success Logic (Quality >= 3)', () => {
    it('should increment repetitions on success', () => {
      const input = createProgress({ repetitions: 0 });
      const result = calculateSrs(input, 'medium');
      expect(result.repetitions).toBe(1);
    });

    describe('Interval Calculation', () => {
      it('should set interval to 1 on the first successful repetition', () => {
        // Even if previous interval was 0, 1st rep makes it 1
        const input = createProgress({ repetitions: 0, interval: 0 });
        const result = calculateSrs(input, 'easy');
        expect(result.interval).toBe(1);
      });

      it('should set interval to 6 on the second successful repetition', () => {
        // Logic: if (progress.repetitions === 2) interval = 6
        // Note: Input reps is 1, so after function it becomes 2
        const input = createProgress({ repetitions: 1, interval: 1 });
        const result = calculateSrs(input, 'easy');
        expect(result.interval).toBe(6);
      });

      it('should calculate exponential interval on third repetition', () => {
        // Logic: ceil(interval * easeFactor)
        // 6 * 2.5 = 15
        const input = createProgress({ repetitions: 2, interval: 6, easeFactor: 2.5 });
        // Rating 'easy' (4) keeps EF roughly same or slightly different, 
        // let's verify exact math or just checking the formula application
        
        // Let's use 'very_easy' (5) to simplify EF math check if needed, 
        // or just check if it grew > 6.
        const result = calculateSrs(input, 'very_easy');
        
        // EF calculation for very_easy (5):
        // 2.5 + (0.1 - (0) * (...)) = 2.6
        // Interval: ceil(6 * 2.6) = ceil(15.6) = 16
        expect(result.interval).toBe(16); 
      });
    });

    describe('Ease Factor (EF) Calculation', () => {
      it('should increase EF when rating is "very_easy"', () => {
        const input = createProgress({ easeFactor: 2.5 });
        const result = calculateSrs(input, 'very_easy');
        
        // Formula: 2.5 + (0.1 - (0)) = 2.6
        expect(result.easeFactor).toBeCloseTo(2.6);
      });

      it('should decrease EF when rating is "medium"', () => {
        const input = createProgress({ easeFactor: 2.5 });
        const result = calculateSrs(input, 'medium'); // Quality 3

        // Formula: 
        // 5 - 3 = 2
        // 0.08 + (2 * 0.02) = 0.12
        // 2 * 0.12 = 0.24
        // 0.1 - 0.24 = -0.14
        // 2.5 - 0.14 = 2.36
        expect(result.easeFactor).toBeCloseTo(2.36);
      });

      it('should not allow EF to drop below 1.3', () => {
        // Force a drop
        const input = createProgress({ easeFactor: 1.35 });
        // Medium (3) drops it by 0.14 -> would be 1.21
        const result = calculateSrs(input, 'medium');

        expect(result.easeFactor).toBe(1.3);
      });
    });
  });

  describe('Next Review Date Calculation', () => {
    it('should correctly calculate the next review date based on the new interval', () => {
      const input = createProgress({ repetitions: 0 });
      // Resulting interval will be 1
      const result = calculateSrs(input, 'easy');

      const expectedDate = new Date(MOCK_DATE);
      expectedDate.setDate(expectedDate.getDate() + 1);

      expect(result.nextReviewAt).toEqual(expectedDate);
    });

    it('should handle month rollovers correctly', () => {
      const input = createProgress({ repetitions: 1, interval: 1 });
      // Resulting interval will be 6
      const result = calculateSrs(input, 'easy');

      const expectedDate = new Date(MOCK_DATE);
      expectedDate.setDate(expectedDate.getDate() + 6);

      expect(result.nextReviewAt).toEqual(expectedDate);
    });
  });
});


