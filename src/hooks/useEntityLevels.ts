import {useEffect, useState} from 'react';

export type EntityType = 'radical' | 'kanji' | 'vocabulary';

export interface LevelStyleConfig {
    text: string;
    color: string;
    background: string;
    borderColor: string;
}

interface UseEntityLevelsConfig {
    totalLevels: number;
    levelsPerLoad: number;
    getLevelStyle: (level: number) => LevelStyleConfig;
}

interface UseEntityLevelsResult {
    displayedLevels: number[];
    hasMore: boolean;
    loadingMore: boolean;
    loadMore: () => void;
}

export function useEntityLevels({
                                    totalLevels,
                                    levelsPerLoad,
                                    getLevelStyle,
                                }: UseEntityLevelsConfig): UseEntityLevelsResult {
    const [displayedCount, setDisplayedCount] = useState(levelsPerLoad);
    const [loadingMore, setLoadingMore] = useState(false);

    // Reset when config changes
    useEffect(() => {
        setDisplayedCount(levelsPerLoad);
    }, [totalLevels, levelsPerLoad]);

    const loadMore = () => {
        if (displayedCount < totalLevels && !loadingMore) {
            setLoadingMore(true);
            setTimeout(() => {
                setDisplayedCount(prev => Math.min(prev + levelsPerLoad, totalLevels));
                setLoadingMore(false);
            }, 300);
        }
    };

    const displayedLevels = Array.from(
        {length: Math.min(displayedCount, totalLevels)},
        (_, i) => i + 1
    );

    const hasMore = displayedCount < totalLevels;

    return {
        displayedLevels,
        hasMore,
        loadingMore,
        loadMore,
    };
}

