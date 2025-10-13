
import { Image, Text, View } from 'react-native';
import { styles } from './styles';

type Props = {
  prompt?: string;
  imageUrl?: string;
  word?: string;
};

export function QuestionDisplay({ prompt, imageUrl, word }: Props) {
  return (
    <View style={styles.questionContentContainer}>
      <Text style={styles.questionTitle}>{prompt}</Text>
      {imageUrl && <Image source={{ uri: imageUrl }} style={styles.questionImage} />}
      {word && <Text style={styles.questionWord}>{word}</Text>}
    </View>
  );
}