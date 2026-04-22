import { calculateSrs } from "../../../services/srs";

const createProgress = (overrides = {}) => ({
  repetitions: 0,
  easeFactor: 2.5,
  interval: 0,
  ...overrides,
});

describe("calculateSrs", () => {
  const MOCK_DATE = new Date(2025, 0, 1);

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(MOCK_DATE);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("Reset Logic (Quality < 3)", () => {
    it('should reset repetitions and interval when rating is "very_hard" and decrease EF', () => {
      const input = createProgress({ repetitions: 5, interval: 20, easeFactor: 2.5 });
      const result = calculateSrs(input, "very_hard");

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeCloseTo(1.7);
    });

    it('should reset repetitions and interval when rating is "hard" and decrease EF', () => {
      const input = createProgress({ repetitions: 10, interval: 50 });
      const result = calculateSrs(input, "hard");

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBeCloseTo(1.96);
    });

    it("should clamp EF to 1.3 on repeated failures", () => {
      const input = createProgress({ repetitions: 3, interval: 10, easeFactor: 1.5 });
      const result = calculateSrs(input, "very_hard");

      expect(result.repetitions).toBe(0);
      expect(result.interval).toBe(1);
      expect(result.easeFactor).toBe(1.3);
    });
  });

  describe("Success Logic (Quality >= 3)", () => {
    it("should increment repetitions on success", () => {
      const input = createProgress({ repetitions: 0 });
      const result = calculateSrs(input, "medium");
      expect(result.repetitions).toBe(1);
    });

    describe("Interval Calculation", () => {
      it("should set interval to 1 on the first successful repetition", () => {
        const input = createProgress({ repetitions: 0, interval: 0 });
        const result = calculateSrs(input, "easy");
        expect(result.interval).toBe(1);
      });

      it("should set interval to 6 on the second successful repetition", () => {
        const input = createProgress({ repetitions: 1, interval: 1 });
        const result = calculateSrs(input, "easy");
        expect(result.interval).toBe(6);
      });

      it("should calculate exponential interval on third repetition", () => {
        const input = createProgress({ repetitions: 2, interval: 6, easeFactor: 2.5 });
        const result = calculateSrs(input, "very_easy");
        expect(result.interval).toBe(16);
      });
    });

    describe("Ease Factor (EF) Calculation", () => {
      it('should increase EF when rating is "very_easy"', () => {
        const input = createProgress({ easeFactor: 2.5 });
        const result = calculateSrs(input, "very_easy");
        expect(result.easeFactor).toBeCloseTo(2.6);
      });

      it('should decrease EF when rating is "medium"', () => {
        const input = createProgress({ easeFactor: 2.5 });
        const result = calculateSrs(input, "medium");
        expect(result.easeFactor).toBeCloseTo(2.36);
      });

      it("should not allow EF to drop below 1.3", () => {
        const input = createProgress({ easeFactor: 1.35 });
        const result = calculateSrs(input, "medium");
        expect(result.easeFactor).toBe(1.3);
      });
    });
  });

  describe("Next Review Date Calculation", () => {
    it("should correctly calculate the next review date based on the new interval", () => {
      const input = createProgress({ repetitions: 0 });
      const result = calculateSrs(input, "easy");

      const expectedDate = new Date(MOCK_DATE);
      expectedDate.setDate(expectedDate.getDate() + 1);

      expect(result.nextReviewAt).toEqual(expectedDate);
    });

    it("should handle month rollovers correctly", () => {
      const input = createProgress({ repetitions: 1, interval: 1 });
      const result = calculateSrs(input, "easy");

      const expectedDate = new Date(MOCK_DATE);
      expectedDate.setDate(expectedDate.getDate() + 6);

      expect(result.nextReviewAt).toEqual(expectedDate);
    });
  });
});
