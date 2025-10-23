import React from 'react';
import {ActivityIndicator, StyleSheet, Text, TextStyle, TouchableOpacity, ViewStyle} from 'react-native';

type ButtonVariant = 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
type ButtonSize = 'default' | 'sm' | 'lg' | 'icon';

interface ButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    disabled?: boolean;
    loading?: boolean;
    style?: ViewStyle;
    textStyle?: TextStyle;
}

export const Button: React.FC<ButtonProps> = ({
                                                  children,
                                                  onPress,
                                                  variant = 'default',
                                                  size = 'default',
                                                  disabled = false,
                                                  loading = false,
                                                  style,
                                                  textStyle,
                                              }) => {
    const buttonStyles = [
        styles.base,
        styles[`variant_${variant}`],
        styles[`size_${size}`],
        disabled && styles.disabled,
        style,
    ];

    const textStyles = [
        styles.text,
        styles[`text_${variant}`],
        styles[`textSize_${size}`],
        disabled && styles.textDisabled,
        textStyle,
    ];

    return (
        <TouchableOpacity
            style={buttonStyles}
            onPress={onPress}
            disabled={disabled || loading}
            activeOpacity={0.7}
        >
            {loading ? (
                <ActivityIndicator color={variant === 'default' ? '#fff' : '#4A90E2'}/>
            ) : (
                <Text style={textStyles}>{children}</Text>
            )}
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    base: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 8,
        paddingHorizontal: 16,
        paddingVertical: 10,
    },
    // Variants
    variant_default: {
        backgroundColor: '#4A90E2',
    },
    variant_destructive: {
        backgroundColor: '#EF4444',
    },
    variant_outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    variant_secondary: {
        backgroundColor: '#F3F4F6',
    },
    variant_ghost: {
        backgroundColor: 'transparent',
    },
    variant_link: {
        backgroundColor: 'transparent',
    },
    // Sizes
    size_default: {
        height: 44,
        paddingHorizontal: 16,
    },
    size_sm: {
        height: 36,
        paddingHorizontal: 12,
    },
    size_lg: {
        height: 52,
        paddingHorizontal: 24,
    },
    size_icon: {
        height: 44,
        width: 44,
        paddingHorizontal: 0,
    },
    disabled: {
        opacity: 0.5,
    },
    // Text styles
    text: {
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },
    text_default: {
        color: '#FFFFFF',
    },
    text_destructive: {
        color: '#FFFFFF',
    },
    text_outline: {
        color: '#374151',
    },
    text_secondary: {
        color: '#374151',
    },
    text_ghost: {
        color: '#374151',
    },
    text_link: {
        color: '#4A90E2',
        textDecorationLine: 'underline',
    },
    textSize_default: {
        fontSize: 14,
    },
    textSize_sm: {
        fontSize: 13,
    },
    textSize_lg: {
        fontSize: 16,
    },
    textSize_icon: {
        fontSize: 14,
    },
    textDisabled: {
        opacity: 0.5,
    },
});

