import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

type LanguageSelectorProps = {
  languageName: string;
  flagSource: any;
  onPress: () => void;
};

export default function LanguageSelector({ languageName, flagSource, onPress }: LanguageSelectorProps) {
  return (
    <Pressable style={styles.container} onPress={onPress}>
      <Image source={flagSource} style={styles.flag} />
      <Text style={styles.languageName}>{languageName}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1f1f1f',
    padding: 20,
    borderRadius: 14,
    width: '100%',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#333',
  },
  flag: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 20,
  },
  languageName: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
});