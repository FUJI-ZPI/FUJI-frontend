import React, { useState, useCallback } from "react";
import { View, StyleSheet, TouchableOpacity, Text, Dimensions, FlatList, ActivityIndicator } from "react-native";
import { PanGestureHandler, GestureHandlerRootView, State } from "react-native-gesture-handler";
import Svg, { Path } from "react-native-svg";
import * as SecureStore from 'expo-secure-store';
import { Card } from '../components/ui/Card';
import { colors } from '../theme/styles';

const { width } = Dimensions.get("window");
const CANVAS_SIZE = width - 40;

const GRID_PADDING = 40;
const ITEM_MARGIN = 8; 
const ITEMS_PER_ROW = 4;
const totalMargins = ITEM_MARGIN * (ITEMS_PER_ROW - 1);
const ITEM_WIDTH = (width - GRID_PADDING - totalMargins) / ITEMS_PER_ROW;

type RecognizedKanjiDto = {
  uuid: string;
  character: string;
};

type Stroke = {
  points: number[][];
};

type KanjiCandidatesGridProps = {
    kanjiList: RecognizedKanjiDto[];
    onSelectKanji: (item: RecognizedKanjiDto) => void;
};

const KanjiCandidatesGrid = ({ kanjiList, onSelectKanji }: KanjiCandidatesGridProps) => {
    return (
        <View style={candidateStyles.gridContainer}>
            <FlatList
                data={kanjiList}
                keyExtractor={(item) => item.uuid}
                numColumns={ITEMS_PER_ROW}
                scrollEnabled={false}
                contentContainerStyle={candidateStyles.vocabGrid} 
                renderItem={({ item, index }) => (
                    <TouchableOpacity
                        onPress={() => onSelectKanji(item)}
                    >
                        <Card style={{
                            ...candidateStyles.vocabCard,
                            width: ITEM_WIDTH,
                            height: ITEM_WIDTH
                        }}>
                            <Text style={candidateStyles.vocabText} numberOfLines={1} adjustsFontSizeToFit>
                                {item.character}
                            </Text>
                        </Card>
                    </TouchableOpacity>
                )}
                ListEmptyComponent={
                    <Text style={candidateStyles.noItemsText}>
                        Brak kandydatów
                    </Text>
                }
            />
        </View>
    );
};

