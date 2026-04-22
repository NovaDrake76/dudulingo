import { TextInput, View } from 'react-native';
import { Theme } from '../../../constants/theme';
import i18n from '../../../services/i18n';
import { styles } from './styles';

type Props = {
  typedAnswer: string;
  setTypedAnswer: (text: string) => void;
  showResult: boolean;
};

export function AnswerInput({ typedAnswer, setTypedAnswer, showResult }: Props) {
  return (
    <View style={styles.inputWrap}>
      <TextInput
        style={styles.input}
        placeholder={i18n.t('typeYourAnswer')}
        placeholderTextColor={Theme.inkFaint}
        value={typedAnswer}
        onChangeText={setTypedAnswer}
        editable={!showResult}
        autoCapitalize="none"
        autoCorrect={false}
      />
    </View>
  );
}
