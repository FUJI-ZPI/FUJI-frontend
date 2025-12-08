import React, { useState, useCallback } from "react";
import { 
  View, StyleSheet, TouchableOpacity, Text, Dimensions, 
  FlatList, ActivityIndicator 
} from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { PanGestureHandler, GestureHandlerRootView, State } from "react-native-gesture-handler";
import Svg, { Path, Defs, LinearGradient as SvgLinearGradient, Stop, Rect } from "react-native-svg";
import * as SecureStore from 'expo-secure-store';
import { Ionicons } from '@expo/vector-icons';

// Import kolorów z Twojego projektu (to "zielonkawe" tło)
import { colors } from '../theme/styles';

// --- THEME CONSTANTS (Elementy UI w stylu Zen) ---
const JP_THEME = {
  // Nie używamy tu bg, bo bierzemy colors.background
  ink: '#1F2937',        // Sumi Ink
  primary: '#4673aa',    // Fuji Blue
  accent: '#f74f73',     // Sun Red
  sand: '#E5E0D6',       // Guide lines
  paperWhite: '#FFFFFF', // Canvas background
  textMuted: '#64748b',
};

const { width } = Dimensions.get("window");
const CANVAS_SIZE = width - 48; 

const ITEM_MARGIN = 5; 
const ITEMS_PER_ROW = 5;
const GRID_PADDING = 70; 
const ITEM_WIDTH = (width - GRID_PADDING - (ITEM_MARGIN * (ITEMS_PER_ROW - 1))) / ITEMS_PER_ROW;

// --- HEADER ILLUSTRATION (TORII MINIMAL) ---
const HeaderTorii = () => (
  <View style={styles.toriiContainer} pointerEvents="none">
    <Svg width="100" height="50" viewBox="0 0 120 60" style={{ opacity: 0.6 }}>
       <Defs>
          <SvgLinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={JP_THEME.accent} stopOpacity="1" />
            <Stop offset="1" stopColor="#c23b22" stopOpacity="1" />
          </SvgLinearGradient>
       </Defs>
       <Path d="M 10 20 Q 60 10 110 20 L 112 28 Q 60 18 8 28 Z" fill="url(#grad)" />
       <Rect x="25" y="28" width="6" height="30" rx="1" fill="#c0392b" />
       <Rect x="89" y="28" width="6" height="30" rx="1" fill="#c0392b" />
    </Svg>
  </View>
);

type RecognizedKanjiDto = { uuid: string; character: string; };
type Stroke = { points: Point[]; };
type Point = {x: number; y: number};

// --- COMPONENTS ---

