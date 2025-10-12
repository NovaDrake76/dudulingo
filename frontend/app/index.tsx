import { ActivityIndicator, StyleSheet, View } from 'react-native';

export default function Index() {
  // This screen is a transient loading screen.
  // The root layout will handle redirection based on the auth state.
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#58cc02" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: '#0e0e0e'
  }
});