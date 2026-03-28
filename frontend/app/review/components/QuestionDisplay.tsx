import { Text, View } from 'react-native';
import { AudioButton } from '../../../components/AudioButton';
import { CardImage } from './CardImage';
import { styles } from './styles';

type Props = {
  prompt?: string;
  imageUrl?: string;
  audioUrl?: string;
  word?: string;
};

export function QuestionDisplay({ prompt, imageUrl, audioUrl, word }: Props) {
  return (
    <View style={styles.questionContentContainer}>
      {imageUrl && <CardImage uri={imageUrl} style={styles.questionImage} />}
      {word && <Text style={styles.questionWord}>{word}</Text>}
      {audioUrl && <AudioButton audioUrl={audioUrl} />}
    </View>
  );
}
