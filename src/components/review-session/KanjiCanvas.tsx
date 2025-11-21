import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {G, Line, Path} from 'react-native-svg';
import {Card} from '../ui/Card';
import {Button} from '../ui/Button';
import {Ionicons} from '@expo/vector-icons';
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from 'react-native-gesture-handler';
import {useToast} from '../../hooks/use-toast';
import * as SecureStore from 'expo-secure-store';

type Point = {x: number; y: number};

interface KanjiCanvasProps {
  targetKanji: string;
  referenceStrokes: number[][][];
  onComplete: (accuracy: number) => void;
  showHint: boolean;
}

interface KanjiAccuracyResult {
  overallAccuracy: number;
  strokeAccuracies: number[];
}
const CANVAS_SIZE = 256;
const ACCURACY_THRESHOLD = 70;

const clamp = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(value, max));
};

// Kolorowanie: Czerwony dla błędu, Zielony dla sukcesu
const getStrokeColor = (accuracyPercent: number): string => {
  return accuracyPercent >= ACCURACY_THRESHOLD ? '#22C55E' : '#EF4444';
};

const pointsToPath = (points: Point[]): string => {
  if (points.length === 0) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  points.slice(1).forEach(p => {
    path += ` L ${p.x} ${p.y}`;
  });
  return path;
};

