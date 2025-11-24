import React, {useEffect, useState, useCallback, useMemo} from 'react';
import {StyleSheet, Text, View} from 'react-native';
import Svg, {G, Line, Path, Circle, Polygon} from 'react-native-svg';
import {Card} from '../ui/Card';
import {Button} from '../ui/Button';
import {Ionicons} from '@expo/vector-icons';
import {
  PanGestureHandler,
  GestureHandlerRootView,
  State,
} from 'react-native-gesture-handler';
import {useToast} from '../../hooks/use-toast';
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import * as SecureStore from 'expo-secure-store';

const getArrowConfig = (path: string) => {
  const numbers = path.match(/[-+]?[0-9]*\.?[0-9]+/g)?.map(Number);

  if (!numbers || numbers.length < 4) return null;

  const startX = numbers[0];
  const startY = numbers[1];
  const endX = numbers[numbers.length - 2];
  const endY = numbers[numbers.length - 1];

  const midX = (startX + endX) / 2;
  const midY = (startY + endY) / 2;

  const angle = Math.atan2(endY - startY, endX - startX) * (180 / Math.PI);

  return {x: midX, y: midY, rotation: angle};
};

const StrokeDirectionArrow: React.FC<{d: string; color?: string}> = ({d, color = "#EF4444"}) => {
  const config = useMemo(() => getArrowConfig(d), [d]);

  if (!config) return null;

  const arrowLength = 40;
  const offset = 16;

  return (
    <G x={config.x} y={config.y} rotation={config.rotation} origin="0, 0">
      <G y={offset} x={-arrowLength / 2}>
        <Line 
          x1={0} y1={0} x2={arrowLength} y2={0} 
          stroke={color} strokeWidth={2} opacity={0.8}
        />
        <Polygon
          points={`${arrowLength},0 ${arrowLength - 6},-4 ${arrowLength - 6},4`}
          fill={color} opacity={0.8}
        />
        <Circle cx={0} cy={0} r={2} fill={color} opacity={0.6} />
      </G>
    </G>
  );
};

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
      strokeWidth={4}
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
  style?: any;
}

const pointsToPath = (points: Point[]): string => {
  if (points.length === 0) return '';
  let path = `M ${points[0].x} ${points[0].y}`;
  points.slice(1).forEach(p => {
    path += ` L ${p.x} ${p.y}`;
  });
  return path;
};

export const AnimatedKanji: React.FC<AnimatedKanjiProps> = ({
  size,
  color,
  isActive,
  paths,
  viewBox = '0 0 256 256',
  style,
}) => {
  return (
    <Svg
      width={size}
      height={size}
      viewBox={viewBox}
      style={[styles.canvasAnimation, style]}>
      
      {paths.map((d, index) => (
        <AnimatedStroke
          key={`stroke-${index}`}
          d={d}
          index={index}
          isActive={isActive}
          color={color}
        />
      ))}

      {isActive && paths.map((d, index) => (
         <StrokeDirectionArrow key={`arrow-${index}`} d={d} />
      ))}
    </Svg>
  );
};

type Point = {x: number; y: number};

