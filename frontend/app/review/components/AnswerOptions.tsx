import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { Theme } from '../../../constants/theme';
import { CardVisual } from './CardVisual';
import { styles } from './styles';

type Option = string | { text: string; imageUrl?: string; emoji?: string; imageKey?: string };

type Props = {
  options: Option[];
  showResult: boolean;
  correctAnswer?: string;
  selectedAnswer?: string;
  getOptionStyle: (optionText: string) => StyleProp<ViewStyle>;
  handleSelectOption: (optionText: string) => void;
};

export function AnswerOptions({
  options,
  showResult,
  correctAnswer,
  selectedAnswer,
  getOptionStyle,
  handleSelectOption,
}: Props) {
  return (
    <View style={styles.optionsContainer}>
      {options.map((option, index) => {
        const isVisualOption = typeof option === 'object';
        const optionText = isVisualOption ? option.text : (option as string);
        const displayLabel = isVisualOption ? '' : optionText;
        const imageUrl = isVisualOption ? option.imageUrl : undefined;
        const imageKey = isVisualOption ? option.imageKey : undefined;
        const emoji = isVisualOption ? option.emoji : undefined;
        const hasVisual = !!imageUrl || !!imageKey || !!emoji;

        const isCorrect =
          showResult && correctAnswer && optionText.toLowerCase() === correctAnswer.toLowerCase();
        const isChosen = showResult && selectedAnswer && optionText === selectedAnswer;

        let badge: React.ReactNode = (
          <Text style={styles.optionBadgeText}>{String.fromCharCode(65 + index)}</Text>
        );
        let badgeStyle: ViewStyle = {};
        if (isCorrect) {
          badge = <Ionicons name="checkmark" size={14} color="#fff" />;
          badgeStyle = { backgroundColor: Theme.forest, borderColor: Theme.forest };
        } else if (isChosen && !isCorrect) {
          badge = <Ionicons name="close" size={12} color="#fff" />;
          badgeStyle = { backgroundColor: Theme.rose, borderColor: Theme.rose };
        }

        return (
          <Pressable
            key={index}
            style={[
              styles.optionButton,
              getOptionStyle(optionText),
              hasVisual && styles.imageOptionButton,
            ]}
            onPress={() => handleSelectOption(optionText)}
            disabled={showResult}
          >
            <View style={[styles.optionBadge, badgeStyle]}>{badge}</View>
            {hasVisual ? (
              <CardVisual
                imageKey={imageKey}
                imageUrl={imageUrl}
                emoji={emoji}
                style={styles.optionImage}
              />
            ) : null}
            {displayLabel ? <Text style={styles.optionText}>{displayLabel}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}