const KanjiCanvas: React.FC<KanjiCanvasProps> = ({
  targetKanji,
  referenceStrokes,
  onComplete,
  showHint,
}) => {
  const {toast} = useToast();

  const {referencePaths} = useMemo(() => {
    if (!referenceStrokes || referenceStrokes.length === 0) {
      return {referencePaths: []};
    }
    const paths = referenceStrokes.map(stroke => {
      if (stroke.length === 0) return '';
      let pathStr = `M ${stroke[0][0]} ${stroke[0][1]}`;
      stroke.slice(1).forEach(point => {
        pathStr += ` L ${point[0]} ${point[1]}`;
      });
      return pathStr;
    });
    return {referencePaths: paths};
  }, [referenceStrokes]);

  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);
  const [isReviewing, setIsReviewing] = useState(false);
  const [accuracyResult, setAccuracyResult] =
    useState<KanjiAccuracyResult | null>(null);

  useEffect(() => {
    resetCanvas();
  }, [targetKanji]);

  const checkKanjiAccuracyAPI = async (
    payload: any,
  ): Promise<KanjiAccuracyResult | null> => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        throw new Error('Authorization token not found.');
      }
      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/accuracy/kanji`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error (${response.status}): ${errorText}`);
      }
      const result: KanjiAccuracyResult = await response.json();
      return result;
    } catch (e: any) {
      console.error(`Failed to check kanji accuracy:`, e);
      toast({
        title: 'Accuracy Check Failed',
        description: e.message,
      });
      return null;
    }
  };

  const onGestureEvent = useCallback(
    (event: any) => {
      if (isReviewing) return;
      const {x, y} = event.nativeEvent;
      const clampedX = clamp(x, 0, CANVAS_SIZE);
      const clampedY = clamp(y, 0, CANVAS_SIZE);
      setCurrentPath(prev => [...prev, {x: clampedX, y: clampedY}]);
    },
    [isReviewing],
  );

  const onHandlerStateChange = useCallback(
    (event: any) => {
      if (isReviewing) return;

      if (event.nativeEvent.state === State.BEGAN) {
        const {x, y} = event.nativeEvent;
        const clampedX = clamp(x, 0, CANVAS_SIZE);
        const clampedY = clamp(y, 0, CANVAS_SIZE);
        setCurrentPath([{x: clampedX, y: clampedY}]);
      } else if (event.nativeEvent.state === State.END) {
        setPaths(prev => [...prev, currentPath]);
        setCurrentPath([]);
      }
    },
    [currentPath, isReviewing],
  );

  const resetCanvas = () => {
    setPaths([]);
    setCurrentPath([]);
    setIsReviewing(false);
    setAccuracyResult(null);
  };

  const undoLastStroke = () => {
    if (paths.length > 0) {
      setPaths(paths.slice(0, -1));
      if (isReviewing) {
        setIsReviewing(false);
        setAccuracyResult(null);
      }
    }
  };

  // --- KLUCZOWA ZMIANA ---
  const handleFinalCheck = async () => {
    // 1. Sprawdzenie liczby kresek
    if (paths.length !== referencePaths.length) {
      toast({
        title: 'Wrong Stroke Count',
        description: `Expected ${referencePaths.length}, got ${paths.length}. Marked as incorrect.`,
        variant: 'error',
      });

      // Ustawiamy "sztuczny" wynik 0%, żeby pokolorować wszystko na czerwono
      setAccuracyResult({
        overallAccuracy: 0,
        strokeAccuracies: new Array(paths.length).fill(0), // Wszystkie kreski 0% -> czerwone
      });
      setIsReviewing(true);

      // OD RAZU wywołujemy onComplete(0), żeby parent przeszedł dalej
      onComplete(0);
      return;
    }

    const formattedPaths = paths.map(stroke => {
      return stroke.map(point => [point.x, point.y]);
    });

    const payload = {
      userStrokes: formattedPaths,
      referenceStrokes: referenceStrokes,
    };

    const result = await checkKanjiAccuracyAPI(payload);
    if (!result) {
        onComplete(0); // Fallback w razie błędu API
        return;
    }

    setAccuracyResult(result);
    setIsReviewing(true); 

    // Przekazujemy faktyczny wynik.
    onComplete(Math.round(result.overallAccuracy * 100));
  };

  if (referencePaths.length === 0) {
    return (
      <Card style={styles.container}>
        <Text style={styles.instructionText}>
          Error: No reference strokes found for this kanji.
        </Text>
      </Card>
    );
  }

  const isResetEnabled = currentPath.length > 0 || paths.length > 0;
  const isUndoEnabled = paths.length > 0;
  const isCheckEnabled = paths.length > 0 && !isReviewing;

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.instructionText}>Draw the full kanji</Text>
        </View>

        <PanGestureHandler
          onGestureEvent={onGestureEvent}
          onHandlerStateChange={onHandlerStateChange}
          minDist={1}>
          <View style={styles.canvasContainer}>
            <Svg
              width={CANVAS_SIZE}
              height={CANVAS_SIZE}
              style={styles.canvas}>
              <G stroke="#F3F4F6" strokeWidth="1">
                <Line
                  x1={CANVAS_SIZE / 2}
                  y1="0"
                  x2={CANVAS_SIZE / 2}
                  y2={CANVAS_SIZE}
                />
                <Line
                  x1="0"
                  y1={CANVAS_SIZE / 2}
                  x2={CANVAS_SIZE}
                  y2={CANVAS_SIZE / 2}
                />
              </G>

              {showHint && (
                <G>
                  {referencePaths.map((strokePath, index) => (
                    <Path
                      key={`ref-stroke-${index}`}
                      d={strokePath}
                      stroke="#E5E7EB"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      fill="none"
                    />
                  ))}
                </G>
              )}

              {paths.map((path, index) => (
                <Path
                  key={`path-${index}`}
                  d={pointsToPath(path)}
                  stroke={
                    isReviewing && accuracyResult
                      ? getStrokeColor(
                          Math.round(
                            accuracyResult.strokeAccuracies[index] * 100,
                          ),
                        )
                      : '#1E293B'
                  }
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}

              {currentPath.length > 0 && (
                <Path
                  d={pointsToPath(currentPath)}
                  stroke="#10B981"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              )}
            </Svg>
          </View>
        </PanGestureHandler>

        <View style={styles.actions}>
          <Button
            variant="outline"
            onPress={() => resetCanvas()}
            disabled={!isResetEnabled}>
            <View style={styles.buttonContent}>
              <Ionicons
                name="reload"
                size={16}
                color={!isResetEnabled ? '#AAA' : '#666'}
              />
              <Text
                style={[
                  styles.buttonText,
                  !isResetEnabled && styles.buttonTextDisabled,
                ]}>
                Reset
              </Text>
            </View>
          </Button>

          <Button
            variant="outline"
            onPress={undoLastStroke}
            disabled={!isUndoEnabled}>
            <View style={styles.buttonContent}>
              <Ionicons
                name="arrow-undo-outline"
                size={16}
                color={!isUndoEnabled ? '#AAA' : '#666'}
              />
              <Text
                style={[
                  styles.buttonText,
                  !isUndoEnabled && styles.buttonTextDisabled,
                ]}>
                Undo
              </Text>
            </View>
          </Button>

          <Button onPress={handleFinalCheck} disabled={!isCheckEnabled}>
            <View style={styles.buttonContent}>
              <Ionicons
                name="checkmark"
                size={16}
                color={!isCheckEnabled ? '#AAA' : '#fff'}
              />
              <Text
                style={[
                  styles.buttonText,
                  {color: !isCheckEnabled ? '#AAA' : '#fff'},
                ]}>
                Check
              </Text>
            </View>
          </Button>
        </View>
      </Card>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {padding: 16},
  header: {alignItems: 'center', marginBottom: 16},
  instructionText: {fontSize: 14, color: '#666', marginBottom: 12},
  canvasContainer: {
    borderWidth: 2,
    borderColor: '#E5E7EB',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    backgroundColor: '#fff',
    alignSelf: 'center',
  },
  canvas: {backgroundColor: '#fff'},
  actions: {flexDirection: 'row', justifyContent: 'center', gap: 8, minHeight: 40},
  buttonContent: {flexDirection: 'row', alignItems: 'center', gap: 6},
  buttonText: {fontSize: 14, color: '#666', fontWeight: '500'},
  buttonTextDisabled: {color: '#AAA'},
});

export default KanjiCanvas;