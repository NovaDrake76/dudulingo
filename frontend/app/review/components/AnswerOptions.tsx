
import { Image, Pressable, StyleProp, Text, View, ViewStyle } from 'react-native';
import { styles } from './styles';

type Option = string | { text: string; imageUrl: string };

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
        const isImageOption = typeof option === 'object' && 'imageUrl' in option;
        const optionText = isImageOption ? option.text : (option as string);
        const optionImage = isImageOption ? option.imageUrl : null;
        const displayLabel = isImageOption ? '' : optionText;

        return (
          <Pressable
            key={index}
            style={[styles.optionButton, getOptionStyle(optionText), isImageOption && styles.imageOptionButton]}
            onPress={() => handleSelectOption(optionText)}
            disabled={showResult}
          >
            {optionImage && <Image source={{ uri: optionImage }} style={styles.optionImage} />}
            {displayLabel ? <Text style={styles.optionText}>{displayLabel}</Text> : null}
          </Pressable>
        );
      })}
    </View>
  );
}