import { StyleSheet } from 'react-native';
import { Theme, Type } from '../../../constants/theme';

export const styles = StyleSheet.create({
  // Shell
  container: {
    flex: 1,
    backgroundColor: Theme.paper,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Theme.paper,
  },

  // Header
  header: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  progressBarContainer: {
    flex: 1,
    height: 5,
    backgroundColor: Theme.line,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Theme.forest,
    borderRadius: 3,
  },
  progressText: {
    fontFamily: Type.mono,
    fontSize: 11.5,
    color: Theme.inkMute,
    minWidth: 40,
    textAlign: 'right',
  },

  // Content scroll
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // Prompt block
  kicker: {
    fontFamily: Type.sansSemi,
    fontSize: 11,
    letterSpacing: 1.4,
    color: Theme.inkMute,
    paddingHorizontal: 20,
    paddingTop: 4,
  },
  questionCard: {
    marginHorizontal: 20,
    marginTop: 14,
    padding: 22,
    backgroundColor: Theme.card,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Theme.line,
  },
  questionContentContainer: {
    gap: 4,
  },
  questionImage: {
    width: '100%',
    aspectRatio: 16 / 7,
    borderRadius: 12,
    marginBottom: 18,
    backgroundColor: Theme.paperAlt,
    alignSelf: 'center',
  },
  questionPrompt: {
    fontFamily: Type.sans,
    fontSize: 13,
    color: Theme.inkMute,
    marginBottom: 6,
  },
  wordRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  questionWord: {
    flex: 1,
    fontFamily: Type.serif,
    fontSize: 44,
    lineHeight: 48,
    color: Theme.ink,
    letterSpacing: -0.8,
  },
  typedPrompt: {
    fontFamily: Type.serif,
    fontSize: 56,
    lineHeight: 58,
    color: Theme.ink,
    letterSpacing: -1,
    paddingHorizontal: 20,
    marginTop: 14,
  },
  typedMeta: {
    fontFamily: Type.sans,
    fontSize: 13,
    color: Theme.inkMute,
    marginTop: 8,
    paddingHorizontal: 20,
    fontStyle: 'italic',
  },

  // Options
  optionsContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    gap: 10,
  },
  optionButton: {
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: Theme.card,
    borderWidth: 1,
    borderColor: Theme.line,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  imageOptionButton: {
    paddingVertical: 10,
    paddingHorizontal: 12,
  },
  optionBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: Theme.line,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  optionBadgeText: {
    fontFamily: Type.mono,
    fontSize: 10,
    color: Theme.inkMute,
  },
  optionText: {
    fontFamily: Type.sansMedium,
    fontSize: 16,
    color: Theme.ink,
    letterSpacing: -0.1,
    flex: 1,
  },
  optionImage: {
    width: 72,
    height: 72,
    borderRadius: 10,
  },

  correctOption: {
    backgroundColor: Theme.forestSoft,
    borderColor: Theme.forest,
  },
  wrongOption: {
    backgroundColor: Theme.roseSoft,
    borderColor: Theme.rose,
  },
  disabledOption: {
    opacity: 1,
  },

  // Typed answer input
  inputWrap: {
    marginTop: 28,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1.5,
    borderBottomColor: Theme.ink,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  input: {
    flex: 1,
    fontFamily: Type.serif,
    fontSize: 30,
    letterSpacing: -0.4,
    color: Theme.ink,
    paddingVertical: 0,
  },
  inputCount: {
    fontFamily: Type.mono,
    fontSize: 10.5,
    color: Theme.inkMute,
    letterSpacing: 0.4,
  },

  hintRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    flexDirection: 'row',
    gap: 6,
    flexWrap: 'wrap',
  },
  hintChip: {
    paddingVertical: 6,
    paddingHorizontal: 11,
    borderRadius: 999,
    backgroundColor: Theme.card,
    borderWidth: 0.5,
    borderColor: Theme.line,
  },
  hintChipText: {
    fontFamily: Type.sansMedium,
    fontSize: 12.5,
    color: Theme.ink,
  },

  // Footer / CTA
  footer: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 34,
  },
  footerHint: {
    textAlign: 'center',
    fontFamily: Type.sans,
    fontSize: 12,
    color: Theme.inkMute,
    marginBottom: 10,
  },
  footerButton: {
    paddingVertical: 15,
    paddingHorizontal: 18,
    borderRadius: 14,
    backgroundColor: Theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerButtonText: {
    fontFamily: Type.sansSemi,
    fontSize: 15,
    color: Theme.paper,
    letterSpacing: -0.1,
  },
  correctButton: { backgroundColor: Theme.forest },
  wrongButton: { backgroundColor: Theme.rose },

  // Feedback bar
  feedbackBar: {
    borderTopWidth: 1,
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 34,
    gap: 12,
  },
  feedbackHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  feedbackIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedbackTitle: {
    flex: 1,
    fontFamily: Type.serif,
    fontSize: 22,
    letterSpacing: -0.4,
  },
  feedbackBadge: {
    fontFamily: Type.sansSemi,
    fontSize: 12,
  },
  feedbackBody: {
    fontFamily: Type.sans,
    fontSize: 13.5,
    lineHeight: 20,
  },
  feedbackBold: { fontFamily: Type.sansSemi },
  feedbackItalic: { fontStyle: 'italic' },

  // Visible card (kept for the flip-card slot removed; but CardVisual reads these)
  card: {
    display: 'none',
  },
  cardFront: {},
  cardBack: {},
  feedbackCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  feedbackImage: {
    width: 220,
    height: 220,
    borderRadius: 20,
    marginBottom: 20,
  },
  feedbackWord: {
    color: Theme.ink,
    fontSize: 34,
    fontFamily: Type.serif,
    letterSpacing: -0.6,
  },
  feedbackTranslation: {
    color: Theme.inkSoft,
    fontSize: 22,
    fontFamily: Type.sansMedium,
    marginTop: 4,
  },
});
