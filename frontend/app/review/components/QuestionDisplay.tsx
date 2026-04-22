import { Text, View } from 'react-native';
import { AudioButton } from '../../../components/AudioButton';
import { CardVisual } from './CardVisual';
import { styles } from './styles';

type Props = {
  prompt?: string;
  imageUrl?: string;
  imageKey?: string;
  emoji?: string;
  word?: string;
  lang?: string;
};

export function QuestionDisplay({ prompt, imageUrl, imageKey, emoji, word, lang }: Props) {
  const hasVisual = !!imageKey || !!imageUrl || !!emoji;
  return (
    <View style={styles.questionContentContainer}>
      {hasVisual && (
        <CardVisual
          imageKey={imageKey}
          imageUrl={imageUrl}
          emoji={emoji}
          style={styles.questionImage}
        />
      )}
      {prompt && <Text style={styles.questionPrompt}>{prompt}</Text>}
      {word && (
        <View style={styles.wordRow}>
          <Text style={styles.questionWord}>{word}</Text>
          <AudioButton text={word} lang={lang} />
        </View>
      )}
    </View>
  );
}
