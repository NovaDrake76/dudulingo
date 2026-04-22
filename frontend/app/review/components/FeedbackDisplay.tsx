import { Text, View } from 'react-native';
import { AudioButton } from '../../../components/AudioButton';
import i18n from '../../../services/i18n';
import { CardVisual } from './CardVisual';
import { styles } from './styles';

type Props = {
  feedback: {
    word: string;
    translation: string;
    imageUrl?: string;
    imageKey?: string;
    audioUrl?: string;
    emoji?: string;
    lang?: string;
  };
};

export function FeedbackDisplay({ feedback }: Props) {
  const hasVisual = !!feedback.imageKey || !!feedback.imageUrl || !!feedback.emoji;
  return (
    <View style={styles.feedbackCard}>
      <Text style={styles.feedbackTitle}>{i18n.t('correctAnswer')}</Text>
      {hasVisual && (
        <CardVisual
          imageKey={feedback.imageKey}
          imageUrl={feedback.imageUrl}
          emoji={feedback.emoji}
          style={styles.feedbackImage}
        />
      )}
      <Text style={styles.feedbackWord}>{feedback.word}</Text>
      <Text style={styles.feedbackTranslation}>{feedback.translation}</Text>
      <AudioButton text={feedback.word} lang={feedback.lang} />
    </View>
  );
}
