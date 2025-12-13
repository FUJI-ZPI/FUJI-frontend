import React from 'react';
import {StyleSheet, Text, View} from 'react-native';
import {colors} from '../../theme/styles'

interface BadgeProps {
    children: React.ReactNode;
    variant: 'primary' | 'secondary' | 'warning';
}


export const Badge: React.FC<BadgeProps> = ({children, variant}) => {
    let badgeStyles: any = styles.badgeBase;
    let textStyles: any = styles.textBase;

    if (variant === 'primary') {
        badgeStyles = {...badgeStyles, backgroundColor: colors.primary};
        textStyles = {...textStyles, color: '#fff'};
    } else if (variant === 'secondary') {
        badgeStyles = {
            ...badgeStyles,
            backgroundColor: colors.lightBackground,
            borderColor: colors.primary,
            borderWidth: 1
        };
        textStyles = {...textStyles, color: colors.primary};
    } else if (variant === 'warning') {
        badgeStyles = {
            ...badgeStyles,
            backgroundColor: colors.warning + '20',
            borderColor: colors.warning,
            borderWidth: 1
        };
        textStyles = {...textStyles, color: colors.warning};
    }

    return (
        <View style={badgeStyles}>
            <Text style={textStyles}>{children}</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    badgeBase: {
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 16,
        alignSelf: 'flex-start',
    },
    textBase: {
        fontSize: 11,
        fontWeight: '600',
    },
});