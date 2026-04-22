/**
 * Editorial design tokens — paper canvas, ink type, single forest accent,
 * amber for streak, rose for wrong. Ported from the Repecards Redesign.
 */

import { Platform } from "react-native";

// ─────────────────────────────────────────────────────────────
// OKLCH → sRGB helper (since RN can't parse `oklch()` strings).
// L in [0,1], C around [0,0.4], h in degrees.
// ─────────────────────────────────────────────────────────────
function oklchToHex(L: number, C: number, h: number): string {
  const hr = (h * Math.PI) / 180;
  const a = C * Math.cos(hr);
  const b = C * Math.sin(hr);

  const lp = L + 0.3963377774 * a + 0.2158037573 * b;
  const mp = L - 0.1055613458 * a - 0.0638541728 * b;
  const sp = L - 0.0894841775 * a - 1.291485548 * b;

  const l = lp ** 3;
  const m = mp ** 3;
  const s = sp ** 3;

  let r = 4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s;
  let g = -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s;
  let bl = -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s;

  const enc = (c: number) =>
    c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055;

  r = Math.max(0, Math.min(1, enc(r)));
  g = Math.max(0, Math.min(1, enc(g)));
  bl = Math.max(0, Math.min(1, enc(bl)));

  const to2 = (c: number) =>
    Math.round(c * 255).toString(16).padStart(2, "0");
  return `#${to2(r)}${to2(g)}${to2(bl)}`;
}

// ─────────────────────────────────────────────────────────────
// Editorial token palette
// ─────────────────────────────────────────────────────────────
export const Theme = {
  // Surfaces (warm paper)
  paper: oklchToHex(0.985, 0.004, 85),
  paperAlt: oklchToHex(0.965, 0.006, 80),
  card: "#FFFFFF",
  line: oklchToHex(0.905, 0.008, 80),
  lineStrong: oklchToHex(0.84, 0.01, 80),

  // Ink hierarchy
  ink: oklchToHex(0.22, 0.012, 60),
  inkSoft: oklchToHex(0.38, 0.012, 60),
  inkMute: oklchToHex(0.55, 0.012, 60),
  inkFaint: oklchToHex(0.72, 0.008, 60),

  // Accents
  forest: oklchToHex(0.52, 0.1, 155),
  forestSoft: oklchToHex(0.94, 0.04, 155),
  forestInk: oklchToHex(0.32, 0.09, 155),
  amber: oklchToHex(0.72, 0.11, 75),
  amberSoft: oklchToHex(0.96, 0.05, 75),
  amberInk: oklchToHex(0.42, 0.09, 60),
  rose: oklchToHex(0.56, 0.13, 25),
  roseSoft: oklchToHex(0.95, 0.04, 25),
  roseInk: oklchToHex(0.38, 0.12, 25),
  indigo: oklchToHex(0.5, 0.09, 260),
  indigoSoft: oklchToHex(0.95, 0.03, 260),

  // Night-mode counterparts (kept in case the user enables it later)
  nightBg: oklchToHex(0.16, 0.008, 60),
  nightCard: oklchToHex(0.21, 0.01, 60),
  nightLine: oklchToHex(0.3, 0.01, 60),
  nightInk: oklchToHex(0.95, 0.005, 80),
} as const;

// Cover-art swatch helpers — typographic glyph on a flat tinted square.
export function coverBg(hue: number, strength = 0.06): string {
  return oklchToHex(0.93, strength, hue);
}
export function coverInk(hue: number): string {
  return oklchToHex(0.32, 0.09, hue);
}
export function coverBgMuted(hue: number): string {
  return oklchToHex(0.955, 0.025, hue);
}
export function coverInkMuted(hue: number): string {
  return oklchToHex(0.55, 0.04, hue);
}

