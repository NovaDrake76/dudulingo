export interface DeckRow {
  id: string;
  name: string;
  description: string | null;
  lang: string | null;
  pack_version: number;
  updated_at: number;
}

export interface CardRow {
  id: string;
  deck_id: string;
  type: string;
  level: number;
  prompt: string | null;
  answer: string;
  image_path: string | null;
  image_source: string | null;
  image_license: string | null;
  audio_path: string | null;
  emoji: string | null;
  image_key: string | null;
  lang: string | null;
  pack_version: number;
}

export interface ProgressRow {
  card_id: string;
  deck_id: string;
  ease_factor: number;
  interval: number;
  repetitions: number;
  next_review_at: number;
  updated_at: number;
  synced_at: number | null;
}

export interface PackVersionRow {
  lang: string;
  active_version: number;
  folder_path: string;
  installed_at: number;
}

export interface CardWithProgress {
  card: CardRow;
  progress: ProgressRow | null;
}
