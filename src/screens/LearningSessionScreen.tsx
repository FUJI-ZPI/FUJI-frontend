import React, {useEffect, useState, useCallback} from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Card} from '../components/ui/Card';
import {Button} from '../components/ui/Button';
import KanjiCanvas from '../components/learning-session/KanjiCanvas';
import {useToast} from '../hooks/use-toast';
import * as SecureStore from 'expo-secure-store';
import {useFocusEffect} from '@react-navigation/native';

import Svg, {Path} from 'react-native-svg';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';

// --- Komponenty do Animacji SVG ---
const AnimatedPath = Animated.createAnimatedComponent(Path);

const AnimatedStroke: React.FC<{
  d: string;
  index: number;
  isActive: boolean;
  color: string;
}> = ({d, index, isActive, color}) => {
  const STROKE_LENGTH = 1000;
  const strokeDashoffset = useSharedValue(STROKE_LENGTH);

  useEffect(() => {
    const strokeDuration = 800;
    const strokeDelay = 200;
    const startDelay = 300;

    if (isActive) {
      strokeDashoffset.value = withDelay(
        startDelay + index * strokeDelay,
        withTiming(0, {duration: strokeDuration, easing: Easing.out(Easing.quad)}),
      );
    } else {
      strokeDashoffset.value = STROKE_LENGTH;
    }
  }, [isActive, d, index]);

  const animatedProps = useAnimatedProps(() => {
    return {
      strokeDashoffset: strokeDashoffset.value,
    };
  });

  return (
    <AnimatedPath
      d={d}
      stroke={color}
      strokeWidth={5}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
      strokeDasharray={STROKE_LENGTH}
      animatedProps={animatedProps}
    />
  );
};

interface AnimatedKanjiProps {
  size: number;
  color: string;
  isActive: boolean;
  paths: string[];
  viewBox?: string;
  style?: StyleProp<ViewStyle>;
}

const AnimatedKanji: React.FC<AnimatedKanjiProps> = ({
  size,
  color,
  isActive,
  paths,
  viewBox = '0 0 109 109',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={viewBox}
      style={[styles.svgKanji, style]}>
      {paths.map((d, index) => (
        <AnimatedStroke
          key={index}
          d={d}
          index={index}
          isActive={isActive}
          color={color}
        />
      ))}
    </Svg>
  );
};

// --- Interfejsy ---
interface Meaning {
  meaning: string;
  primary: boolean;
  acceptedAnswer: boolean;
}
interface Reading {
  type: string;
  primary: boolean;
  reading: string;
  acceptedAnswer: boolean;
}
interface WanikaniData {
  slug: string;
  level: number;
  meanings: Meaning[];
  readings: Reading[];
  hiddenAt: string | null;
  characters: string;
  documentUrl: string;
  meaningHint?: string;
  readingHint?: string;
  lessonPosition: number;
  meaningMnemonic: string;
  readingMnemonic: string;
  unicodeCharacter: string;
  auxiliaryMeanings: {type: string; meaning: string}[];
  componentSubjectIds: number[];
  amalgamationSubjectIds: number[];
  spacedRepetitionSystemId: number;
  visuallySimilarSubjectIds: number[];
}
interface WanikaniKanjiJsonDto {
  id: number;
  url: string;
  data: WanikaniData;
  object: string;
}
interface KanjiDetailDto {
  uuid: string;
  level: number;
  character: string;
  unicodeCharacter: string;
  details: WanikaniKanjiJsonDto;
  svgPath: string[];
  componentRadicals: any[];
  relatedVocabulary: any[];
  visuallySimilarKanji: any[];
  referenceStrokes: number[][][];
}