export default function RecognizerScreen({ navigation }: { navigation: any }) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<number[][]>([]);
  const [recognizedKanjis, setRecognizedKanjis] = useState<RecognizedKanjiDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pointsToPath = useCallback((points: number[][]) => {
    if (points.length === 0) return "";
    return points.map((p, i) => (i === 0 ? `M ${p[0]} ${p[1]}` : `L ${p[0]} ${p[1]}`)).join(" ");
  }, []);

  const handleGesture = (event: any) => {
    const { x, y } = event.nativeEvent;
    const clampedY = Math.max(0, y);
    const clampedX = Math.max(0, x);
    setCurrentStroke((prev) => [...prev, [clampedX, clampedY]]);
  };

  const onSelectKanji = (item: RecognizedKanjiDto) => {
    navigation.navigate('Kanji', {
        screen: 'KanjiDetail',
        params: {
            kanjiUuid: item.uuid,
            character: item.character
        }
    });
  };

  const recognize = async (currentStrokes: Stroke[]) => {
    if (currentStrokes.length === 0) {
        setRecognizedKanjis([]);
        return;
    }

    setRecognizedKanjis([]);
    setIsLoading(true)

    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (!accessToken) {
        console.error("Brak tokenu dostępu.");
        return;
      }

      const userStrokesData = currentStrokes.map(stroke => stroke.points);

      const payload = {
          userStrokes: userStrokesData
      };

      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/recognizer/recognize`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Błąd API z treścią:", errorText);
        throw new Error(`Błąd API: ${response.status}`);
      }

      const data: RecognizedKanjiDto[] = await response.json();

      if (Array.isArray(data)) {
        setRecognizedKanjis(data);
      }

    } catch (error) {
      console.error("Błąd podczas wysyłania wiadomości:", error);
    } finally {
        setIsLoading(false)
    }
  };

  const handleEnd = () => {
    if (currentStroke.length > 0) {
      const newStroke: Stroke = { points: currentStroke };
      const newStrokesList = [...strokes, newStroke];

      setStrokes(newStrokesList);
      setCurrentStroke([]);

      recognize(newStrokesList);
    }
  };

  const handleClear = () => {
    setStrokes([]);
    setCurrentStroke([]);
    setRecognizedKanjis([]);
    setIsLoading(false); 
  };

  const handleUndo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) {
        recognize([]);
        return [];
      }

      const newStrokes = prev.slice(0, -1);
      recognize(newStrokes);

      return newStrokes.map(stroke => ({ points: stroke.points }));
    });
  }, []);

  const renderResults = () => {
    if (isLoading) {
        return <ActivityIndicator size="large" color={colors.secondary} style={styles.activityIndicator} />;
    }

    if (recognizedKanjis.length > 0) {
        return (
            <KanjiCandidatesGrid
                kanjiList={recognizedKanjis}
                onSelectKanji={onSelectKanji}
            />
        );
    }

    return (
        <Text style={candidateStyles.noItemsText}>
            Start drawing to see suggestions.
        </Text>
    );
  };

  return (
    <GestureHandlerRootView style={styles.container}>
      <View style={styles.canvasWrapper}>
        <PanGestureHandler
          onGestureEvent={handleGesture}
          onHandlerStateChange={(event) => {
            if (event.nativeEvent.state === State.END) handleEnd();
          }}
        >
          <View style={styles.canvasContainer}>
            <Svg width="100%" height="100%">
              <Path
                d={`M ${CANVAS_SIZE / 2} 0 L ${CANVAS_SIZE / 2} ${CANVAS_SIZE} M 0 ${CANVAS_SIZE / 2} L ${CANVAS_SIZE} ${CANVAS_SIZE / 2}`}
                stroke="#E5E7EB"
                strokeWidth={1}
              />

              {strokes.map((stroke, i) => {
                  return (
                    <Path
                      key={i}
                      d={pointsToPath(stroke.points)}
                      stroke="#1F2937"
                      strokeWidth={6}
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  );
                }
              )}

              {currentStroke.length > 0 && (
                <Path
                  d={pointsToPath(currentStroke)}
                  stroke={colors.primary}
                  strokeWidth={6}
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              )}
            </Svg>
          </View>
        </PanGestureHandler>
      </View>

    <View style={styles.resultsContainer}>
        {renderResults()}
      </View>

      <View style={styles.buttonsContainer}>
        <TouchableOpacity style={[styles.buttonBase, styles.buttonOutline]} onPress={handleClear} disabled={isLoading}>
          <Text style={styles.buttonOutlineText}>Reset</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.buttonBase, styles.buttonOutline]} onPress={handleUndo} disabled={isLoading}>
          <Text style={styles.buttonOutlineText}>Undo</Text>
        </TouchableOpacity>
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: 20,
    alignItems: "center",
    justifyContent: "space-between",
  },
  canvasWrapper: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#E5E7EB",
    backgroundColor: "#fff",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  canvasContainer: {
    flex: 1,
  },
  resultsContainer: {
    width: '100%',
    flex: 1,
    alignItems: 'center',
    marginTop: 10,
    justifyContent: 'center',
  },
  activityIndicator: {
    transform: [{ translateY: 20 }], 
  },
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 10,
    marginTop: 30,
    marginBottom: 20,
    gap: 10,
  },
  buttonBase: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
    height: 50,
    gap: 6,
  },
  buttonOutline: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  buttonOutlineText: {
    color: "#6B7280",
    fontSize: 14,
    fontWeight: "600",
  },
});

const candidateStyles = StyleSheet.create({
    gridContainer: {
        width: '100%',
    },
    vocabGrid: {
        alignItems: 'center', 
        paddingBottom: 20,
    },
    vocabCard: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 4,
        position: 'relative',
        backgroundColor: '#FFFFFF',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E5E7EB',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginHorizontal: ITEM_MARGIN / 2, 
        marginBottom: ITEM_MARGIN,
    },
    vocabText: {
        fontSize: 24, 
        fontWeight: '600',
        color: '#1F2937',
        textAlign: 'center',
    },
    tileNumber: {
        position: 'absolute',
        top: 2,
        right: 4,
        fontSize: 10,
        fontWeight: '600',
        color: '#6B7280',
        opacity: 0.7,
    },
    noItemsText: {
        textAlign: 'center',
        marginTop: 20,
        fontSize: 14,
        color: '#6B7280',
    },
});