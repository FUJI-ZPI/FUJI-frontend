import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../../theme/styles';

interface ActionButtonsProps {
  onStartPractice: () => void;
  onNavigateToVocabulary: () => void;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  onStartPractice,
  onNavigateToVocabulary,
}) => {
  return (
    <View style={styles.practiceButtonsContainer}>
      <TouchableOpacity
        onPress={onStartPractice}
        style={[styles.buttonBase, styles.buttonPrimary]}
      >
        <Text style={styles.buttonTextPrimary}>
          Start Practice Session
        </Text>
        <Ionicons name="arrow-forward" size={20} color="#fff" style={styles.buttonIcon} />
      </TouchableOpacity>
      
      <TouchableOpacity
        onPress={onNavigateToVocabulary}
        style={[styles.buttonBase, styles.buttonOutline]}
      >
        <Text style={styles.buttonTextOutline}>
          漢字学習 | Learn Kanji
        </Text>
        <Feather name="book-open" size={20} color={colors.primary} style={styles.buttonIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  practiceButtonsContainer: { paddingVertical: 12, gap: 12 },
  buttonBase: {
    width: '100%',
    height: 56,
    borderRadius: 12,
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    justifyContent: 'space-between',
  },
  buttonPrimary: {
    backgroundColor: colors.primary, 
    shadowColor: colors.primary, 
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  buttonOutline: {
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: colors.primary,
  },
  buttonTextPrimary: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: '#fff',
    flex: 1, 
  },
  buttonTextOutline: { 
    fontSize: 16, 
    fontWeight: '600', 
    color: colors.primary,
    flex: 1, 
  },
  buttonIcon: { 
    marginLeft: 8, 
  },
});
