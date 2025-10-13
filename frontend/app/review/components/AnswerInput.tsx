
import { TextInput } from 'react-native';
import i18n from '../../../services/i18n';
import { styles } from './styles';

type Props = {
  typedAnswer: string;
  setTypedAnswer: (text: string) => void;
  showResult: boolean;
};

export function AnswerInput({ typedAnswer, setTypedAnswer, showResult }: Props) {
  return (
    <TextInput
      style={styles.input}
      placeholder={i18n.t('typeYourAnswer')}
      placeholderTextColor="#777"
      value={typedAnswer}
      onChangeText={setTypedAnswer}
      editable={!showResult}
      autoCapitalize="none"
      autoCorrect={false}
    />
  );
}