import { Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { CardVisual } from './CardVisual';
import { styles } from './styles';

type Option = string | { text: string; imageUrl?: string; emoji?: string; imageKey?: string };

type Props = {
  options: Option[];
  showResult: boolean;
  getOptionStyle: (optionText: string) => StyleProp<ViewStyle>;
  handleSelectOption: (optionText: string) => void;
};

export function AnswerOptions({ options, showResult, getOptionStyle, handleSelectOption }: Props) {
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

        return (
          <Pressable
            key={index}
            style={[styles.optionButton, getOptionStyle(optionText), hasVisual && styles.imageOptionButton]}
            onPress={() => handleSelectOption(optionText)}
            disabled={showResult}
          >
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
