import React, {useEffect, useRef, useState} from 'react';
import {PanResponder, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Svg, {G, Line, Path} from 'react-native-svg';
import {Card} from '../ui/Card';
import {Button} from '../ui/Button';
import {Ionicons} from '@expo/vector-icons';
import {useToast} from '../../hooks/use-toast';

interface KanjiCanvasProps {
    targetKanji: string;
    onComplete: (accuracy: number) => void;
    onSkip: () => void;
}

interface StrokePoint {
    x: number;
    y: number;
}

interface Stroke {
    points: StrokePoint[];
    tolerance: number;
}

type PracticeMode = 'guided' | 'free';

// Stroke order data for common kanji
const strokeOrders: { [key: string]: Stroke[] } = {
    '水': [
        {points: [{x: 150, y: 100}, {x: 150, y: 200}], tolerance: 25},
        {points: [{x: 100, y: 120}, {x: 200, y: 120}], tolerance: 25},
        {points: [{x: 80, y: 180}, {x: 120, y: 200}], tolerance: 30},
        {points: [{x: 180, y: 200}, {x: 220, y: 180}], tolerance: 30},
    ],
    '火': [
        {points: [{x: 100, y: 80}, {x: 150, y: 120}], tolerance: 25},
        {points: [{x: 200, y: 80}, {x: 150, y: 120}], tolerance: 25},
        {points: [{x: 150, y: 120}, {x: 150, y: 200}], tolerance: 25},
        {points: [{x: 120, y: 180}, {x: 180, y: 180}], tolerance: 25},
    ],
    '木': [
        {points: [{x: 150, y: 80}, {x: 150, y: 200}], tolerance: 25},
        {points: [{x: 100, y: 140}, {x: 200, y: 140}], tolerance: 25},
        {points: [{x: 100, y: 180}, {x: 140, y: 160}], tolerance: 30},
        {points: [{x: 200, y: 180}, {x: 160, y: 160}], tolerance: 30},
    ],
    default: [
        {points: [{x: 150, y: 100}, {x: 150, y: 200}], tolerance: 25},
        {points: [{x: 100, y: 150}, {x: 200, y: 150}], tolerance: 25},
    ]
};

const CANVAS_SIZE = 300;

const KanjiCanvas: React.FC<KanjiCanvasProps> = ({targetKanji, onComplete, onSkip}) => {
    const {toast} = useToast();
    const [paths, setPaths] = useState<string[]>([]);
    const [currentPath, setCurrentPath] = useState<StrokePoint[]>([]);
    const [practiceMode, setPracticeMode] = useState<PracticeMode>('free');
    const [currentStroke, setCurrentStroke] = useState(0);
    const [completedStrokes, setCompletedStrokes] = useState<boolean[]>([]);
    const [hasDrawn, setHasDrawn] = useState(false);

    const strokes = strokeOrders[targetKanji] || strokeOrders.default;

    // Use refs to hold current values for panResponder
    const pathsRef = useRef<string[]>([]);
    const practiceModeRef = useRef<PracticeMode>('free');
    const currentStrokeRef = useRef(0);
    const currentPathRef = useRef<StrokePoint[]>([]);

    // Update refs when state changes
    useEffect(() => {
        pathsRef.current = paths;
    }, [paths]);

    useEffect(() => {
        practiceModeRef.current = practiceMode;
    }, [practiceMode]);

    useEffect(() => {
        currentStrokeRef.current = currentStroke;
    }, [currentStroke]);

    useEffect(() => {
        console.log('Kanji changed to:', targetKanji);
        setCompletedStrokes(new Array(strokes.length).fill(false));
        setCurrentStroke(0);
        setPaths([]);
        setCurrentPath([]);
        setHasDrawn(false);
    }, [targetKanji]);

    useEffect(() => {
        console.log('Practice mode changed to:', practiceMode);
        // Don't reset paths when changing mode, just reset validation state
        setCurrentStroke(0);
        setCompletedStrokes(new Array(strokes.length).fill(false));
    }, [practiceMode]);

    const calculateDistance = (p1: StrokePoint, p2: StrokePoint) => {
        return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
    };

    const isStrokeCorrect = (userStroke: StrokePoint[], targetStroke: Stroke) => {
        if (userStroke.length < 2) return false;

        const startDistance = calculateDistance(userStroke[0], targetStroke.points[0]);
        const endDistance = calculateDistance(
            userStroke[userStroke.length - 1],
            targetStroke.points[targetStroke.points.length - 1]
        );

        return startDistance < targetStroke.tolerance && endDistance < targetStroke.tolerance;
    };

    const pointsToPath = (points: StrokePoint[]): string => {
        if (points.length === 0) return '';
        let path = `M ${points[0].x} ${points[0].y}`;
        for (let i = 1; i < points.length; i++) {
            path += ` L ${points[i].x} ${points[i].y}`;
        }
        return path;
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: (evt) => {
                const {locationX, locationY} = evt.nativeEvent;
                const newPath = [{x: locationX, y: locationY}];
                currentPathRef.current = newPath;
                setCurrentPath(newPath);
                setHasDrawn(true);
            },
            onPanResponderMove: (evt) => {
                const {locationX, locationY} = evt.nativeEvent;
                const newPath = [...currentPathRef.current, {x: locationX, y: locationY}];
                currentPathRef.current = newPath;
                setCurrentPath(newPath);
            },
            onPanResponderRelease: () => {
                const drawnPath = currentPathRef.current;
                console.log('Release - drawn path length:', drawnPath.length);

                if (drawnPath.length > 0) {
                    const pathString = pointsToPath(drawnPath);
                    console.log('Saving path:', pathString);
                    console.log('Current paths count before save:', pathsRef.current.length);

                    if (practiceModeRef.current === 'guided') {
                        const targetStroke = strokes[currentStrokeRef.current];

                        if (isStrokeCorrect(drawnPath, targetStroke)) {
                            // Save path if correct in guided mode
                            setPaths(prev => {
                                const newPaths = [...prev, pathString];
                                console.log('Correct stroke! New paths count:', newPaths.length);
                                return newPaths;
                            });

                            setCompletedStrokes(prev => {
                                const newCompleted = [...prev];
                                newCompleted[currentStrokeRef.current] = true;
                                return newCompleted;
                            });

                            if (currentStrokeRef.current < strokes.length - 1) {
                                setCurrentStroke(prev => prev + 1);
                                toast({title: 'Correct stroke! ✓', variant: 'success'});
                            } else {
                                toast({
                                    title: 'Excellent! 🎉',
                                    description: 'All strokes completed!',
                                    variant: 'success'
                                });
                                setTimeout(() => onComplete(95), 1000);
                            }
                        } else {
                            // Still save the path even if incorrect
                            setPaths(prev => {
                                const newPaths = [...prev, pathString];
                                console.log('Incorrect stroke! Still saving. New paths count:', newPaths.length);
                                return newPaths;
                            });
                            toast({title: 'Try again!', description: 'Follow the stroke order', variant: 'error'});
                        }
                    } else {
                        // Free mode - always save the path
                        setPaths(prev => {
                            const newPaths = [...prev, pathString];
                            console.log('Free mode! New paths count:', newPaths.length);
                            return newPaths;
                        });
                    }
                }

                currentPathRef.current = [];
                setCurrentPath([]);
            },
        })
    ).current;

    const resetCanvas = () => {
        setPaths([]);
        setCurrentPath([]);
        setCurrentStroke(0);
        setCompletedStrokes(new Array(strokes.length).fill(false));
        setHasDrawn(false);
        pathsRef.current = [];
        currentPathRef.current = [];
    };

    const checkDrawing = () => {
        if (practiceMode === 'free') {
            // Placeholder: Random accuracy until proper stroke recognition is implemented.
            // This should be replaced with real stroke analysis in the future.
            const accuracy = Math.floor(Math.random() * 30) + 70;
            onComplete(accuracy);
        }
    };

    return (
        <Card style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.instructionText}>
                    {practiceMode === 'guided'
                        ? `Stroke ${currentStroke + 1}/${strokes.length}`
                        : 'Draw the kanji'}
                </Text>

                {/* Mode Toggle */}
                <View style={styles.modeToggle}>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            practiceMode === 'guided' && styles.modeButtonActive,
                        ]}
                        onPress={() => setPracticeMode('guided')}
                    >
                        <Ionicons
                            name="navigate-circle-outline"
                            size={16}
                            color={practiceMode === 'guided' ? '#fff' : '#666'}
                        />
                        <Text
                            style={[
                                styles.modeButtonText,
                                practiceMode === 'guided' && styles.modeButtonTextActive,
                            ]}
                        >
                            Guided
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.modeButton,
                            practiceMode === 'free' && styles.modeButtonActive,
                        ]}
                        onPress={() => setPracticeMode('free')}
                    >
                        <Ionicons
                            name="brush-outline"
                            size={16}
                            color={practiceMode === 'free' ? '#fff' : '#666'}
                        />
                        <Text
                            style={[
                                styles.modeButtonText,
                                practiceMode === 'free' && styles.modeButtonTextActive,
                            ]}
                        >
                            Free
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Progress dots */}
                {practiceMode === 'guided' && (
                    <View style={styles.progressDots}>
                        {strokes.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    completedStrokes[index] && styles.dotCompleted,
                                    index === currentStroke && styles.dotCurrent,
                                ]}
                            />
                        ))}
                    </View>
                )}
            </View>

            {/* Canvas */}
            <View style={styles.canvasContainer} {...panResponder.panHandlers}>
                <Svg width={CANVAS_SIZE} height={CANVAS_SIZE} style={styles.canvas}>
                    {/* Grid lines */}
                    <G stroke="#E5E7EB" strokeWidth="1">
                        <Line x1="150" y1="0" x2="150" y2="300"/>
                        <Line x1="0" y1="150" x2="300" y2="150"/>
                    </G>

                    {/* Drawn paths */}
                    {paths.map((path, index) => (
                        <Path
                            key={`path-${index}`}
                            d={path}
                            stroke="#1E293B"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            fill="none"
                        />
                    ))}

                    {/* Current path being drawn */}
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

            {/* Action buttons */}
            <View style={styles.actions}>
                <Button variant="outline" size="sm" onPress={resetCanvas}>
                    <View style={styles.buttonContent}>
                        <Ionicons name="reload" size={16} color="#666"/>
                        <Text style={styles.buttonText}>Reset</Text>
                    </View>
                </Button>

                <Button variant="outline" size="sm" onPress={onSkip}>
                    <View style={styles.buttonContent}>
                        <Ionicons name="close" size={16} color="#666"/>
                        <Text style={styles.buttonText}>Skip</Text>
                    </View>
                </Button>

                {practiceMode === 'free' && hasDrawn && (
                    <Button size="sm" onPress={checkDrawing}>
                        <View style={styles.buttonContent}>
                            <Ionicons name="checkmark" size={16} color="#fff"/>
                            <Text style={[styles.buttonText, {color: '#fff'}]}>Check</Text>
                        </View>
                    </Button>
                )}

                {practiceMode === 'guided' && currentStroke >= strokes.length && (
                    <Button size="sm" onPress={() => onComplete(95)}>
                        <View style={styles.buttonContent}>
                            <Ionicons name="checkmark-circle" size={16} color="#fff"/>
                            <Text style={[styles.buttonText, {color: '#fff'}]}>Complete</Text>
                        </View>
                    </Button>
                )}
            </View>
        </Card>
    );
};

const styles = StyleSheet.create({
    container: {
        padding: 16,
    },
    header: {
        alignItems: 'center',
        marginBottom: 16,
    },
    kanjiText: {
        fontSize: 48,
        fontWeight: 'bold',
        color: '#4A90E2',
        marginBottom: 8,
    },
    instructionText: {
        fontSize: 14,
        color: '#666',
        marginBottom: 12,
    },
    modeToggle: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 12,
    },
    modeButton: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#fff',
    },
    modeButtonActive: {
        backgroundColor: '#10B981',
        borderColor: '#10B981',
    },
    modeButtonText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '600',
    },
    modeButtonTextActive: {
        color: '#fff',
    },
    progressDots: {
        flexDirection: 'row',
        gap: 8,
        marginTop: 8,
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#D1D5DB',
    },
    dotCompleted: {
        backgroundColor: '#22C55E',
    },
    dotCurrent: {
        backgroundColor: '#10B981',
    },
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
    canvas: {
        backgroundColor: '#fff',
    },
    actions: {
        flexDirection: 'row',
        justifyContent: 'center',
        gap: 12,
    },
    buttonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    buttonText: {
        fontSize: 14,
        color: '#666',
    },
});

export default KanjiCanvas;

