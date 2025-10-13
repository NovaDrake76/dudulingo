

import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0e0e0e',
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#0e0e0e',
  },
  header: {
    paddingTop: 40,
    paddingBottom: 10,
    alignItems: 'center',
  },
  progressText: {
    color: '#aaa',
    fontSize: 16,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'space-between',
  },
  card: {
    width: '100%',
    minHeight: 300,
    backgroundColor: '#1f1f1f',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backfaceVisibility: 'hidden',
  },
  cardFront: {},
  cardBack: {
    position: 'absolute',
    top: 0,
  },
  questionContentContainer: {
    alignItems: 'center',
  },
  questionTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 24,
    textAlign: 'center',
  },
  questionImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  questionWord: {
    fontSize: 40,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  optionsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 20,
  },
  optionButton: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#333',
    width: '48%',
  },
  imageOptionButton: {
    padding: 8,
  },
  correctOption: {
    backgroundColor: 'rgba(88, 204, 2, 0.2)',
    borderColor: '#58cc02',
  },
  wrongOption: {
    backgroundColor: 'rgba(255, 75, 75, 0.2)',
    borderColor: '#ff4b4b',
  },
  disabledOption: {
    opacity: 0.5,
  },
  optionImage: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  optionText: {
    color: '#fff',
    fontSize: 18,
    flex: 1,
    textAlign: 'center'
  },
  input: {
    width: '100%',
    backgroundColor: '#1f1f1f',
    color: '#fff',
    fontSize: 18,
    padding: 20,
    borderRadius: 12,
    textAlign: 'center',
    marginTop: 20,
    borderWidth: 2,
    borderColor: '#333',
  },
  footer: {
    paddingVertical: 10,
    minHeight: 80,
  },
  footerButton: {
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    backgroundColor: '#58cc02',
  },
  footerButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  correctButton: {
    backgroundColor: '#58cc02',
  },
  wrongButton: {
    backgroundColor: '#ff4b4b',
  },
  feedbackCard: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  feedbackTitle: {
    color: '#aaa',
    fontSize: 16,
    marginBottom: 16,
  },
  feedbackImage: {
    width: 200,
    height: 200,
    borderRadius: 16,
    marginBottom: 20,
  },
  feedbackWord: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  feedbackTranslation: {
    color: '#ccc',
    fontSize: 22,
  },
});