export interface Card {
  id: string;
  type: string;
  prompt: string;
  answer: string;
  imageUrl?: string;
  audioUrl?: string;
  emoji?: string;
  imageKey?: string;
  lang?: string;
}

export interface ProgressLike {
  repetitions: number;
}

export type QuestionType =
  | "image_and_word_to_translation_mc"
  | "image_to_word_mc"
  | "word_to_translation_mc"
  | "word_to_image_mc"
  | "image_to_type_answer"
  | "translation_to_type_answer";

export interface QuestionData {
  cardId: string;
  questionType: QuestionType;
  correctAnswer: string;
  prompt?: string;
  word?: string;
  imageUrl?: string;
  audioUrl?: string;
  emoji?: string;
  imageKey?: string;
  lang?: string;
  options?: (string | { text: string; imageUrl?: string; emoji?: string; imageKey?: string })[];
  feedback: {
    word: string;
    translation: string;
    imageUrl?: string;
    audioUrl?: string;
    emoji?: string;
    imageKey?: string;
    lang?: string;
  };
}

export const getQuestionType = (repetitions: number): QuestionType => {
  if (repetitions === 0) return "image_and_word_to_translation_mc";
  if (repetitions === 1) return "image_to_word_mc";
  if (repetitions === 2) return "word_to_translation_mc";
  if (repetitions === 3) return "word_to_image_mc";
  if (repetitions === 4) return "image_to_type_answer";
  return "translation_to_type_answer";
};

const shuffle = <T>(arr: T[], rng: () => number = Math.random): T[] =>
  [...arr].sort(() => rng() - 0.5);

export const pickDistractors = (
  card: Card,
  deckCards: Card[],
  count = 3,
  rng: () => number = Math.random,
): Card[] =>
  shuffle(
    deckCards.filter((c) => c.id !== card.id && c.answer !== card.answer),
    rng,
  ).slice(0, count);

export function generateQuestion(
  card: Card,
  deckCards: Card[],
  progress: ProgressLike,
  rng: () => number = Math.random,
): QuestionData {
  const questionType = getQuestionType(progress.repetitions);
  const distractors = pickDistractors(card, deckCards, 3, rng);
  const allOptions = shuffle([card, ...distractors], rng);

  const data: QuestionData = {
    cardId: card.id,
    questionType,
    correctAnswer: "", // always overwritten in the switch below
    emoji: card.emoji,
    imageKey: card.imageKey,
    lang: card.lang,
    feedback: {
      word: card.answer,
      translation: card.prompt,
      imageUrl: card.imageUrl,
      audioUrl: card.audioUrl,
      emoji: card.emoji,
      imageKey: card.imageKey,
      lang: card.lang,
    },
  };

  switch (questionType) {
    case "image_and_word_to_translation_mc":
      data.prompt = card.prompt;
      data.imageUrl = card.imageUrl;
      data.word = card.answer;
      data.options = allOptions.map((o) => o.prompt);
      data.correctAnswer = card.prompt;
      break;

    case "image_to_word_mc":
      data.prompt = "What is this?";
      data.imageUrl = card.imageUrl;
      data.options = allOptions.map((o) => o.answer);
      data.correctAnswer = card.answer;
      break;

    case "word_to_translation_mc":
      data.prompt = "Translate this word:";
      data.word = card.answer;
      data.options = allOptions.map((o) => o.prompt);
      data.correctAnswer = card.prompt;
      break;

    case "word_to_image_mc":
      data.prompt = "Which image represents this word?";
      data.word = card.answer;
      data.options = allOptions.map((o) => ({
        text: o.answer,
        imageUrl: o.imageUrl,
        emoji: o.emoji,
        imageKey: o.imageKey,
      }));
      data.correctAnswer = card.answer;
      break;

    case "image_to_type_answer":
      data.prompt = "What is this in English?";
      data.imageUrl = card.imageUrl;
      data.correctAnswer = card.answer;
      break;

    case "translation_to_type_answer":
      data.prompt = `How do you say "${card.prompt}" in English?`;
      data.correctAnswer = card.answer;
      break;
  }

  if (card.audioUrl) data.audioUrl = card.audioUrl;

  return data;
}
