import {useEffect, useState} from 'react';
import {Alert} from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type EntityType = 'radical' | 'kanji' | 'vocabulary';

export interface EntityItem {
    uuid: string;
    character?: string;
    characters?: string;
}

interface UseEntityListConfig {
    entityType: EntityType;
    level: number;
    itemsPerPage: number;
}

interface UseEntityListResult<T extends EntityItem> {
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    items: T[];
    displayedItems: T[];
    hasMore: boolean;
    loadMore: () => void;
    refetch: () => void;
}

const API_ENDPOINTS: Record<EntityType, string> = {
    radical: '/api/v1/radical/level',
    kanji: '/api/v1/kanji/level',
    vocabulary: '/api/v1/vocabulary',
};

export function useEntityList<T extends EntityItem>({
                                                        entityType,
                                                        level,
                                                        itemsPerPage,
                                                    }: UseEntityListConfig): UseEntityListResult<T> {
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);
    const [items, setItems] = useState<T[]>([]);
    const [error, setError] = useState<string | null>(null);
    const [displayedCount, setDisplayedCount] = useState(itemsPerPage);

    const fetchEntityList = async () => {
        setLoading(true);
        setError(null);
        try {
            const token = await SecureStore.getItemAsync('accessToken');
            if (!token) {
                throw new Error('No authorization token. Please log in again.');
            }

            const headers = {
                Authorization: `Bearer ${token}`,
            };

            const endpoint = API_ENDPOINTS[entityType];
            const res = await fetch(
                `${process.env.EXPO_PUBLIC_BACKEND_URL}${endpoint}/${level}`,
                {headers}
            );

            if (!res.ok) {
                if (res.status === 401 || res.status === 403) {
                    throw new Error('Authorization error. Please try logging in again.');
                }
                throw new Error(`Server error: ${res.status}`);
            }

            const data: T[] = await res.json();
            setItems(data);
            setDisplayedCount(itemsPerPage);
        } catch (e: any) {
            console.error(`Failed to fetch ${entityType} list:`, e);
            setError(e.message || 'An unknown error occurred.');
            Alert.alert('Error', e.message || 'Unable to download data.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEntityList();
    }, [level, entityType]);

    const loadMore = () => {
        if (displayedCount < items.length && !loadingMore) {
            setLoadingMore(true);
            // Symulacja krótkiego opóźnienia dla lepszego UX
            setTimeout(() => {
                setDisplayedCount(prev => Math.min(prev + itemsPerPage, items.length));
                setLoadingMore(false);
            }, 300);
        }
    };

    const displayedItems = items.slice(0, displayedCount);
    const hasMore = displayedCount < items.length;

    return {
        loading,
        loadingMore,
        error,
        items,
        displayedItems,
        hasMore,
        loadMore,
        refetch: fetchEntityList,
    };
}

