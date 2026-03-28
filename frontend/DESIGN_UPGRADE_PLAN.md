# 🎨 Repecards Design Upgrade Plan

## Current State Assessment

The app works functionally but looks like a developer prototype — flat gray cards, default tab bar, no visual hierarchy, no personality. It needs to feel like a polished language learning app that people *want* to open every day.

---

## 🔴 Critical Issues (Must Fix)

### 1. Bottom Navigation Bar — Ugly Default Tab Bar
**Problem:** Using Expo's default `<Tabs>` with no styling. Plain white/gray bar, generic icons, no visual punch.
**Fix:**
- Custom tab bar component with glassmorphism/blur background
- Larger icons with filled/outlined states (active vs inactive)
- Green dot or pill indicator on active tab
- Add slight elevation/shadow
- Consider adding a 3rd tab: "Decks" (between Learn and Profile) — users need quick access to browse/add decks
- Smooth icon transition animation on tab switch

### 2. Deck Selection — No Thumbnails, No Visual Identity
**Problem:** All decks look identical — gray rectangles with text. No way to visually distinguish "Food" from "Family" at a glance.
**Fix:**
- Generate themed thumbnail/cover images for each deck (emoji-based gradient cards or AI-generated illustrations)
- Card layout with cover image (top 60%) + text info (bottom 40%)
- Use a 2-column grid instead of full-width list
- Add card count badge in corner
- Color-code each deck category with an accent color
- "Create Deck" moved to a floating "+" button (FAB) instead of taking prime real estate at the top

### 3. Learn Tab — Confusing Stats, Poor Layout
**Problem:** "20 Learning" implies progress when user hasn't started. Stats are crammed in a row. Buttons are stacked vertically with no visual hierarchy.
**Fix:**
- Circular progress ring showing mastery % as the hero element
- Rename labels: "Total" / "New" / "Mastered"
- Streak counter (daily streak motivator)
- "Start Review" should be a big, prominent CTA with an icon (play button feel)
- "Add New Deck" and "Add Card" should be smaller, secondary actions
- Show which deck(s) are active with small deck thumbnails
- Add a motivational message that changes

### 4. Review Screen — Functional but Flat
**Problem:** Card area is just a gray box. Progress indicator is plain text. Options have no press feedback. Too much empty space.
**Fix:**
- Progress bar (green fill) instead of plain "Card 1 of 10" text
- Card with subtle gradient/shadow to feel more "physical"
- Image should be larger and fill more of the card
- Audio button more prominent (bigger, styled)
- Multiple choice: rounded pill buttons with bounce on press
- Correct/wrong: full-screen flash (green/red tint) + haptic
- Smooth slide animation between cards
- Add a "skip" option

---

## 🟡 Important Improvements

### 5. Sign-In Screen — Good but Could Be Better
**Fix:**
- Add subtle mascot floating animation (react-native-reanimated)
- Add a tagline rotation with fun phrases
- Google button: shadow and press animation
- Background: subtle animated gradient or particles

### 6. Language Selection — Too Empty
**Fix:**
- Show language cards with flag + name + "N decks available"
- Add "Coming Soon" badges for Spanish, French, etc.
- Add the mascot for continuity

### 7. Profile Screen — Bare Minimum
**Fix:**
- Add learning stats: total reviews, accuracy %, streak, words mastered
- Show active decks with progress bars
- Achievement badges section (placeholders ok)
- Move "Log Out" to settings sub-menu
- Gradient background card for avatar section

### 8. Color Palette — Too Dark and Monotone
**Fix:**
- More depth layers:
  - Background: #0a0a0a
  - Surface L1: #151515
  - Surface L2: #1e1e1e
  - Surface L3: #282828
- Accent colors: blue for info, amber for streaks, purple for achievements
- Use green strategically (action/success only)
- Subtle gradients instead of flat colors

---

## 🟢 Nice-to-Have

### 9. Typography
- Custom font (Inter or Nunito via expo-google-fonts)
- Bigger bolder headings, better hierarchy

### 10. Animations & Micro-interactions
- Button press scale animations everywhere
- Screen transitions: slide from right
- Loading skeletons instead of spinners
- Confetti on session complete

### 11. Empty States
- Friendly illustrations + CTAs when no decks/reviews

### 12. Onboarding
- First-time 3-step tutorial overlay

### 13. Add Card & Create Deck polish
- Live card preview on add-card
- Image search as grid, not modal list

---

## Implementation Order

| Phase | Task | Priority | Effort |
|-------|------|----------|--------|
| 1 | Deck thumbnails (emoji gradient covers) | Critical | Medium |
| 1 | Bottom nav bar redesign | Critical | Medium |
| 1 | Updated color palette + depth | Critical | Low |
| 2 | Learn tab redesign (progress ring, layout) | Critical | High |
| 2 | Review screen polish (progress bar, animations) | Critical | High |
| 2 | Deck selection grid layout | Critical | Medium |
| 3 | Sign-in animation + polish | Important | Low |
| 3 | Language selection redesign | Important | Low |
| 3 | Profile screen overhaul | Important | Medium |
| 4 | Custom font (Inter/Nunito) | Nice | Low |
| 4 | Micro-animations everywhere | Nice | Medium |
| 4 | Confetti + celebration screens | Nice | Low |
| 4 | Onboarding tutorial | Nice | Medium |

## Design References
- **Duolingo** — gamification, green theme, fun mascot
- **Anki** — clean card review UI
- **Memrise** — beautiful deck covers, progress tracking
- **Quizlet** — modern card layouts, smooth animations

## Tech Stack
- Custom fonts: `expo-font` + `@expo-google-fonts/inter`
- Animations: `react-native-reanimated` (already installed)
- Blur: `expo-blur` for glassmorphism tab bar
- Gradient: `expo-linear-gradient`
- Haptics: `expo-haptics`
- Confetti: `react-native-confetti-cannon` or custom reanimated
- Deck thumbnails: Generate via canvas/SVG with emoji + gradient (no external API)
