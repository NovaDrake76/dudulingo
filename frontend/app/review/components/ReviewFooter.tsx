
import { Pressable, Text, View } from 'react-native';
import i18n from '../../../services/i18n';
import { styles } from './styles';

type Props = {
  showResult: boolean;
  isCorrect: boolean;
  questionType: string;
  handleNext: () => void;
  handleCheckTypedAnswer: () => void;
};

export function ReviewFooter({
  showResult,
  isCorrect,
  questionType,
  handleNext,
  handleCheckTypedAnswer,
}: Props) {
  return (
    <View style={styles.footer}>
      {showResult ? (
        <Pressable
          style={[styles.footerButton, isCorrect ? styles.correctButton : styles.wrongButton]}
          onPress={handleNext}
        >
          <Text style={styles.footerButtonText}>{i18n.t('next')}</Text>
        </Pressable>
      ) : questionType?.includes('type_answer') ? (
        <Pressable style={styles.footerButton} onPress={handleCheckTypedAnswer}>
          <Text style={styles.footerButtonText}>{i18n.t('checkAnswer')}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}