import React, {ComponentType, useEffect, useState} from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {DrawerContentScrollView} from "@react-navigation/drawer";
import {Ionicons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
import {useSafeAreaInsets} from "react-native-safe-area-context";
import {loadUser, User} from "../../utils/user";

const LOGO_IMAGE = require('../../../assets/fuji-logo-kanji.jpeg');

export const iconMap: Record<string, string> = {
    Dashboard: "home-outline",
    Practice: "pencil-sharp",
    Radicals: "grid-outline",
    Kanji: "language-outline",
    Vocabulary: "book-outline",
    Chat: "chatbubble-ellipses-outline",
    Leaderboard: "trophy-outline",
    Profile: "person-outline",
    Settings: "settings-outline",
};

export interface HeaderProps {
    navigation: any;
}

export interface NavItem {
    id: string;
    label: string;
    icon: string;
    component: ScreenComponentType;
}

export type ScreenComponentType = ComponentType<any>;

export interface DrawerContentProps {
    navigation: any;
    state: any;
    navItems: NavItem[];
}

export const DrawerContent = ({navigation, state, navItems}: DrawerContentProps) => {
    const {t} = useTranslation();
    const insets = useSafeAreaInsets();

    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        async function init() {
            const u = await loadUser();
            if (u) {
                setUser(u);
            }
        }

        init();
    }, []);

    return (
        <View style={styles.container}>
            <DrawerContentScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >

                <View style={[styles.headerSection, {paddingTop: insets.top + 20}]}>
                    <View style={styles.brandContainer}>
                        <Image
                            source={LOGO_IMAGE}
                            style={styles.logoImage}
                            accessibilityLabel={t('drawer.app_subtitle')}
                        />
                        <View>
                            <Text style={styles.appTitle}>{t('drawer.app_title')}</Text>
                            <Text style={styles.appSubtitle}>{t('drawer.app_subtitle')}</Text>
                        </View>
                    </View>

                    <TouchableOpacity style={styles.userCard} onPress={() => navigation.navigate("Profile")}>
                        {user?.photo ? (
                            <Image source={{uri: user.photo}} style={styles.userAvatar}/>
                        ) : (
                            <View style={[styles.userAvatar, styles.userAvatarPlaceholder]}>
                                <Ionicons name="person" size={24} color="#368A59"/>
                            </View>
                        )}
                        <View style={styles.userInfo}>
                            <Text style={styles.userName} numberOfLines={1}>{user?.name || "Guest"}</Text>
                            <Text style={styles.userEditLabel}>{t('common.edit_profile', 'View Profile')}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#C6D3C7"/>
                    </TouchableOpacity>
                </View>

                <View style={styles.navSection}>
                    {navItems.map((item) => {
                        const routeName = item.id;
                        const isFocused = state.routeNames[state.index] === routeName;
                        const iconName = iconMap[routeName] || "help-circle-outline";

                        return (
                            <TouchableOpacity
                                key={item.id}
                                style={[styles.navItem, isFocused && styles.navItemActive]}
                                onPress={() => navigation.navigate(routeName)}
                            >
                                <Ionicons
                                    name={iconName as any}
                                    size={22}
                                    style={[styles.navIcon, isFocused && styles.navIconActive]}
                                />
                                <Text style={[styles.navLabel, isFocused && styles.navLabelActive]}>
                                    {item.label}
                                </Text>
                                {isFocused && <View style={styles.activeIndicator}/>}
                            </TouchableOpacity>
                        );
                    })}
                </View>

            </DrawerContentScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#FFFFFF",
    },
    scrollContent: {
        paddingTop: 0,
    },
    headerSection: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        backgroundColor: "#FFFFFF",
        borderBottomWidth: 1,
        borderBottomColor: "#F3F4F6",
    },
    brandContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 24,
    },
    logoImage: {
        width: 44,
        height: 44,
        borderRadius: 10,
        marginRight: 12,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    appTitle: {
        fontSize: 20,
        fontWeight: "800",
        color: "#1F2937",
        letterSpacing: 0.5,
    },
    appSubtitle: {
        fontSize: 12,
        color: "#6B7280",
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    userCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#F9FAFB",
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: "#F3F4F6",
    },
    userAvatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 12,
    },
    userAvatarPlaceholder: {
        backgroundColor: "#EDEFEE",
        justifyContent: "center",
        alignItems: "center",
    },
    userInfo: {
        flex: 1,
    },
    userName: {
        fontSize: 15,
        fontWeight: "600",
        color: "#111827",
    },
    userEditLabel: {
        fontSize: 11,
        color: "#9CA3AF",
    },
    navSection: {
        paddingTop: 20,
        paddingHorizontal: 16,
    },
    navItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderRadius: 12,
        marginBottom: 6,
    },
    navItemActive: {
        backgroundColor: "#ECFDF5",
    },
    navIcon: {
        marginRight: 14,
        color: "#6B7280",
    },
    navIconActive: {
        color: "#059669",
    },
    navLabel: {
        fontSize: 15,
        fontWeight: "500",
        color: "#4B5563",
        flex: 1,
    },
    navLabelActive: {
        color: "#059669",
        fontWeight: "700",
    },
    activeIndicator: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: "#059669",
    },
    footer: {
        paddingHorizontal: 24,
        paddingTop: 24,
        borderTopWidth: 1,
        borderTopColor: "#F3F4F6",
        alignItems: 'center',
        backgroundColor: "#FFFFFF",
    },
    logoutButton: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#FEF2F2",
        paddingVertical: 12,
        paddingHorizontal: 32,
        borderRadius: 30,
        width: '100%',
        maxWidth: 250,
        shadowColor: "#D32F2F",
        shadowOffset: {width: 0, height: 2},
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
    },
    logoutText: {
        color: "#D32F2F",
        fontWeight: "600",
        fontSize: 15,
    },
    versionText: {
        marginTop: 16,
        fontSize: 11,
        color: "#D1D5DB",
    }
});