import { Ionicons } from '@expo/vector-icons';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { CircleBtn } from '../../../components/chrome';
import { Theme, Type } from '../../../constants/theme';

type MissedCard = { word: string; translation: string; miss: number };

type Props = {
  totalQuestions: number;
  correctCount: number;
  durationMs: number;
  missed: MissedCard[];
  deckName?: string;
  streakDays: number;
  streakExtended: boolean;
  onDone: () => void;
  onReviewMore?: () => void;
};

function formatClock(ms: number): string {
  const seconds = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

const NUMBER_WORDS = [
  'Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen',
  'Seventeen', 'Eighteen', 'Nineteen',
];
const TENS = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numToWord(n: number): string {
  if (n < 0) return String(n);
  if (n < 20) return NUMBER_WORDS[n];
  if (n < 100) {
    const t = Math.floor(n / 10);
    const r = n % 10;
    return r === 0 ? TENS[t] : `${TENS[t]}-${NUMBER_WORDS[r].toLowerCase()}`;
  }
  return String(n);
}

export function SessionComplete({
  totalQuestions,
  correctCount,
  durationMs,
  missed,
  deckName,
  streakDays,
  streakExtended,
  onDone,
  onReviewMore,
}: Props) {
  const accuracy = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;
  const avgPerCard =
    totalQuestions > 0 ? Math.round(durationMs / totalQuestions / 1000) : 0;
  const headline = numToWord(totalQuestions);

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.topRow}>
          <CircleBtn onPress={onDone}>
            <Ionicons name="close" size={14} color={Theme.ink} />
          </CircleBtn>
        </View>

        <View style={styles.headBlock}>
          <Text style={styles.kicker}>SESSION COMPLETE</Text>
          <Text style={styles.hero}>
            {headline}
            {'\n'}
            {totalQuestions === 1 ? 'word later.' : 'words later.'}
          </Text>
          <Text style={styles.sub}>
            You held a <Text style={styles.subAcc}>{accuracy}% accuracy</Text>
            {deckName ? (
              <>
                {' '}through <Text style={styles.subItalic}>{deckName}</Text>
              </>
            ) : null}
            . Missed cards will return tomorrow; the rest are spaced out.
          </Text>
        </View>

        <View style={styles.resultCard}>
          <View style={styles.resultRow}>
            <View style={[styles.resultCell, styles.resultCellDivider]}>
              <Text style={styles.cellKicker}>ACCURACY</Text>
              <Text style={[styles.cellValue, { color: Theme.forest }]}>{accuracy}%</Text>
              <Text style={styles.cellMeta}>
                {correctCount} of {totalQuestions}
              </Text>
            </View>
            <View style={styles.resultCell}>
              <Text style={styles.cellKicker}>TIME</Text>
              <Text style={styles.cellValue}>{formatClock(durationMs)}</Text>
              <Text style={styles.cellMeta}>avg {avgPerCard}s / card</Text>
            </View>
          </View>
          {streakDays > 0 && (
            <View style={styles.streakRow}>
              <Ionicons name="flame" size={14} color={Theme.amber} />
              <Text style={styles.streakText}>
                {streakExtended ? 'Streak extended to ' : 'Current streak: '}
                <Text style={styles.streakBold}>
                  {streakDays} {streakDays === 1 ? 'day' : 'days'}
                </Text>
              </Text>
              {streakExtended && <Text style={styles.streakPlus}>+1</Text>}
            </View>
          )}
        </View>

        {missed.length > 0 && (
          <View style={styles.missedBlock}>
            <Text style={styles.sectionKicker}>NEEDS ANOTHER PASS</Text>
            <View style={styles.missedCard}>
              {missed.map((m, i) => (
                <View
                  key={`${m.word}-${i}`}
                  style={[styles.missedRow, i > 0 && styles.missedDivider]}
                >
                  <Text style={styles.missedWord}>{m.word}</Text>
                  <Text style={styles.missedTrans}>{m.translation}</Text>
                  <View style={styles.missedBadge}>
                    <Text style={styles.missedBadgeText}>missed ×{m.miss}</Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.ctaRow}>
        <Pressable
          onPress={onDone}
          style={({ pressed }) => [styles.ctaSecondary, pressed && { opacity: 0.85 }]}
        >
          <Text style={styles.ctaSecondaryText}>Done</Text>
        </Pressable>
        {onReviewMore && (
          <Pressable
            onPress={onReviewMore}
            style={({ pressed }) => [styles.ctaPrimary, pressed && { opacity: 0.9 }]}
          >
            <Text style={styles.ctaPrimaryText}>Review more</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Theme.paper },
  scroll: { paddingBottom: 40 },
  topRow: {
    paddingTop: 58,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },

  headBlock: { paddingHorizontal: 24, paddingTop: 30 },
  kicker: {
    fontFamily: Type.sansSemi,
    fontSize: 11,
    letterSpacing: 1.4,
    color: Theme.inkMute,
  },
  hero: {
    fontFamily: Type.serif,
    fontSize: 48,
    lineHeight: 50,
    color: Theme.ink,
    letterSpacing: -0.8,
    marginTop: 8,
  },
  sub: {
    fontFamily: Type.sans,
    fontSize: 14,
    lineHeight: 20,
    color: Theme.inkSoft,
    marginTop: 12,
  },
  subAcc: { fontFamily: Type.sansSemi, color: Theme.ink },
  subItalic: { fontFamily: Type.serifItalic, color: Theme.ink },

  resultCard: {
    marginHorizontal: 20,
    marginTop: 24,
    backgroundColor: Theme.card,
    borderRadius: 20,
    borderWidth: 0.5,
    borderColor: Theme.line,
    overflow: 'hidden',
  },
  resultRow: { flexDirection: 'row' },
  resultCell: { flex: 1, paddingVertical: 18, paddingHorizontal: 18 },
  resultCellDivider: {
    borderRightWidth: 0.5,
    borderRightColor: Theme.line,
  },
  cellKicker: {
    fontFamily: Type.sansSemi,
    fontSize: 10.5,
    letterSpacing: 1.2,
    color: Theme.inkMute,
  },
  cellValue: {
    fontFamily: Type.serif,
    fontSize: 40,
    lineHeight: 42,
    letterSpacing: -0.6,
    color: Theme.ink,
    marginTop: 4,
  },
  cellMeta: {
    fontFamily: Type.sans,
    fontSize: 11,
    color: Theme.inkMute,
    marginTop: 4,
  },
  streakRow: {
    borderTopWidth: 0.5,
    borderTopColor: Theme.line,
    paddingVertical: 14,
    paddingHorizontal: 18,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  streakText: {
    flex: 1,
    fontFamily: Type.sansMedium,
    fontSize: 13,
    color: Theme.ink,
  },
  streakBold: { fontFamily: Type.sansSemi },
  streakPlus: {
    fontFamily: Type.mono,
    fontSize: 10.5,
    color: Theme.inkMute,
  },

  missedBlock: { paddingHorizontal: 20, paddingTop: 22 },
  sectionKicker: {
    fontFamily: Type.sansSemi,
    fontSize: 11,
    letterSpacing: 1.4,
    color: Theme.inkMute,
    marginBottom: 10,
  },
  missedCard: {
    backgroundColor: Theme.card,
    borderRadius: 14,
    borderWidth: 0.5,
    borderColor: Theme.line,
    overflow: 'hidden',
  },
  missedRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 10,
  },
  missedDivider: {
    borderTopWidth: 0.5,
    borderTopColor: Theme.line,
  },
  missedWord: {
    fontFamily: Type.serif,
    fontSize: 18,
    color: Theme.ink,
    letterSpacing: -0.3,
    minWidth: 100,
  },
  missedTrans: {
    flex: 1,
    fontFamily: Type.sans,
    fontStyle: 'italic',
    fontSize: 13,
    color: Theme.inkMute,
  },
  missedBadge: {
    paddingVertical: 2,
    paddingHorizontal: 7,
    borderRadius: 999,
    backgroundColor: Theme.roseSoft,
  },
  missedBadgeText: {
    fontFamily: Type.mono,
    fontSize: 10.5,
    color: Theme.rose,
  },

  ctaRow: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 34,
    flexDirection: 'row',
    gap: 10,
    backgroundColor: Theme.paper,
    borderTopWidth: 0.5,
    borderTopColor: Theme.line,
  },
  ctaSecondary: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: Theme.lineStrong,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  ctaSecondaryText: {
    fontFamily: Type.sansSemi,
    fontSize: 14,
    color: Theme.ink,
  },
  ctaPrimary: {
    flex: 1.3,
    paddingVertical: 14,
    borderRadius: 14,
    backgroundColor: Theme.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaPrimaryText: {
    fontFamily: Type.sansSemi,
    fontSize: 14,
    color: Theme.paper,
  },
});