// Eight reusable deck cover identities (hue-spaced so adjacent decks don't clash).
export type DeckCoverIdentity = { glyph: string; hue: number };
export const DECK_COVERS: DeckCoverIdentity[] = [
  { glyph: "A", hue: 85 },
  { glyph: "F", hue: 55 },
  { glyph: "H", hue: 20 },
  { glyph: "B", hue: 340 },
  { glyph: "W", hue: 280 },
  { glyph: "T", hue: 230 },
  { glyph: "N", hue: 200 },
  { glyph: "V", hue: 160 },
];

function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

export function deckIdentity(name: string): DeckCoverIdentity {
  const i = hashString(name) % DECK_COVERS.length;
  const base = DECK_COVERS[i];
  const firstLetter = (name?.trim()?.[0] || base.glyph).toUpperCase();
  return { glyph: firstLetter, hue: base.hue };
}

// ─────────────────────────────────────────────────────────────
// Typography
// ─────────────────────────────────────────────────────────────
export const Type = {
  serif: "InstrumentSerif_400Regular",
  serifItalic: "InstrumentSerif_400Regular_Italic",
  sans: "InterTight_400Regular",
  sansMedium: "InterTight_500Medium",
  sansSemi: "InterTight_600SemiBold",
  sansBold: "InterTight_700Bold",
  mono: "JetBrainsMono_400Regular",
  monoMedium: "JetBrainsMono_500Medium",
} as const;

// ─────────────────────────────────────────────────────────────
// Backward-compatible AppColors map — keeps non-redesigned
// utility components (ErrorBoundary, ToastConfig, AudioButton)
// working without rewrites. New code should import `Theme` instead.
// ─────────────────────────────────────────────────────────────
export const AppColors = {
  background: Theme.paper,
  surface: Theme.card,
  surfaceAlt: Theme.paperAlt,
  surfaceElevated: Theme.card,
  surfaceHighlight: Theme.line,

  primary: Theme.ink,
  primaryDark: Theme.ink,
  primaryLight: Theme.inkSoft,
  accent: Theme.forest,
  amber: Theme.amber,
  info: Theme.indigo,
  error: Theme.rose,
  danger: Theme.rose,

  text: Theme.ink,
  textSecondary: Theme.inkSoft,
  textMuted: Theme.inkMute,
  textSubtle: Theme.inkMute,
  textDim: Theme.inkFaint,

  border: Theme.line,
  borderLight: Theme.line,
  divider: Theme.line,

  white: "#FFFFFF",
  black: "#000000",
  dark: Theme.ink,
  correctBg: Theme.forestSoft,
  wrongBg: Theme.roseSoft,
  cardShadow: "rgba(0, 0, 0, 0.08)",

  deckColors: DECK_COVERS.map((d) => [coverBg(d.hue), coverInk(d.hue)]),
};

// Legacy exports kept for the few existing references.
const tintColorLight = Theme.ink;
const tintColorDark = Theme.paper;

export const Colors = {
  light: {
    text: Theme.ink,
    background: Theme.paper,
    tint: tintColorLight,
    icon: Theme.inkMute,
    tabIconDefault: Theme.inkFaint,
    tabIconSelected: Theme.ink,
  },
  dark: {
    text: Theme.nightInk,
    background: Theme.nightBg,
    tint: tintColorDark,
    icon: Theme.inkFaint,
    tabIconDefault: Theme.inkFaint,
    tabIconSelected: Theme.nightInk,
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: Type.sans,
    serif: Type.serif,
    rounded: Type.sans,
    mono: Type.mono,
  },
  default: {
    sans: Type.sans,
    serif: Type.serif,
    rounded: Type.sans,
    mono: Type.mono,
  },
  web: {
    sans: `'Inter Tight', system-ui, sans-serif`,
    serif: `'Instrument Serif', Georgia, serif`,
    rounded: `'Inter Tight', system-ui, sans-serif`,
    mono: `'JetBrains Mono', SFMono-Regular, Menlo, monospace`,
  },
});