interface KanjiCanvasProps {
  kanjiUuid: string;
  isLearningSession: boolean;
  targetKanji: string;
  referenceStrokes: number[][][];
  onComplete: (accuracy: number) => void;
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

const getStrokeColor = (accuracyPercent: number): string => {
  return accuracyPercent >= ACCURACY_THRESHOLD ? '#22C55E' : '#EF4444';
};

const KanjiCanvas: React.FC<KanjiCanvasProps> = ({
  kanjiUuid,
  isLearningSession,
  targetKanji,
  referenceStrokes,
  onComplete,
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

  const [practiceMode, setPracticeMode] = useState<'guided' | 'free'>('guided');
  const [currentStrokeIndex, setCurrentStrokeIndex] = useState(0);
  const [animationKey, setAnimationKey] = useState(0);

  const [guidedPaths, setGuidedPaths] = useState<Point[][]>([]);
  const [paths, setPaths] = useState<Point[][]>([]);
  const [currentPath, setCurrentPath] = useState<Point[]>([]);

  const [isReviewing, setIsReviewing] = useState(false);
  const [accuracyResult, setAccuracyResult] = useState<KanjiAccuracyResult | null>(null);

  useEffect(() => {
    resetCanvas(true);
  }, [targetKanji]);

  const checkAccuracyAPI = async (
    endpoint: 'stroke' | 'kanji',
    payload: any,
  ): Promise<KanjiAccuracyResult | null> => {
    try {
      const token = await SecureStore.getItemAsync('accessToken');
      if (!token) {
        throw new Error('Authorization token not found.');
      }

      const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/checker/${endpoint}`;

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

      return await response.json();
    } catch (e: any) {
      console.error(`Checker API error (${endpoint}):`, e);
      toast({
        title: 'Check Failed',
        description: e.message,
      });
      return null;
    }
  };

  const onGestureEvent = useCallback((event: any) => {
    if (isReviewing) return;
    const {x, y} = event.nativeEvent;
    const clampedX = clamp(x, 0, CANVAS_SIZE);
    const clampedY = clamp(y, 0, CANVAS_SIZE);
    setCurrentPath(prev => [...prev, {x: clampedX, y: clampedY}]);
  }, [isReviewing]);

  const onHandlerStateChange = useCallback(
    async (event: any) => {
      if (isReviewing) return;

      if (event.nativeEvent.state === State.BEGAN) {
        const {x, y} = event.nativeEvent;
        const clampedX = clamp(x, 0, CANVAS_SIZE);
        const clampedY = clamp(y, 0, CANVAS_SIZE);
        setCurrentPath([{x: clampedX, y: clampedY}]);
      } else if (event.nativeEvent.state === State.END) {
        if (practiceMode === 'guided') {
          const payload = {
            userStroke: currentPath.map(p => [p.x, p.y]),
            referenceStroke: referenceStrokes[currentStrokeIndex],
          };
          const result = await checkAccuracyAPI('stroke', payload);

          if (!result) {
            setCurrentPath([]);
            return;
          }

          const accuracy = Math.round(result.overallAccuracy * 100);

          if (accuracy >= ACCURACY_THRESHOLD) {
            setGuidedPaths(prev => [...prev, currentPath]);

            if (currentStrokeIndex < referencePaths.length - 1) {
              setCurrentStrokeIndex(prev => prev + 1);
              setAnimationKey(prev => prev + 1);
              toast({title: 'Correct stroke! ✓', variant: 'success'});
            } else {
              setPracticeMode('free');
              setCurrentStrokeIndex(0);
              setPaths([]);
              setGuidedPaths([]);
              toast({
                title: 'Great! 🎉',
                description: 'Now draw the full kanji from memory.',
                variant: 'success',
              });
            }
          } else {
            toast({title: 'Try that stroke again.', variant: 'error'});
          }
          setCurrentPath([]);
        } else {
          setPaths(prev => [...prev, currentPath]);
          setCurrentPath([]);
        }
      }
    },
    [
      practiceMode,
      currentPath,
      currentStrokeIndex,
      referencePaths,
      referenceStrokes,
      isReviewing,
    ],
  );

  const resetCanvas = (fullReset = false) => {
    if (fullReset) {
      setPracticeMode('guided');
      setCurrentStrokeIndex(0);
      setAnimationKey(prev => prev + 1);
    }
    setPaths([]);
    setGuidedPaths([]);
    setCurrentPath([]);
    setIsReviewing(false);
    setAccuracyResult(null);
  };

  const undoLastStroke = () => {
    if (practiceMode !== 'free' || paths.length === 0) return;
    setPaths(paths.slice(0, -1));
    if (isReviewing) {
      setIsReviewing(false);
      setAccuracyResult(null);
    }
  };

  const handleFinalCheck = async () => {
    if (paths.length !== referencePaths.length) {
      toast({
        title: 'Incorrect Stroke Count',
        description: `Expected ${referencePaths.length}, got ${paths.length}.`,
        variant: 'error',
      });
      return;
    }

    const formattedPaths = paths.map(stroke => {
      return stroke.map(point => [point.x, point.y]);
    });

    const payload = {
      kaniUuid: kanjiUuid,
      userStrokes: formattedPaths,
      referenceStrokes: referenceStrokes,
      isLearningSession: isLearningSession
    };
    
    const result = await checkAccuracyAPI('kanji', payload);

    if (!result) return;

    setAccuracyResult(result);
    setIsReviewing(true);

    if (Math.round(result.overallAccuracy * 100) > ACCURACY_THRESHOLD) {
      onComplete(Math.round(result.overallAccuracy * 100));
    } else {
      toast({
        title: 'Not quite right',
        description: 'Accuracy too low. Try again to pass!',
        variant: 'error',
      });
    }
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

  const isUndoDisabled = paths.length === 0;
  const isCheckDisabled = paths.length === 0 || isReviewing;
  const isResetEnabled = currentPath.length > 0 || paths.length > 0 || guidedPaths.length > 0;

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <Card style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.instructionText}>
            {practiceMode === 'guided'
              ? `Draw stroke ${currentStrokeIndex + 1} / ${referencePaths.length}`
              : 'Draw the full kanji'}
          </Text>
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
                <Line x1={CANVAS_SIZE / 2} y1="0" x2={CANVAS_SIZE / 2} y2={CANVAS_SIZE} />
                <Line x1="0" y1={CANVAS_SIZE / 2} x2={CANVAS_SIZE} y2={CANVAS_SIZE / 2} />
              </G>

              {practiceMode === 'guided' ? (
                <AnimatedKanji
                  key={animationKey}
                  size={CANVAS_SIZE}
                  color="#E5E7EB"
                  paths={[referencePaths[currentStrokeIndex]]}
                  isActive={true}
                  viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
                />
              ) : (
                <G opacity={0.3}>
                  {referencePaths.map((strokePath, index) => (
                    <React.Fragment key={`ref-group-${index}`}>
                      <Path
                        d={strokePath}
                        stroke="#9CA3AF"
                        strokeWidth="4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                      />
                      <StrokeDirectionArrow d={strokePath} color="#EF4444" />
                    </React.Fragment>
                  ))}
                </G>
              )}

              {guidedPaths.map((path, index) => (
                <Path
                  key={`guided-path-${index}`}
                  d={pointsToPath(path)}
                  stroke="#1E293B"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              ))}

              {practiceMode === 'free' &&
                paths.map((path, index) => (
                  <Path
                    key={`path-${index}`}
                    d={pointsToPath(path)}
                    stroke={
                      isReviewing && accuracyResult
                        ? getStrokeColor(Math.round(accuracyResult.strokeAccuracies[index] * 100))
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
          {practiceMode === 'free' ? (
            <>
              <Button
                variant="outline"
                onPress={() => resetCanvas(false)}
                disabled={!isResetEnabled}>
                <View style={styles.buttonContent}>
                  <Ionicons name="reload" size={16} color={!isResetEnabled ? '#AAA' : '#666'} />
                  <Text style={[styles.buttonText, !isResetEnabled && styles.buttonTextDisabled]}>
                    Reset
                  </Text>
                </View>
              </Button>

              <Button
                variant="outline"
                onPress={undoLastStroke}
                disabled={isUndoDisabled}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="arrow-undo-outline" size={16} color={isUndoDisabled ? '#AAA' : '#666'} />
                  <Text style={[styles.buttonText, isUndoDisabled && styles.buttonTextDisabled]}>
                    Undo
                  </Text>
                </View>
              </Button>

              <Button
                onPress={handleFinalCheck}
                disabled={isCheckDisabled}
              >
                <View style={styles.buttonContent}>
                  <Ionicons name="checkmark" size={16} color={isCheckDisabled ? '#AAA' : '#fff'} />
                  <Text style={[styles.buttonText, {color: isCheckDisabled ? '#AAA' : '#fff'}]}>
                    Check
                  </Text>
                </View>
              </Button>
            </>
          ) : (
            <View style={styles.actionsPlaceholder} />
          )}
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
  canvasAnimation: {position: 'absolute', top: 0, left: 0, right: 0, bottom: 0},
  actions: {flexDirection: 'row', justifyContent: 'center', gap: 8, minHeight: 40},
  actionsPlaceholder: {flex: 1, flexDirection: 'row', gap: 8},
  buttonContent: {flexDirection: 'row', alignItems: 'center', gap: 6},
  buttonText: {fontSize: 14, color: '#666', fontWeight: '500'},
  buttonTextDisabled: {color: '#AAA'},
});

export default KanjiCanvas;