import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';
import { Theme, Type } from '../../../constants/theme';
import { styles } from './styles';

type Props = {
  isCorrect: boolean;
  correctAnswer: string;
  translation?: string;
  example?: string;
  onContinue: () => void;
};

export function FeedbackDisplay({ isCorrect, correctAnswer, translation, example, onContinue }: Props) {
  const bg = isCorrect ? Theme.forestSoft : Theme.roseSoft;
  const fg = isCorrect ? Theme.forestInk : Theme.roseInk;
  const accent = isCorrect ? Theme.forest : Theme.rose;

  return (
    <View style={[styles.feedbackBar, { backgroundColor: bg, borderTopColor: accent }]}>
      <View style={styles.feedbackHeaderRow}>
        <View style={[styles.feedbackIconWrap, { backgroundColor: accent }]}>
          <Ionicons
            name={isCorrect ? 'checkmark' : 'close'}
            size={isCorrect ? 16 : 14}
            color="#fff"
          />
        </View>
        <Text style={[styles.feedbackTitle, { color: fg }]}>
          {isCorrect ? 'Exactly.' : 'Not quite.'}
        </Text>
        <Text style={[styles.feedbackBadge, { color: fg }]}>
          {isCorrect ? '+2 mastery' : 'will revisit'}
        </Text>
      </View>
      <Text style={[styles.feedbackBody, { color: fg }]}>
        <Text style={[styles.feedbackBold, { fontFamily: Type.sansSemi }]}>{correctAnswer}</Text>
        {translation ? <> · {translation}</> : null}
        {example ? (
          <>
            {'  '}
            <Text style={styles.feedbackItalic}>{example}</Text>
          </>
        ) : null}
      </Text>
      <Pressable
        onPress={onContinue}
        style={({ pressed }) => [
          styles.footerButton,
          { backgroundColor: accent, marginTop: 2 },
          pressed && { opacity: 0.9 },
        ]}
      >
        <Text style={styles.footerButtonText}>Continue</Text>
      </Pressable>
    </View>
  );
}
