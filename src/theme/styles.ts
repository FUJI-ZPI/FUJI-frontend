// src/theme/styles.ts

import { StyleSheet } from 'react-native';

// --- Kolory w stylu Tailwind ---
export const colors = {
  primary: '#3B82F6', // Blue-500
  secondary: '#10B981', // Emerald-500
  warning: '#F59E0B', // Amber-500
  danger: '#EF4444', // Red-500
  background: '#f9fafb', // Gray-50
  cardBackground: '#fff',
  text: '#1F2937', // Gray-800
  textMuted: '#6B7280', // Gray-500
  border: '#E5E7EB', // Gray-200
  lightBackground: '#F9FAFB', // Gray-50 for buttons/elements
};

// --- Stałe do stylów ---
export const spacing = {
  base: 16,
  small: 8,
  large: 24,
};

// --- StyleSheet dla reużywalnych stylów ---
export const themeStyles = StyleSheet.create({
  // Layout
  flex1: { flex: 1 },
  paddingContainer: { padding: spacing.base },
  scrollContent: { paddingBottom: 80, backgroundColor: colors.background, paddingTop: spacing.base },
  
  // Typography
  textBase: { fontSize: 14, color: colors.text },
  textTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  textSubtitle: { fontSize: 14, color: colors.textMuted },
  textMutedSmall: { fontSize: 12, color: colors.textMuted },
  
  // Flex Utilities
  flexRow: { flexDirection: 'row', alignItems: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  gap8: { gap: 8 },
  gap16: { gap: 16 },

  // Base Card Styles (używane w Card.tsx)
  cardBase: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderWidth: 1,
    borderColor: colors.border,
  },
});

// --- Style dla Level Selector (aby uniknąć powtarzania logiki kolorów) ---
export const levelStyles = {
  getColors: (lvl: number) => {
    if (lvl <= 20) return { color: colors.secondary, background: '#D1FAE5', border: colors.secondary }; 
    if (lvl <= 40) return { color: colors.warning, background: '#FEF3C7', border: colors.warning }; 
    return { color: colors.danger, background: '#FEE2E2', border: colors.danger }; 
  },
  
  levelButton: {
    width: '19%',
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  levelButtonSelected: {
    borderWidth: 3,
    borderColor: colors.primary, 
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 5,
  },
  levelText: { fontSize: 18, fontWeight: '700' },
  levelSubText: { fontSize: 10, opacity: 0.8 },
};
