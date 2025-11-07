import { StyleSheet } from 'react-native';


export const colors = {
  primary: '#3B82F6',
  secondary: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  background: '#f2f7f5',
  cardBackground: '#fff',
  text: '#1F2937',
  textMuted: '#6B7280',
  border: '#E5E7EB',
  lightBackground: '#F9FAFB',
};

export const chatbotColors = {
  primary: '#368A59',       
  primaryForeground: '#FFFFFF', 
  background: '#F5F5F5',    
  card: '#FFFFFF',          
  foreground: '#1F2937',    
  mutedForeground: '#6B7280', 
  border: '#E5E7EB',        
  red: '#EF4444',
  translationBackground: '#E0F2F1',
  translationBorder: '#00796B',
};

export const spacing = {
  base: 16,
  small: 8,
  large: 24,
};

export const themeStyles = StyleSheet.create({
  flex1: { flex: 1 },
  paddingContainer: { padding: spacing.base },
  scrollContent: { paddingBottom: 80, backgroundColor: colors.background, paddingTop: spacing.base },
  
  textBase: { fontSize: 14, color: colors.text },
  textTitle: { fontSize: 18, fontWeight: '600', color: colors.text },
  textSubtitle: { fontSize: 14, color: colors.textMuted },
  textMutedSmall: { fontSize: 12, color: colors.textMuted },
  
  flexRow: { flexDirection: 'row', alignItems: 'center' },
  justifyBetween: { justifyContent: 'space-between' },
  gap8: { gap: 8 },
  gap16: { gap: 16 },

  cardBase: {
    backgroundColor: colors.cardBackground,
    borderRadius: 12,
    padding: spacing.base,
    marginBottom: spacing.base,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
 //   shadowOpacity: 0.1,
 //   shadowRadius: 4,
 //   elevation: 3,
 //   borderWidth: 1,
 //   borderColor: colors.border,
  },
});


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
