/**
 * App-wide color palette used across all screens and components.
 */

import { Platform } from "react-native";

export const AppColors = {
  // Backgrounds with depth layers
  background: '#090909',
  surface: '#141414',
  surfaceAlt: '#111111',
  surfaceElevated: '#1c1c1c',
  surfaceHighlight: '#252525',

  // Primary & accents
  primary: '#58cc02',
  primaryDark: '#46a302',
  primaryLight: '#7de033',
  accent: '#a855f7',
  amber: '#f59e0b',
  info: '#1cb0f6',
  error: '#ff4b4b',
  danger: '#EA4335',

  // Text hierarchy
  text: '#f5f5f5',
  textSecondary: '#c0c0c0',
  textMuted: '#8a8a8a',
  textSubtle: '#b0b0b0',
  textDim: '#555',

  // Borders & dividers
  border: '#2a2a2a',
  borderLight: '#383838',
  divider: '#1e1e1e',

  // Misc
  white: '#fff',
  black: '#000',
  dark: '#333',
  correctBg: 'rgba(88, 204, 2, 0.15)',
  wrongBg: 'rgba(255, 75, 75, 0.15)',
  cardShadow: 'rgba(0, 0, 0, 0.4)',

  // Deck theme colors (gradient pairs)
  deckColors: [
    ['#f97316', '#ea580c'],
    ['#8b5cf6', '#7c3aed'],
    ['#06b6d4', '#0891b2'],
    ['#ec4899', '#db2777'],
    ['#10b981', '#059669'],
    ['#f59e0b', '#d97706'],
    ['#6366f1', '#4f46e5'],
    ['#ef4444', '#dc2626'],
  ],
};

const tintColorLight = "#0a7ea4";
const tintColorDark = "#fff";

export const Colors = {
  light: {
    text: "#11181C",
    background: "#fff",
    tint: tintColorLight,
    icon: "#687076",
    tabIconDefault: "#687076",
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    tint: tintColorDark,
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: "system-ui",
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: "ui-serif",
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: "ui-rounded",
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
