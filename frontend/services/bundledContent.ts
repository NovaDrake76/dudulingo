/**
 * Bundled decks — ship inside the app binary so first launch works offline
 * with real content, no network. Each card has a prompt (Portuguese — the
 * learner's native language), an answer (target language), and an emoji that
 * stands in as a visual cue. Audio is produced on-device via expo-speech at
 * runtime, so no MP3 files are packaged here.
 */

export const BUNDLED_VERSION = 3;

export interface BundledCard {
  prompt: string;
  answer: string;
  /** Looked up in `assets/cards/index.ts` for a bundled CC0 photo. */
  imageKey?: string;
}

export interface BundledDeck {
  id: string;
  lang: string;
  name: string;
  description: string;
  cards: BundledCard[];
}

// ─────────────────────────── ENGLISH ───────────────────────────

const EN_COMMON: BundledCard[] = [
  { prompt: "o, a, os, as", answer: "the" },
  { prompt: "ser, estar", answer: "be" },
  { prompt: "para, a", answer: "to" },
  { prompt: "de", answer: "of" },
  { prompt: "e", answer: "and" },
  { prompt: "um, uma", answer: "a" },
  { prompt: "em, no, na", answer: "in" },
  { prompt: "aquele, essa, isso, que", answer: "that" },
  { prompt: "ter", answer: "have" },
  { prompt: "eu", answer: "I" },
  { prompt: "isto, isso", answer: "it" },
  { prompt: "para, por", answer: "for" },
  { prompt: "não", answer: "not" },
  { prompt: "em, sobre", answer: "on" },
  { prompt: "com", answer: "with" },
  { prompt: "ele", answer: "he" },
  { prompt: "como, enquanto", answer: "as" },
  { prompt: "você", answer: "you" },
  { prompt: "fazer", answer: "do" },
  { prompt: "em, a, às", answer: "at" },
  { prompt: "este, esta, isto", answer: "this" },
  { prompt: "mas, porém", answer: "but" },
  { prompt: "dele", answer: "his" },
  { prompt: "por, perto de", answer: "by" },
  { prompt: "de, desde", answer: "from" },
  { prompt: "eles, elas", answer: "they" },
  { prompt: "nós", answer: "we" },
  { prompt: "dizer", answer: "say" },
  { prompt: "dela", answer: "her" },
  { prompt: "ela", answer: "she" },
];

const EN_ANIMALS: BundledCard[] = [
  { prompt: "Cachorro", answer: "Dog", imageKey: "dog" },
  { prompt: "Gato", answer: "Cat", imageKey: "cat" },
  { prompt: "Leão", answer: "Lion", imageKey: "lion" },
  { prompt: "Tigre", answer: "Tiger", imageKey: "tiger" },
  { prompt: "Elefante", answer: "Elephant", imageKey: "elephant" },
  { prompt: "Macaco", answer: "Monkey", imageKey: "monkey" },
  { prompt: "Girafa", answer: "Giraffe", imageKey: "giraffe" },
  { prompt: "Zebra", answer: "Zebra", imageKey: "zebra" },
  { prompt: "Urso", answer: "Bear", imageKey: "bear" },
  { prompt: "Pássaro", answer: "Bird", imageKey: "bird" },
  { prompt: "Peixe", answer: "Fish", imageKey: "fish" },
  { prompt: "Cavalo", answer: "Horse", imageKey: "horse" },
  { prompt: "Coelho", answer: "Rabbit", imageKey: "rabbit" },
  { prompt: "Vaca", answer: "Cow", imageKey: "cow" },
  { prompt: "Ovelha", answer: "Sheep", imageKey: "sheep" },
];