export default function LearningSessionScreen({navigation}: any) {
  const {toast} = useToast();

  const [practiceKanjiList, setPracticeKanjiList] = useState<KanjiDetailDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [currentKanjiIndex, setCurrentKanjiIndex] = useState(0);
  const [sessionScore, setSessionScore] = useState(0);
  const [completedKanji, setCompletedKanji] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [lastAccuracy, setLastAccuracy] = useState(0);

  const [animationKey, setAnimationKey] = useState(0);

  useFocusEffect(
    useCallback(() => {
      setCurrentKanjiIndex(0);
      setSessionScore(0);
      setCompletedKanji(0);
      setShowResult(false);
      setLastAccuracy(0);
      setAnimationKey(prev => prev + 1);

      fetchLessonBatch();
    }, []),
  );

  const fetchLessonBatch = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        throw new Error('Authorization token not found.');
      }

      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/srs/lesson-batch`;
      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.status}`);
      }

      const data: KanjiDetailDto[] = await response.json();
      setPracticeKanjiList(data);
    } catch (e: any) {
      setError(e.message || 'Failed to fetch lessons.');
      toast({
        title: 'Error',
        description: e.message || 'Failed to fetch lessons.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // --- LOGIKA: Usunięto funkcję addCardToSrs (Backend robi to automatycznie) ---

  const currentKanji = practiceKanjiList[currentKanjiIndex];
  const totalKanji = practiceKanjiList.length;

  const handleKanjiComplete = async (accuracy: number) => {
    if (!currentKanji) return;

    setLastAccuracy(accuracy);
    setSessionScore(prev => prev + accuracy);
    setCompletedKanji(prev => prev + 1);
    setShowResult(true);

    if (accuracy >= 90) {
      toast({
        title: 'Excellent! 🎉',
        description: `Perfect drawing! ${accuracy}% accuracy`,
        variant: 'success',
      });
    } else if (accuracy >= 70) {
      toast({
        title: 'Good job! 👍',
        description: `Nice work! ${accuracy}% accuracy`,
        variant: 'success',
      });
    } else {
      toast({
        title: 'Keep trying! 💪',
        description: `${accuracy}% accuracy. Practice makes perfect!`,
        variant: 'info',
      });
    }

    // --- LOGIKA: Nie wywołujemy SRS tutaj. Backend zapisał wynik po otrzymaniu rysunku. ---

    setTimeout(() => {
      nextKanji();
    }, 2000);
  };

  const nextKanji = () => {
    setShowResult(false);
    if (currentKanjiIndex < practiceKanjiList.length - 1) {
      setCurrentKanjiIndex(prev => prev + 1);
      setAnimationKey(prev => prev + 1);
    } else {
      const averageScore =
        completedKanji > 0 ? Math.round(sessionScore / completedKanji) : 0;
      toast({
        title: 'Session Complete! 🎊',
        description: `Average accuracy: ${averageScore}%. Great work!`,
        variant: 'success',
      });
      navigation.goBack();
    }
  };

  const restartSession = () => {
    setCurrentKanjiIndex(0);
    setSessionScore(0);
    setCompletedKanji(0);
    setShowResult(false);
    setLastAccuracy(0);
    setAnimationKey(prev => prev + 1);
    toast({title: 'Session restarted', variant: 'info'});
  };

  if (isLoading) {
    return (
      <View style={styles.emptyContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.emptyText}>Fetching lessons...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>Error!</Text>
        <Text style={styles.emptyText}>{error}</Text>
        <Button onPress={fetchLessonBatch}>
          <Text style={styles.buttonTextWhite}>Try again</Text>
        </Button>
      </View>
    );
  }

  if (practiceKanjiList.length === 0 || !currentKanji) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyTitle}>No kanji to learn!</Text>
        <Text style={styles.emptyText}>
          You've completed all available kanji for now.
        </Text>
        <Button onPress={() => navigation.goBack()}>
          <Text style={styles.buttonTextWhite}>Return to Dashboard</Text>
        </Button>
      </View>
    );
  }

  const primaryMeaning =
    currentKanji.details.data.meanings.find(m => m.primary)?.meaning ||
    'No meaning';

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <Ionicons name="arrow-back" size={20} color="#666" />
          <Text style={styles.headerButtonText}>Back</Text>
        </TouchableOpacity>
        <View style={styles.progressInfo}>
          <Text style={styles.progressLabel}>Progress</Text>
          <Text style={styles.progressValue}>
            {completedKanji} / {totalKanji}
          </Text>
        </View>
        <View style={{width: 50}} />
      </View>

      <Card style={styles.card}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Learn This Kanji</Text>
          <TouchableOpacity
            onPress={() => setAnimationKey(prev => prev + 1)}
            style={styles.replayButton}>
            <Ionicons name="reload-circle" size={28} color="#10B981" />
          </TouchableOpacity>
        </View>

        <View style={styles.kanjiDisplay}>
          <View style={styles.kanjiCharacterContainer}>
            <AnimatedKanji
              key={animationKey}
              size={120}
              color="#10B981"
              paths={currentKanji.svgPath}
              isActive={true}
              style={styles.kanjiAnimationOverlay}
            />
          </View>
          <Text style={styles.kanjiMeaning}>{primaryMeaning}</Text>
        </View>
      </Card>

      {showResult ? (
        <Card style={styles.resultCard}>
          <Text style={styles.resultEmoji}>
            {lastAccuracy >= 90 ? '🎉' : lastAccuracy >= 70 ? '👍' : '💪'}
          </Text>
          <Text style={styles.resultTitle}>
            {lastAccuracy >= 90
              ? 'Excellent!'
              : lastAccuracy >= 70
              ? 'Good Job!'
              : 'Keep Trying!'}
          </Text>
          <Text style={styles.resultAccuracy}>
            Accuracy:
            <Text style={styles.resultAccuracyValue}>{lastAccuracy}%</Text>
          </Text>
          <Text style={styles.resultMessage}>Moving to the next one...</Text>
        </Card>
      ) : (
        <KanjiCanvas
          // --- LOGIKA: Przekazujemy ID i flagę lekcji ---
          kanjiUuid={currentKanji.uuid}
          isLearningSession={true}
          
          targetKanji={currentKanji.character}
          referenceStrokes={currentKanji.referenceStrokes}
          onComplete={handleKanjiComplete}
        />
      )}

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F5F7FA'},
  contentContainer: {padding: 16},
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerButton: {flexDirection: 'row', alignItems: 'center', gap: 4, padding: 8},
  headerButtonText: {fontSize: 14, color: '#666', fontWeight: '600'},
  progressInfo: {alignItems: 'center'},
  progressLabel: {fontSize: 12, color: '#666'},
  progressValue: {fontSize: 16, fontWeight: '600', color: '#333'},
  card: {padding: 16, marginBottom: 16},
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
  replayButton: {
    position: 'absolute',
    right: 0,
    top: -4,
  },
  kanjiDisplay: {alignItems: 'center', marginBottom: 16},
  kanjiCharacterContainer: {
    width: 120,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  svgKanji: {
    // Styl dla SVG
  },
  kanjiAnimationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  kanjiMeaning: {fontSize: 18, fontWeight: '500', color: '#333'},
  resultCard: {padding: 24, alignItems: 'center', marginBottom: 16},
  resultEmoji: {fontSize: 64, marginBottom: 16},
  resultTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  resultAccuracy: {fontSize: 18, color: '#666', marginBottom: 8},
  resultAccuracyValue: {fontWeight: 'bold', color: '#10B981'},
  resultMessage: {fontSize: 14, color: '#999'},
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F5F7FA',
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 24,
    textAlign: 'center',
  },
  buttonTextWhite: {color: '#fff', fontSize: 14, fontWeight: '600'},
  bottomSpacer: {height: 24},
});