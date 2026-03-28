import React from 'react';
import { Text, View, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import { AppColors } from '../constants/theme';

export const toastConfig = {
  success: (props: any) => (
    <BaseToast
      {...props}
      style={styles.success}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  error: (props: any) => (
    <ErrorToast
      {...props}
      style={styles.error}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
  info: (props: any) => (
    <BaseToast
      {...props}
      style={styles.info}
      contentContainerStyle={styles.contentContainer}
      text1Style={styles.text1}
      text2Style={styles.text2}
      text2NumberOfLines={2}
    />
  ),
};

const styles = StyleSheet.create({
  success: {
    borderLeftColor: AppColors.primary,
    backgroundColor: AppColors.surface,
  },
  error: {
    borderLeftColor: AppColors.error,
    backgroundColor: AppColors.surface,
  },
  info: {
    borderLeftColor: AppColors.info,
    backgroundColor: AppColors.surface,
  },
  contentContainer: {
    paddingHorizontal: 15,
  },
  text1: {
    fontSize: 16,
    fontWeight: '600',
    color: AppColors.text,
  },
  text2: {
    fontSize: 14,
    color: AppColors.textSecondary,
  },
});