const EN_TRAVEL: BundledCard[] = [
  { prompt: "Olá", answer: "Hello" },
  { prompt: "Tchau", answer: "Goodbye" },
  { prompt: "Por favor", answer: "Please" },
  { prompt: "Obrigado", answer: "Thank you" },
  { prompt: "Sim", answer: "Yes" },
  { prompt: "Não", answer: "No" },
  { prompt: "Com licença", answer: "Excuse me" },
  { prompt: "Desculpe", answer: "Sorry" },
  { prompt: "Onde é...?", answer: "Where is...?" },
  { prompt: "Quanto custa?", answer: "How much?", imageKey: "money" },
  { prompt: "Eu não entendo", answer: "I don't understand" },
  { prompt: "Você fala inglês?", answer: "Do you speak English?" },
  { prompt: "Água", answer: "Water", imageKey: "water" },
  { prompt: "Comida", answer: "Food", imageKey: "food" },
  { prompt: "Banheiro", answer: "Bathroom", imageKey: "bathroom" },
  { prompt: "Aeroporto", answer: "Airport", imageKey: "airport" },
  { prompt: "Hotel", answer: "Hotel", imageKey: "hotel" },
  { prompt: "Estação de trem", answer: "Train station", imageKey: "train" },
  { prompt: "Táxi", answer: "Taxi", imageKey: "taxi" },
  { prompt: "Polícia", answer: "Police", imageKey: "police" },
  { prompt: "Hospital", answer: "Hospital", imageKey: "hospital" },
  { prompt: "Ajuda!", answer: "Help!" },
  { prompt: "Bom dia", answer: "Good morning", imageKey: "morning" },
  { prompt: "Boa noite", answer: "Good night", imageKey: "night" },
  { prompt: "Quanto tempo?", answer: "How long?" },
];

// ─────────────────────────── ITALIAN ───────────────────────────

const IT_COMMON: BundledCard[] = [
  { prompt: "o, a, os, as", answer: "il, la, lo" },
  { prompt: "ser, estar", answer: "essere" },
  { prompt: "para, a", answer: "per" },
  { prompt: "de", answer: "di" },
  { prompt: "e", answer: "e" },
  { prompt: "um, uma", answer: "un, una" },
  { prompt: "em, no, na", answer: "in" },
  { prompt: "que", answer: "che" },
  { prompt: "ter", answer: "avere" },
  { prompt: "eu", answer: "io" },
  { prompt: "isto, isso", answer: "questo" },
  { prompt: "para, por", answer: "per" },
  { prompt: "não", answer: "non" },
  { prompt: "em, sobre", answer: "su" },
  { prompt: "com", answer: "con" },
  { prompt: "ele", answer: "lui" },
  { prompt: "como", answer: "come" },
  { prompt: "você", answer: "tu" },
  { prompt: "fazer", answer: "fare" },
  { prompt: "em, a, às", answer: "a" },
  { prompt: "este, esta", answer: "questo" },
  { prompt: "mas", answer: "ma" },
  { prompt: "dele", answer: "suo" },
  { prompt: "por, perto de", answer: "da" },
  { prompt: "de, desde", answer: "da" },
  { prompt: "eles, elas", answer: "loro" },
  { prompt: "nós", answer: "noi" },
  { prompt: "dizer", answer: "dire" },
  { prompt: "dela", answer: "lei" },
  { prompt: "ela", answer: "lei" },
];

const IT_ANIMALS: BundledCard[] = [
  { prompt: "Cachorro", answer: "Cane", imageKey: "dog" },
  { prompt: "Gato", answer: "Gatto", imageKey: "cat" },
  { prompt: "Leão", answer: "Leone", imageKey: "lion" },
  { prompt: "Tigre", answer: "Tigre", imageKey: "tiger" },
  { prompt: "Elefante", answer: "Elefante", imageKey: "elephant" },
  { prompt: "Macaco", answer: "Scimmia", imageKey: "monkey" },
  { prompt: "Girafa", answer: "Giraffa", imageKey: "giraffe" },
  { prompt: "Zebra", answer: "Zebra", imageKey: "zebra" },
  { prompt: "Urso", answer: "Orso", imageKey: "bear" },
  { prompt: "Pássaro", answer: "Uccello", imageKey: "bird" },
  { prompt: "Peixe", answer: "Pesce", imageKey: "fish" },
  { prompt: "Cavalo", answer: "Cavallo", imageKey: "horse" },
  { prompt: "Coelho", answer: "Coniglio", imageKey: "rabbit" },
  { prompt: "Vaca", answer: "Mucca", imageKey: "cow" },
  { prompt: "Ovelha", answer: "Pecora", imageKey: "sheep" },
];