const KanjiCandidatesGrid = ({ kanjiList, onSelectKanji }: { kanjiList: RecognizedKanjiDto[]; onSelectKanji: (item: RecognizedKanjiDto) => void; }) => {
    return (
        <View style={candidateStyles.gridContainer}>
            <Text style={candidateStyles.sectionTitle}>CANDIDATES</Text>
            <FlatList
                data={kanjiList}
                keyExtractor={(item) => item.uuid}
                numColumns={ITEMS_PER_ROW}
                scrollEnabled={true}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={candidateStyles.vocabGrid} 
                renderItem={({ item }) => (
                    <TouchableOpacity
                        onPress={() => onSelectKanji(item)}
                        activeOpacity={0.7}
                        style={[candidateStyles.vocabCard, { width: ITEM_WIDTH, height: ITEM_WIDTH }]}
                    >
                        <View style={candidateStyles.cardInner}>
                             <Text style={candidateStyles.vocabText} numberOfLines={1} adjustsFontSizeToFit>
                                {item.character}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            />
        </View>
    );
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(value, max));

// --- MAIN SCREEN ---

export default function RecognizerScreen({ navigation }: { navigation: any }) {
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Point[]>([]);
  const [recognizedKanjis, setRecognizedKanjis] = useState<RecognizedKanjiDto[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const pointsToPath = useCallback((points: Point[]) => {
    if (points.length === 0) return "";
    return points.map((p, i) => (i === 0 ? `M ${p.x} ${p.y}` : `L ${p.x} ${p.y}`)).join(" ");
  }, []);

  const onSelectKanji = (item: RecognizedKanjiDto) => {
    navigation.navigate('Kanji', { screen: 'KanjiDetail', params: { kanjiUuid: item.uuid, character: item.character } });
  };

  const recognize = async (currentStrokes: Stroke[]) => {
    if (currentStrokes.length === 0) { setRecognizedKanjis([]); return; }
    setRecognizedKanjis([]); setIsLoading(true);

    try {
      const accessToken = await SecureStore.getItemAsync('accessToken');
      if (!accessToken) return;

      const userStrokesData = currentStrokes.map(stroke => stroke.points.map(p => [p.x, p.y]));
      
      const response = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/recognizer/recognize`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${accessToken}` },
        body: JSON.stringify({ userStrokes: userStrokesData })
      });

      if (!response.ok) throw new Error(`API Error: ${response.status}`);
      const data: RecognizedKanjiDto[] = await response.json();
      if (Array.isArray(data)) setRecognizedKanjis(data);

    } catch (error) { console.error(error); } finally { setIsLoading(false); }
  };

  const onGestureEvent = useCallback((event: any) => {
    const { x, y } = event.nativeEvent;
    setCurrentStroke((prev) => [...prev, {x: clamp(x, 0, CANVAS_SIZE), y: clamp(y, 0, CANVAS_SIZE)}]);
  }, []);

  const onHandlerStateChange = useCallback((event: any) => {
      if (event.nativeEvent.state === State.BEGAN) {
        const { x, y } = event.nativeEvent;
        setCurrentStroke([{x: clamp(x, 0, CANVAS_SIZE), y: clamp(y, 0, CANVAS_SIZE)}]);
      } else if (event.nativeEvent.state === State.END) {
        if (currentStroke.length > 0) {
          const newStroke: Stroke = { points: currentStroke };
          const newStrokesList = [...strokes, newStroke];
          setStrokes(newStrokesList);
          setCurrentStroke([]);
          recognize(newStrokesList);
        }
      }
    }, [currentStroke, strokes]);

  const handleClear = () => { setStrokes([]); setCurrentStroke([]); setRecognizedKanjis([]); setIsLoading(false); };
  const handleUndo = useCallback(() => {
    setStrokes((prev) => {
      if (prev.length === 0) { recognize([]); return []; }
      const newStrokes = prev.slice(0, -1);
      recognize(newStrokes);
      return newStrokes;
    });
  }, []); 

  const isResetDisabled = isLoading || (strokes.length === 0 && currentStroke.length === 0);
  const isUndoDisabled = isLoading || strokes.length === 0;

  return (
    <View style={styles.container}>
        <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
            
            {/* Header */}
            <View style={styles.header}>
                <HeaderTorii />
                <Text style={styles.headerTitle}>Recognizer</Text>
                <Text style={styles.headerSubtitle}>Draw characters</Text>
            </View>

            <GestureHandlerRootView style={styles.contentContainer}>
                
                {/* 1. CANVAS (Washi Paper Style) */}
                <View style={styles.canvasWrapper}>
                    <PanGestureHandler onGestureEvent={onGestureEvent} onHandlerStateChange={onHandlerStateChange} minDist={1}>
                        <View style={styles.canvasContainer}>
                            <Svg width="100%" height="100%">
                                {/* Guide Lines (Dashed Sand Color) */}
                                <Path
                                    d={`M ${CANVAS_SIZE / 2} 0 L ${CANVAS_SIZE / 2} ${CANVAS_SIZE} M 0 ${CANVAS_SIZE / 2} L ${CANVAS_SIZE} ${CANVAS_SIZE / 2}`}
                                    stroke={JP_THEME.sand}
                                    strokeWidth={1}
                                    strokeDasharray="10, 10"
                                />
                                {/* User Strokes (Sumi Ink) */}
                                {strokes.map((stroke, i) => (
                                    <Path
                                        key={i}
                                        d={pointsToPath(stroke.points)}
                                        stroke={JP_THEME.ink}
                                        strokeWidth={8}
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    />
                                ))}
                                {/* Current Stroke (Wet Ink/Primary) */}
                                {currentStroke.length > 0 && (
                                    <Path
                                        d={pointsToPath(currentStroke)}
                                        stroke="#10B981"
                                        strokeWidth={8}
                                        fill="none"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        opacity={0.8}
                                    />
                                )}
                            </Svg>
                        </View>
                    </PanGestureHandler>
                </View>

                {/* 2. RESULTS AREA */}
                <View style={styles.resultsContainer}>
                    {isLoading ? (
                        <View style={styles.centerState}>
                            <ActivityIndicator size="large" color="#10B981" />
                            <Text style={styles.loadingText}>Recognizing...</Text>
                        </View>
                    ) : recognizedKanjis.length > 0 ? (
                        <KanjiCandidatesGrid
                            kanjiList={recognizedKanjis}
                            onSelectKanji={onSelectKanji}
                        />
                    ) : (
                        <View style={styles.centerState}>
                            <Ionicons name="brush-outline" size={32} color={JP_THEME.textMuted} style={{ opacity: 0.5 }} />
                            <Text style={candidateStyles.noItemsText}>Write neatly in the box above.</Text>
                        </View>
                    )}
                </View>

                {/* 3. BUTTONS (Pill Style) */}
                <View style={styles.buttonsContainer}>
                    <TouchableOpacity 
                        style={[styles.buttonBase, styles.buttonSecondary]} 
                        onPress={handleClear} 
                        disabled={isResetDisabled}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="trash-outline" size={18} color={isResetDisabled ? '#cbd5e1' : JP_THEME.accent} />
                            <Text style={[styles.buttonText, { color: isResetDisabled ? '#cbd5e1' : JP_THEME.accent }]}>Clear</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity 
                        style={[styles.buttonBase, styles.buttonSecondary]} 
                        onPress={handleUndo} 
                        disabled={isUndoDisabled}
                    >
                        <View style={styles.buttonContent}>
                            <Ionicons name="arrow-undo" size={18} color={isUndoDisabled ? '#cbd5e1' : JP_THEME.textMuted} />
                            <Text style={[styles.buttonText, { color: isUndoDisabled ? '#cbd5e1' : JP_THEME.textMuted }]}>Undo</Text>
                        </View>
                    </TouchableOpacity>
                </View>

            </GestureHandlerRootView>
        </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
      flex: 1,
      backgroundColor: colors.background // TUTAJ przywrócone oryginalne tło
  },
  safeArea: { flex: 1 },
  contentContainer: { flex: 1, paddingHorizontal: 16, alignItems: "center" },
  
  // Header
  header: { alignItems: 'center', marginBottom: 16, marginTop: 4 },
  toriiContainer: { position: 'absolute', top: -15, opacity: 0.5 },
  headerTitle: { fontSize: 20, fontWeight: '800', color: JP_THEME.ink },
  headerSubtitle: { fontSize: 12, color: JP_THEME.textMuted, fontWeight: '600', textTransform: 'uppercase' },

  // Canvas (Washi Style)
  canvasWrapper: {
    width: CANVAS_SIZE,
    height: CANVAS_SIZE,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: JP_THEME.sand,
    backgroundColor: JP_THEME.paperWhite,
    overflow: "hidden",
    shadowColor: JP_THEME.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
    marginBottom: 20,
  },
  canvasContainer: { flex: 1 },

  // Results
  resultsContainer: {
    width: '100%',
    height: 200,
    backgroundColor: 'rgba(255,255,255,0.6)', // Glassmorphism
    borderRadius: 20,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  centerState: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 8 },
  loadingText: { color: JP_THEME.textMuted, fontWeight: '600' },

  // Buttons
  buttonsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    gap: 16,
    marginBottom: 10,
  },
  buttonBase: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 24, // Pill shape
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 3, elevation: 2,
  },
  buttonSecondary: {
    backgroundColor: JP_THEME.paperWhite,
    borderWidth: 1,
    borderColor: '#f1f5f9',
  },
  buttonContent: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  buttonText: { fontSize: 14, fontWeight: "700" },
});

const candidateStyles = StyleSheet.create({
    gridContainer: { flex: 1, width: '100%' },
    sectionTitle: { 
        fontSize: 12, fontWeight: '700', color: JP_THEME.textMuted, 
        marginBottom: 10, textTransform: 'uppercase', letterSpacing: 1 
    },
    vocabGrid: { paddingBottom: 10 },
    vocabCard: {
        marginBottom: ITEM_MARGIN,
        marginRight: ITEM_MARGIN, // Handled by list logic
    },
    // Styl kafelka (Ema / Stamp)
    cardInner: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: JP_THEME.paperWhite,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#e2e8f0',
        shadowColor: JP_THEME.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 2,
    },
    vocabText: {
        fontSize: 28, 
        fontWeight: '800', 
        color: JP_THEME.ink,
    },
    noItemsText: {
        textAlign: 'center',
        fontSize: 14,
        color: JP_THEME.textMuted,
        fontStyle: 'italic',
    },
});