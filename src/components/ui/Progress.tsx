import React from 'react';
import {StyleSheet, View, ViewStyle} from 'react-native';

interface ProgressProps {
    value: number; // 0-100
    style?: ViewStyle;
    height?: number;
    backgroundColor?: string;
    progressColor?: string;
}

export const Progress: React.FC<ProgressProps> = ({
                                                      value,
                                                      style,
                                                      height = 8,
                                                      backgroundColor = '#E5E7EB',
                                                      progressColor = '#4A90E2',
                                                  }) => {
    const clampedValue = Math.min(Math.max(value, 0), 100);

    return (
        <View style={[styles.container, {height, backgroundColor}, style]}>
            <View
                style={[
                    styles.progress,
                    {
                        width: `${clampedValue}%`,
                        backgroundColor: progressColor,
                    },
                ]}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        borderRadius: 999,
        overflow: 'hidden',
    },
    progress: {
        height: '100%',
        borderRadius: 999,
    },
});

