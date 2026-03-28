import { Text, View } from 'react-native';
import { AudioButton } from '../../../components/AudioButton';
import i18n from '../../../services/i18n';
import { CardImage } from './CardImage';
import { styles } from './styles';

type Props = {
  feedback: {
    word: string;
    translation: string;
    imageUrl?: string;
    audioUrl?: string;
  };
};

export function FeedbackDisplay({ feedback }: Props) {
  return (
    <View style={styles.feedbackCard}>
      <Text style={styles.feedbackTitle}>{i18n.t('correctAnswer')}</Text>
      {feedback.imageUrl && <CardImage uri={feedback.imageUrl} style={styles.feedbackImage} />}
      <Text style={styles.feedbackWord}>{feedback.word}</Text>
      <Text style={styles.feedbackTranslation}>{feedback.translation}</Text>
      {feedback.audioUrl && <AudioButton audioUrl={feedback.audioUrl} />}
    </View>
  );
}
