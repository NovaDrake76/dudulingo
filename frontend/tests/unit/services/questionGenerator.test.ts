import {
  Card,
  generateQuestion,
  getQuestionType,
  pickDistractors,
} from "../../../services/review/questionGenerator";

const makeCard = (overrides: Partial<Card> = {}): Card => ({
  id: overrides.id ?? "c1",
  type: "basic",
  prompt: "Gato",
  answer: "Cat",
  imageUrl: "cat.webp",
  audioUrl: "cat.mp3",
  lang: "en",
  ...overrides,
});

const deckOf = (...cards: Card[]) => cards;
const stableRng = () => 0; // deterministic shuffle

describe("getQuestionType", () => {
  it.each([
    [0, "image_and_word_to_translation_mc"],
    [1, "image_to_word_mc"],
    [2, "word_to_translation_mc"],
    [3, "word_to_image_mc"],
    [4, "image_to_type_answer"],
    [5, "translation_to_type_answer"],
    [99, "translation_to_type_answer"],
  ])("repetitions=%i maps to %s", (reps, expected) => {
    expect(getQuestionType(reps as number)).toBe(expected);
  });
});

describe("pickDistractors", () => {
  it("excludes the card itself", () => {
    const target = makeCard({ id: "c1", answer: "Cat" });
    const others = [
      makeCard({ id: "c2", answer: "Dog", prompt: "Cachorro" }),
      makeCard({ id: "c3", answer: "Bird", prompt: "Pássaro" }),
    ];
    const result = pickDistractors(target, [target, ...others]);
    expect(result.find((c) => c.id === "c1")).toBeUndefined();
  });

  it("excludes cards with the same answer as the target", () => {
    const target = makeCard({ id: "c1", answer: "Cat" });
    const duplicate = makeCard({ id: "c2", answer: "Cat", prompt: "Gato2" });
    const other = makeCard({ id: "c3", answer: "Dog", prompt: "Cachorro" });
    const result = pickDistractors(target, [target, duplicate, other]);
    expect(result.find((c) => c.answer === "Cat")).toBeUndefined();
    expect(result).toHaveLength(1);
  });

  it("returns up to `count` distractors", () => {
    const target = makeCard({ id: "c1" });
    const pool = Array.from({ length: 10 }, (_, i) =>
      makeCard({ id: `c${i + 2}`, answer: `w${i}`, prompt: `p${i}` }),
    );
    const result = pickDistractors(target, [target, ...pool], 3);
    expect(result).toHaveLength(3);
  });
});

describe("generateQuestion", () => {
  const target = makeCard({ id: "c1", prompt: "Gato", answer: "Cat" });
  const deck = deckOf(
    target,
    makeCard({ id: "c2", prompt: "Cachorro", answer: "Dog" }),
    makeCard({ id: "c3", prompt: "Pássaro", answer: "Bird" }),
    makeCard({ id: "c4", prompt: "Peixe", answer: "Fish" }),
  );

  it("type 0: image_and_word_to_translation_mc", () => {
    const q = generateQuestion(target, deck, { repetitions: 0 }, stableRng);
    expect(q.questionType).toBe("image_and_word_to_translation_mc");
    expect(q.prompt).toBe("Gato");
    expect(q.word).toBe("Cat");
    expect(q.imageUrl).toBe("cat.webp");
    expect(q.correctAnswer).toBe("Gato");
    expect(q.options).toContain("Gato");
  });

  it("type 1: image_to_word_mc", () => {
    const q = generateQuestion(target, deck, { repetitions: 1 }, stableRng);
    expect(q.questionType).toBe("image_to_word_mc");
    expect(q.prompt).toBe("What is this?");
    expect(q.imageUrl).toBe("cat.webp");
    expect(q.correctAnswer).toBe("Cat");
    expect(q.options).toContain("Cat");
  });

  it("type 2: word_to_translation_mc", () => {
    const q = generateQuestion(target, deck, { repetitions: 2 }, stableRng);
    expect(q.questionType).toBe("word_to_translation_mc");
    expect(q.prompt).toBe("Translate this word:");
    expect(q.word).toBe("Cat");
    expect(q.correctAnswer).toBe("Gato");
  });

  it("type 3: word_to_image_mc yields image options", () => {
    const q = generateQuestion(target, deck, { repetitions: 3 }, stableRng);
    expect(q.questionType).toBe("word_to_image_mc");
    expect(q.word).toBe("Cat");
    expect(q.correctAnswer).toBe("Cat");
    expect(Array.isArray(q.options)).toBe(true);
    const opts = q.options as { text: string; imageUrl?: string }[];
    expect(opts.every((o) => typeof o === "object" && "text" in o)).toBe(true);
  });

  it("type 4: image_to_type_answer", () => {
    const q = generateQuestion(target, deck, { repetitions: 4 }, stableRng);
    expect(q.questionType).toBe("image_to_type_answer");
    expect(q.imageUrl).toBe("cat.webp");
    expect(q.correctAnswer).toBe("Cat");
    expect(q.options).toBeUndefined();
  });

  it("type 5+: translation_to_type_answer", () => {
    const q = generateQuestion(target, deck, { repetitions: 5 }, stableRng);
    expect(q.questionType).toBe("translation_to_type_answer");
    expect(q.prompt).toContain("Gato");
    expect(q.correctAnswer).toBe("Cat");
  });

  it("always includes feedback payload for flip-card", () => {
    const q = generateQuestion(target, deck, { repetitions: 0 }, stableRng);
    expect(q.feedback).toEqual({
      word: "Cat",
      translation: "Gato",
      imageUrl: "cat.webp",
      audioUrl: "cat.mp3",
      emoji: undefined,
      lang: "en",
    });
  });

  it("includes audioUrl on the question when the card has audio", () => {
    const q = generateQuestion(target, deck, { repetitions: 0 }, stableRng);
    expect(q.audioUrl).toBe("cat.mp3");
  });

  it("omits audioUrl when card has no audio", () => {
    const silent = makeCard({ audioUrl: undefined });
    const q = generateQuestion(silent, [silent], { repetitions: 0 }, stableRng);
    expect(q.audioUrl).toBeUndefined();
  });
});