const IT_TRAVEL: BundledCard[] = [
  { prompt: "Olá", answer: "Ciao" },
  { prompt: "Tchau", answer: "Arrivederci" },
  { prompt: "Por favor", answer: "Per favore" },
  { prompt: "Obrigado", answer: "Grazie" },
  { prompt: "Sim", answer: "Sì" },
  { prompt: "Não", answer: "No" },
  { prompt: "Com licença", answer: "Scusi" },
  { prompt: "Desculpe", answer: "Mi dispiace" },
  { prompt: "Onde é...?", answer: "Dov'è...?" },
  { prompt: "Quanto custa?", answer: "Quanto costa?", imageKey: "money" },
  { prompt: "Eu não entendo", answer: "Non capisco" },
  { prompt: "Você fala inglês?", answer: "Parla inglese?" },
  { prompt: "Água", answer: "Acqua", imageKey: "water" },
  { prompt: "Comida", answer: "Cibo", imageKey: "food" },
  { prompt: "Banheiro", answer: "Bagno", imageKey: "bathroom" },
  { prompt: "Aeroporto", answer: "Aeroporto", imageKey: "airport" },
  { prompt: "Hotel", answer: "Albergo", imageKey: "hotel" },
  { prompt: "Estação de trem", answer: "Stazione", imageKey: "train" },
  { prompt: "Táxi", answer: "Taxi", imageKey: "taxi" },
  { prompt: "Polícia", answer: "Polizia", imageKey: "police" },
  { prompt: "Hospital", answer: "Ospedale", imageKey: "hospital" },
  { prompt: "Ajuda!", answer: "Aiuto!" },
  { prompt: "Bom dia", answer: "Buongiorno", imageKey: "morning" },
  { prompt: "Boa noite", answer: "Buonanotte", imageKey: "night" },
  { prompt: "Quanto tempo?", answer: "Quanto tempo?" },
];

// ─────────────────────────── GERMAN ───────────────────────────

const DE_COMMON: BundledCard[] = [
  { prompt: "o, a, os, as", answer: "der, die, das" },
  { prompt: "ser, estar", answer: "sein" },
  { prompt: "para, a", answer: "zu" },
  { prompt: "de", answer: "von" },
  { prompt: "e", answer: "und" },
  { prompt: "um, uma", answer: "ein, eine" },
  { prompt: "em, no, na", answer: "in" },
  { prompt: "que", answer: "dass" },
  { prompt: "ter", answer: "haben" },
  { prompt: "eu", answer: "ich" },
  { prompt: "isto, isso", answer: "es" },
  { prompt: "para, por", answer: "für" },
  { prompt: "não", answer: "nicht" },
  { prompt: "em, sobre", answer: "auf" },
  { prompt: "com", answer: "mit" },
  { prompt: "ele", answer: "er" },
  { prompt: "como", answer: "wie" },
  { prompt: "você", answer: "du" },
  { prompt: "fazer", answer: "machen" },
  { prompt: "em, a, às", answer: "an" },
  { prompt: "este, esta", answer: "dieser" },
  { prompt: "mas", answer: "aber" },
  { prompt: "dele", answer: "sein" },
  { prompt: "por, perto de", answer: "bei" },
  { prompt: "de, desde", answer: "aus" },
  { prompt: "eles, elas", answer: "sie" },
  { prompt: "nós", answer: "wir" },
  { prompt: "dizer", answer: "sagen" },
  { prompt: "dela", answer: "ihr" },
  { prompt: "ela", answer: "sie" },
];

const DE_ANIMALS: BundledCard[] = [
  { prompt: "Cachorro", answer: "Hund", imageKey: "dog" },
  { prompt: "Gato", answer: "Katze", imageKey: "cat" },
  { prompt: "Leão", answer: "Löwe", imageKey: "lion" },
  { prompt: "Tigre", answer: "Tiger", imageKey: "tiger" },
  { prompt: "Elefante", answer: "Elefant", imageKey: "elephant" },
  { prompt: "Macaco", answer: "Affe", imageKey: "monkey" },
  { prompt: "Girafa", answer: "Giraffe", imageKey: "giraffe" },
  { prompt: "Zebra", answer: "Zebra", imageKey: "zebra" },
  { prompt: "Urso", answer: "Bär", imageKey: "bear" },
  { prompt: "Pássaro", answer: "Vogel", imageKey: "bird" },
  { prompt: "Peixe", answer: "Fisch", imageKey: "fish" },
  { prompt: "Cavalo", answer: "Pferd", imageKey: "horse" },
  { prompt: "Coelho", answer: "Kaninchen", imageKey: "rabbit" },
  { prompt: "Vaca", answer: "Kuh", imageKey: "cow" },
  { prompt: "Ovelha", answer: "Schaf", imageKey: "sheep" },
];

