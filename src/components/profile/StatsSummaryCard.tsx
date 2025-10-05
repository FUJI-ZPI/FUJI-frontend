import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { themeStyles, colors } from '../../theme/styles';

interface StatItem {
  iconSet?: 'Feather' | 'Ionicons';
  iconName: string;
  label: string;
  value: string | number;
}

interface StatsSummaryCardProps {
  title?: string;
  stats: StatItem[];
}

export const StatsSummaryCard: React.FC<StatsSummaryCardProps> = ({ title = "Statistics", stats }) => {
  const renderIcon = (iconSet: string | undefined, iconName: string) => {
    switch (iconSet) {
      case 'Ionicons':
        return <Ionicons name={iconName as any} size={16} color={colors.textMuted} />;
      case 'Feather':
      default:
        return <Feather name={iconName as any} size={16} color={colors.textMuted} />;
    }
  };

  return (
    <Card title={title}>
      <View style={styles.statsSummaryGrid}>
        {stats.map((stat, index) => (
          <View key={index} style={styles.statSummaryItem}>
            <View style={styles.statSummaryRow}>
              {renderIcon(stat.iconSet, stat.iconName)}
              <Text style={themeStyles.textSubtitle}>{stat.label}</Text>
            </View>
            <Text style={styles.statSummaryValue}>{stat.value}</Text>
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  statsSummaryGrid: { 
    ...themeStyles.flexRow, 
    flexWrap: 'wrap', 
    justifyContent: 'space-between', 
    rowGap: 16,
    paddingTop: 8,
  },
  statSummaryItem: { width: '45%' },
  statSummaryRow: {
    ...themeStyles.flexRow,
    ...themeStyles.gap8,
    marginBottom: 4,
  },
  statSummaryValue: {
    fontSize: 16,
    fontWeight: '500',
    marginLeft: 22,
    color: colors.text,
  },
});
