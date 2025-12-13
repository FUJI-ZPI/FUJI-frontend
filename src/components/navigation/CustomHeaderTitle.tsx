import React from 'react';
import {Image, StyleSheet, Text, TouchableOpacity} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {DrawerNavigationProp} from '@react-navigation/drawer';
import {colors, themeStyles} from '../../theme/styles';

type AppDrawerNavigatorParamList = {
    Dashboard: undefined;
};
type DashboardNavigationProp = DrawerNavigationProp<AppDrawerNavigatorParamList, 'Dashboard'>;

export const CustomHeaderTitle: React.FC = () => {
    const navigation = useNavigation<DashboardNavigationProp>();

    const handlePress = () => {
        navigation.navigate('Dashboard');
    };

    return (
        <TouchableOpacity onPress={handlePress} style={styles.container} activeOpacity={1}>
            <Image
                source={require('../../../assets/fuji-logo-kanji.jpeg')}
                style={styles.logo}
            />
            <Text style={styles.title}>
                FUJI
            </Text>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        ...themeStyles.gap8,
    },
    logo: {
        width: 30,
        height: 30,
        resizeMode: 'contain',
        borderRadius: 24,
        overflow: 'hidden',
    },
    title: {
        //  fontFamily: 'ZenDots-Regular',
        fontSize: 30,
        fontWeight: 'bold',
        color: colors.text,
    }
});