const DE_TRAVEL: BundledCard[] = [
  { prompt: "Olá", answer: "Hallo" },
  { prompt: "Tchau", answer: "Tschüss" },
  { prompt: "Por favor", answer: "Bitte" },
  { prompt: "Obrigado", answer: "Danke" },
  { prompt: "Sim", answer: "Ja" },
  { prompt: "Não", answer: "Nein" },
  { prompt: "Com licença", answer: "Entschuldigung" },
  { prompt: "Desculpe", answer: "Es tut mir leid" },
  { prompt: "Onde é...?", answer: "Wo ist...?" },
  { prompt: "Quanto custa?", answer: "Wie viel kostet das?", imageKey: "money" },
  { prompt: "Eu não entendo", answer: "Ich verstehe nicht" },
  { prompt: "Você fala inglês?", answer: "Sprechen Sie Englisch?" },
  { prompt: "Água", answer: "Wasser", imageKey: "water" },
  { prompt: "Comida", answer: "Essen", imageKey: "food" },
  { prompt: "Banheiro", answer: "Toilette", imageKey: "bathroom" },
  { prompt: "Aeroporto", answer: "Flughafen", imageKey: "airport" },
  { prompt: "Hotel", answer: "Hotel", imageKey: "hotel" },
  { prompt: "Estação de trem", answer: "Bahnhof", imageKey: "train" },
  { prompt: "Táxi", answer: "Taxi", imageKey: "taxi" },
  { prompt: "Polícia", answer: "Polizei", imageKey: "police" },
  { prompt: "Hospital", answer: "Krankenhaus", imageKey: "hospital" },
  { prompt: "Ajuda!", answer: "Hilfe!" },
  { prompt: "Bom dia", answer: "Guten Morgen", imageKey: "morning" },
  { prompt: "Boa noite", answer: "Gute Nacht", imageKey: "night" },
  { prompt: "Quanto tempo?", answer: "Wie lange?" },
];

// ─────────────────────────── asm ───────────────────────────

export const BUNDLED_DECKS: BundledDeck[] = [
  {
    id: "en-v3-common",
    lang: "en",
    name: "Most Common Words",
    description: "The 30 most-used words in English, for a quick foundation.",
    cards: EN_COMMON,
  },
  {
    id: "en-v3-animals",
    lang: "en",
    name: "Animals",
    description: "15 everyday animals with photos.",
    cards: EN_ANIMALS,
  },
  {
    id: "en-v3-travel",
    lang: "en",
    name: "Travel Basics",
    description: "25 words and phrases for traveling — hellos, help, directions.",
    cards: EN_TRAVEL,
  },
  {
    id: "it-v3-common",
    lang: "it",
    name: "Parole Più Comuni",
    description: "Le 30 parole più utilizzate per iniziare con l'italiano.",
    cards: IT_COMMON,
  },
  {
    id: "it-v3-animals",
    lang: "it",
    name: "Animali",
    description: "15 animali comuni con foto.",
    cards: IT_ANIMALS,
  },
  {
    id: "it-v3-travel",
    lang: "it",
    name: "Viaggio in Italia",
    description: "25 parole e frasi per viaggiare — saluti, aiuto, indicazioni.",
    cards: IT_TRAVEL,
  },
  {
    id: "de-v3-common",
    lang: "de",
    name: "Häufigste Wörter",
    description: "Die 30 meistverwendeten Wörter für den Einstieg.",
    cards: DE_COMMON,
  },
  {
    id: "de-v3-animals",
    lang: "de",
    name: "Tiere",
    description: "15 alltägliche Tiere mit Fotos.",
    cards: DE_ANIMALS,
  },
  {
    id: "de-v3-travel",
    lang: "de",
    name: "Reise-Grundlagen",
    description: "25 Wörter und Redewendungen für unterwegs.",
    cards: DE_TRAVEL,
  },
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "") || "x";

export interface ExpandedCard {
  id: string;
  deck_id: string;
  type: string;
  level: number;
  prompt: string;
  answer: string;
  emoji: string | null;
  image_key: string | null;
  lang: string;
  pack_version: number;
}

export function expandBundledDeck(deck: BundledDeck): ExpandedCard[] {
  return deck.cards.map((c, i) => ({
    id: `${deck.id}-${String(i + 1).padStart(2, "0")}-${slug(c.answer)}`,
    deck_id: deck.id,
    type: "basic",
    level: 1,
    prompt: c.prompt,
    answer: c.answer,
    emoji: null,
    image_key: c.imageKey ?? null,
    lang: deck.lang,
    pack_version: BUNDLED_VERSION,
  }));
}
