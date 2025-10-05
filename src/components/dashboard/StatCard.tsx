import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons, Feather } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { themeStyles, colors } from '../../theme/styles';

interface StatCardProps {
  iconName: keyof typeof Ionicons.glyphMap | keyof typeof Feather.glyphMap;
  iconSet: 'Ionicons' | 'Feather';
  iconColor: string;
  value: number | string;
  label: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  iconName,
  iconSet,
  iconColor,
  value,
  label
}) => {
  const Icon = iconSet === 'Ionicons' ? Ionicons : Feather;

  return (
    <Card style={styles.statCard}>
      <View style={styles.statContent}>
        <View style={themeStyles.flexRow}>
          <Icon name={iconName as any} size={24} color={iconColor} />
          <Text style={styles.statValue}>{value}</Text>
        </View>
        <Text style={styles.statLabel}>{label}</Text>
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  statCard: {
    width: '48%',
    padding: 10,
    marginBottom: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statContent: { 
    alignItems: 'center', 
    justifyContent: 'center', 
    width: '100%',
    gap: 4,
  },
  statValue: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: colors.text,
    marginLeft: 8,
  },
  statLabel: { 
    fontSize: 12, 
    color: colors.textMuted,
  },
  statHint: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
});