import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../ui/Card';
import { themeStyles, levelStyles, colors } from '../../theme/styles';
import { totalKanjiCount, KANJI_PER_LEVEL } from '../../data/mockData';

interface KanjiStat {
  level: number;
  learned: boolean;
}

interface LevelSelectorProps {
  mockKanji: KanjiStat[];
  TOTAL_LEVELS: number;
}

const getLevelKanjiStats = (kanji: KanjiStat[], level: number) => {
    const levelKanji = kanji.filter(k => k.level === level);
    const learned = levelKanji.filter(k => k.learned).length;
    const total = levelKanji.length;
    const progress = total > 0 ? (learned / total) * 100 : 0;
    return { learned, total, progress };
};


export const LevelSelector: React.FC<LevelSelectorProps> = ({ mockKanji, TOTAL_LEVELS }) => {
  const levelsPerPage = 10;
  const totalPages = Math.ceil(TOTAL_LEVELS / levelsPerPage);

  const [selectedLevel, setSelectedLevel] = useState<number>(1);
  const [currentLevelGroup, setCurrentLevelGroup] = useState<number>(1);
  

  const currentLevelPage = Math.floor((currentLevelGroup - 1) / levelsPerPage);

  const setRange = (direction: 'next' | 'prev') => {
    let newPage = currentLevelPage;
    
    if (direction === 'next' && newPage < totalPages - 1) {
      newPage += 1;
    } else if (direction === 'prev' && newPage > 0) {
      newPage -= 1;
    }

    const newGroupStart = newPage * levelsPerPage + 1;
    
    setCurrentLevelGroup(newGroupStart);
    if (newGroupStart <= TOTAL_LEVELS) {
      setSelectedLevel(newGroupStart);
    }
  };
  
  const currentLevelsToDisplay = useMemo(() => {
    return Array.from({ length: levelsPerPage }, (_, i) => currentLevelGroup + i)
            .filter(level => level <= TOTAL_LEVELS);
  }, [currentLevelGroup, TOTAL_LEVELS, levelsPerPage]);

  const startLevel = currentLevelGroup;
  const endLevel = currentLevelGroup + currentLevelsToDisplay.length - 1;
  const selectedLevelStats = getLevelKanjiStats(mockKanji, selectedLevel);

  return (
    <Card style={styles.cardSpacing}>
      <View style={styles.cardHeaderWithNav}>
        <View>
          <Text style={themeStyles.textTitle}>Kanji Mastery</Text>
          <Text style={themeStyles.textMutedSmall}>
            Poziomy {startLevel}-{endLevel} z {TOTAL_LEVELS}
          </Text>
        </View>

        <View style={themeStyles.flexRow}>
          <TouchableOpacity
            onPress={() => setRange('prev')}
            disabled={currentLevelPage === 0}
            style={[styles.navButton, currentLevelPage === 0 && styles.navButtonDisabled]}
          >
            <Ionicons name="chevron-back" size={20} color={currentLevelPage === 0 ? colors.border : colors.text} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setRange('next')}
            disabled={currentLevelPage === totalPages - 1}
            style={[styles.navButton, currentLevelPage === totalPages - 1 && styles.navButtonDisabled]}
          >
            <Ionicons name="chevron-forward" size={20} color={currentLevelPage === totalPages - 1 ? colors.border : colors.text} />
          </TouchableOpacity>
        </View>
      </View>
      
      <View style={styles.levelSelectorGrid}>
        {currentLevelsToDisplay.map((level) => {
          const stats = getLevelKanjiStats(mockKanji, level);
          const colorStyle = levelStyles.getColors(level);
          const isSelected = selectedLevel === level;
          
          return (
            <TouchableOpacity
              key={level}
              onPress={() => setSelectedLevel(level)}
              style={[
                levelStyles.levelButton,
                { backgroundColor: colorStyle.background, borderColor: colorStyle.border },
                isSelected && levelStyles.levelButtonSelected,
              ]}
            >
              <Text style={[levelStyles.levelText, { color: colorStyle.color }]}>{level}</Text>
              <Text style={[levelStyles.levelSubText, { color: colorStyle.color }]}>{stats.learned}/{KANJI_PER_LEVEL}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </Card>
  );
};

const styles = StyleSheet.create({
  cardSpacing: { marginBottom: themeStyles.paddingContainer.padding },
  
  cardHeaderWithNav: {
    ...themeStyles.flexRow,
    ...themeStyles.justifyBetween,
    marginBottom: 12,
  },
  
  navButton: {
    padding: 8,
    borderRadius: 8,
    borderWidth: 1, 
    borderColor: colors.border, 
    backgroundColor: colors.lightBackground,
  },
  navButtonDisabled: {
    opacity: 0.5,
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
  },
  
  levelSelectorGrid: { 
    flexDirection: 'row', 
    flexWrap: 'wrap', 
    gap: 8, 
    justifyContent: 'flex-start',
  },
  levelProgressSection: { 
    paddingTop: 12, 
    borderTopWidth: 1, 
    borderTopColor: colors.border, 
    marginTop: 16,
    gap: 8,
  },
  fontMedium: { fontWeight: '500', color: colors.text },
});