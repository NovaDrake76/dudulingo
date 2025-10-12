import { Image, ImageSourcePropType, Pressable, StyleSheet, Text } from 'react-native'

type LanguageSelectorProps = {
  languageName: string
  flagSource: ImageSourcePropType
  onPress: () => void
}

export default function LanguageSelector({ languageName, flagSource, onPress }: LanguageSelectorProps) {
  return (
    <Pressable style={styles.button} onPress={onPress}>
      <Image source={flagSource} style={styles.flag} />
      <Text style={styles.text}>{languageName}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: '#1f1f1f',
    borderRadius: 14,
    padding: 20,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 8,
  },
  flag: {
    width: 60,
    height: 40,
    borderRadius: 4,
    marginRight: 16,
  },
  text: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
})