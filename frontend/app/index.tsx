import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { AppColors } from '../constants/theme';

export default function Index() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={AppColors.primary} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: AppColors.background
  }
});