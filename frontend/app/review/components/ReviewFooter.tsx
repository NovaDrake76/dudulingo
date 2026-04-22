import { Pressable, Text, View } from 'react-native';
import i18n from '../../../services/i18n';
import { styles } from './styles';

type Props = {
  questionType: string;
  handleCheckTypedAnswer: () => void;
};

export function ReviewFooter({ questionType, handleCheckTypedAnswer }: Props) {
  const isTyped = questionType?.includes('type_answer');
  return (
    <View style={styles.footer}>
      {isTyped ? (
        <Pressable
          style={({ pressed }) => [styles.footerButton, pressed && { opacity: 0.9 }]}
          onPress={handleCheckTypedAnswer}
        >
          <Text style={styles.footerButtonText}>{i18n.t('checkAnswer')}</Text>
        </Pressable>
      ) : (
        <Text style={styles.footerHint}>Tap an answer to check</Text>
      )}
    </View>
  );
}
