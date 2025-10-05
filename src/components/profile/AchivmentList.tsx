import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { themeStyles, colors } from '../../theme/styles';

interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt: Date | null;
}

interface AchievementListProps {
  achievements: Achievement[];
}

export const AchievementList: React.FC<AchievementListProps> = ({ achievements }) => {
  const unlockedCount = achievements.filter(a => a.unlocked).length;
  
  return (
    <Card style={styles.cardSpacing}>
      <View style={styles.cardHeader}>
        <Feather name="award" size={20} color={colors.warning} />
        <Text style={themeStyles.textTitle}>Achievements ({unlockedCount}/{achievements.length})</Text>
      </View>
      <View style={themeStyles.gap16}>
        {achievements.map((achievement) => (
          <View
            key={achievement.id}
            style={[
              styles.achievementItem,
              achievement.unlocked ? styles.achievementUnlocked : styles.achievementLocked,
            ]}
          >
            <Text style={styles.achievementIcon}>{achievement.unlocked ? achievement.icon : '🔒'}</Text>
            <View style={themeStyles.flex1}>
              <Text style={achievement.unlocked ? styles.achievementTitle : styles.achievementTitleLocked}>
                {achievement.title}
              </Text>
              <Text style={styles.achievementDescription}>{achievement.description}</Text>
              {achievement.unlocked && achievement.unlockedAt && (
                <Text style={styles.achievementDate}>
                  Unlocked {achievement.unlockedAt.toLocaleDateString()}
                </Text>
              )}
            </View>
            {achievement.unlocked && (
              <Badge variant="warning">
                ✓ Unlocked
              </Badge>
            )}
          </View>
        ))}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardSpacing: { marginBottom: themeStyles.paddingContainer.padding },
  
  cardHeader: {
    ...themeStyles.flexRow,
    ...themeStyles.gap8,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingBottom: 10,
    marginBottom: 10,
  },
  achievementItem: {
    ...themeStyles.flexRow,
    alignItems: 'flex-start',
    gap: 12,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
  },
  achievementUnlocked: {
    backgroundColor: colors.warning + '10', 
    borderColor: colors.warning, 
  },
  achievementLocked: {
    backgroundColor: colors.border + '30', 
    opacity: 0.6,
    borderColor: colors.border,
  },
  achievementIcon: {
    fontSize: 24,
  },
  achievementTitle: {
    fontWeight: '500',
    color: colors.text,
  },
  achievementTitleLocked: {
    fontWeight: '500',
    color: colors.textMuted, 
  },
  achievementDescription: {
    fontSize: 13,
    color: colors.textMuted,
  },
  achievementDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
});
