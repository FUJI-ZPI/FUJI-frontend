import React from 'react';
import { View, Text, StyleSheet, ViewStyle } from 'react-native';
import { themeStyles, colors, spacing } from '../../theme/styles'

interface CardProps {
  children: React.ReactNode;
  title?: string;
  style?: ViewStyle;
}


export const Card: React.FC<CardProps> = ({ children, title, style }) => {
  return (
    <View style={[themeStyles.cardBase, style]}>
      {title && (
        <View style={styles.cardHeader}>
          <Text style={themeStyles.textTitle}>{title}</Text>
        </View>
      )}
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  cardHeader: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: spacing.small,
    marginBottom: spacing.small,
  },
});