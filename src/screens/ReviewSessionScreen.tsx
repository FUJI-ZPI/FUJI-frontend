import React, {useCallback, useState} from 'react';
import {ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View,} from 'react-native';
import {Ionicons} from '@expo/vector-icons';
import {Card} from '../components/ui/Card';
import {Button} from '../components/ui/Button';
import KanjiCanvas from '../components/review-session/KanjiCanvas';
import {useToast} from '../hooks/use-toast';
import * as SecureStore from 'expo-secure-store';
import {useFocusEffect} from '@react-navigation/native';

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
    auxiliaryMeanings: { type: string; meaning: string }[];
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

interface CardDto {
    uuid: string;
    kanji: KanjiDetailDto;
}

export default function ReviewSessionScreen({navigation}: any) {
    const {toast} = useToast();
    const [practiceKanjiList, setPracticeKanjiList] = useState<CardDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [currentKanjiIndex, setCurrentKanjiIndex] = useState(0);
    const [sessionScore, setSessionScore] = useState(0);
    const [completedKanji, setCompletedKanji] = useState(0);

    const [showResult, setShowResult] = useState(false);
    const [lastAccuracy, setLastAccuracy] = useState(0);
    const [showCharacterHint, setShowCharacterHint] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setCurrentKanjiIndex(0);
            setSessionScore(0);
            setCompletedKanji(0);
            setShowResult(false);
            setLastAccuracy(0);
            setShowCharacterHint(false);
            fetchReviewBatch();
        }, []),
    );

    const fetchReviewBatch = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                throw new Error('Authorization token not found.');
            }
            const url = `${process.env.EXPO_PUBLIC_BACKEND_URL}/api/v1/srs/review-batch`;
            const response = await fetch(url, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            if (!response.ok) {
                throw new Error(`Server error: ${response.status}`);
            }
            const data: CardDto[] = await response.json();
            setPracticeKanjiList(data);
        } catch (e: any) {
            setError(e.message || 'Failed to fetch reviews.');
            toast({
                title: 'Error',
                description: e.message || 'Failed to fetch reviews.',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const currentCard = practiceKanjiList[currentKanjiIndex];
    const currentKanji = currentCard?.kanji;
    const totalKanji = practiceKanjiList.length;

    const handleKanjiComplete = async (accuracy: number) => {
        if (!currentCard || !currentKanji) return;

        setLastAccuracy(accuracy);
        setSessionScore(prev => prev + accuracy);
        setCompletedKanji(prev => prev + 1);

        setShowCharacterHint(true);

        if (accuracy >= 70) {
            toast({
                title: accuracy >= 90 ? 'Excellent! 🎉' : 'Good job! 👍',
                description: `Nice work! ${accuracy}% accuracy`,
                variant: 'success',
            });
        } else {
            toast({
                title: 'Incorrect. 😢',
                description: `Review the strokes. Moving next...`,
                variant: 'error',
            });
        }

        setTimeout(() => {
            nextKanji();
        }, 2500);
    };

    const nextKanji = () => {
        setShowResult(false);
        if (currentKanjiIndex < practiceKanjiList.length - 1) {
            setCurrentKanjiIndex(prev => prev + 1);
            setShowCharacterHint(false);
        } else {
            toast({
                title: 'Review Session Complete! 🎊',
                description: `Great work!`,
                variant: 'success',
            });
            navigation.goBack();
        }
    };

    if (isLoading) {
        return (
            <View style={styles.emptyContainer}>
                <ActivityIndicator size="large" color="#10B981"/>
                <Text style={styles.emptyText}>Fetching reviews...</Text>
            </View>
        );
    }

    if (error) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>Error!</Text>
                <Text style={styles.emptyText}>{error}</Text>
                <Button onPress={fetchReviewBatch}>
                    <Text style={styles.buttonTextWhite}>Try again</Text>
                </Button>
            </View>
        );
    }

    if (practiceKanjiList.length === 0 || !currentKanji) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyTitle}>No kanji to review!</Text>
                <Text style={styles.emptyText}>
                    You have no pending reviews. Great job!
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
                    <Ionicons name="arrow-back" size={20} color="#666"/>
                    <Text style={styles.headerButtonText}>Back</Text>
                </TouchableOpacity>
                <View style={styles.progressInfo}>
                    <Text style={styles.progressLabel}>Progress</Text>
                    <Text style={styles.progressValue}>
                        {Math.min(completedKanji + 1, totalKanji)} / {totalKanji}
                    </Text>
                </View>
                <View style={{width: 50}}/>
            </View>

            <Card style={styles.card}>
                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Review This Kanji</Text>
                    <TouchableOpacity
                        onPress={() => setShowCharacterHint(prev => !prev)}
                        style={styles.replayButton}>
                        <Ionicons name="bulb-outline" size={24} color="#10B981"/>
                    </TouchableOpacity>
                </View>
                <View style={styles.kanjiDisplay}>
                    <View style={styles.kanjiCharacterContainer}>
                        {showCharacterHint ? (
                            <Text style={styles.kanjiCharacter}>
                                {currentKanji.character}
                            </Text>
                        ) : (
                            <Text style={styles.kanjiPlaceholder}>?</Text>
                        )}
                    </View>
                    <Text style={styles.kanjiMeaning}>{primaryMeaning}</Text>
                </View>
            </Card>

            {showResult ? (
                <Card style={styles.resultCard}>
                    <Text style={styles.resultEmoji}>
                        {lastAccuracy >= 90 ? '🎉' : lastAccuracy >= 70 ? '👍' : '😢'}
                    </Text>
                    <Text style={styles.resultTitle}>
                        {lastAccuracy >= 90
                            ? 'Excellent!'
                            : lastAccuracy >= 70
                                ? 'Good Job!'
                                : 'Incorrect'}
                    </Text>
                    <Text style={styles.resultAccuracy}>
                        Accuracy:
                        <Text
                            style={[
                                styles.resultAccuracyValue,
                                lastAccuracy < 70 && {color: '#EF4444'},
                            ]}>
                            {lastAccuracy}%
                        </Text>
                    </Text>
                    <Text style={styles.resultMessage}>Moving to the next one...</Text>
                </Card>
            ) : (
                <KanjiCanvas
                    kanjiUuid={currentKanji.uuid}
                    isLearningSession={false}
                    targetKanji={currentKanji.character}
                    referenceStrokes={currentKanji.referenceStrokes}
                    onComplete={handleKanjiComplete}
                    showHint={showCharacterHint}
                />
            )}
            <View style={styles.bottomSpacer}/>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {flex: 1, backgroundColor: '#f2f7f5'},
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
    kanjiCharacter: {
        fontSize: 100,
        fontWeight: '600',
        color: '#10B981',
        lineHeight: 120,
        textAlign: 'center',
    },
    kanjiPlaceholder: {
        fontSize: 100,
        fontWeight: '600',
        color: '#E5E7EB',
        lineHeight: 120,
        textAlign: 'center',
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
    danger: {
        color: '#EF4444',
    },
});