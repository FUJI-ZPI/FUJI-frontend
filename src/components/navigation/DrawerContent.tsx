import React, {ComponentType, useEffect, useState} from "react";
import {Image, StyleSheet, Text, TouchableOpacity, View} from "react-native";
import {DrawerContentScrollView} from "@react-navigation/drawer";
import {Ionicons} from "@expo/vector-icons";
import {useTranslation} from "react-i18next";
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

export const DrawerContent = ({ navigation, state, navItems}: DrawerContentProps) => {
  const { t } = useTranslation();

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
    <DrawerContentScrollView contentContainerStyle={styles.container}>
      
      <View>
        <View style={styles.header}>
          <Image 
            source={LOGO_IMAGE} 
            style={styles.logoPlaceholder}
            accessibilityLabel={t('drawer.app_subtitle')}
          />
          <View>
            <Text style={styles.title}>{t('drawer.app_title')}</Text>
            <Text style={styles.subtitle}>{t('drawer.app_subtitle')}</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.user} onPress={() => navigation.navigate("Profile")}>
          <Image source={{ uri: user?.photo }} style={styles.avatar} />
          <View>
            <Text style={styles.username}>{user?.name}</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.navItems}>
          {navItems
          .map((item) => {
            const routeName = item.id;
            const isFocused = state.routeNames[state.index] === routeName;
            const iconName = iconMap[routeName] || "help-circle-outline";

            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.button, isFocused && styles.activeButton]}
                onPress={() => navigation.navigate(routeName)}
              >
                <Ionicons 
                  name={iconName as any} 
                  size={20} 
                  style={[styles.icon, isFocused && styles.activeIcon]} 
                />
                <Text style={[styles.label, isFocused && styles.activeLabel]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* <View style={styles.footer}>
        <TouchableOpacity style={styles.button} onPress={handleLogoutPress}>
          <Ionicons name="log-out-outline" size={20} style={styles.icon} />
          <Text style={[styles.label, { color: "#C92C2C" }]}>{t('drawer.logout')}</Text>
        </TouchableOpacity>
      </View> */}

    </DrawerContentScrollView>
  );
};

const styles = StyleSheet.create({
    container: { flexGrow: 1, paddingVertical: 20, justifyContent: "space-between", backgroundColor: "rgb(245, 246, 247)" },
    header: {
      flexDirection: "row",
      alignItems: "center",
      padding: 24,
      borderBottomWidth: 1,
      borderColor: "rgb(198, 211, 199)",
      backgroundColor: "#ebf4f0",
    },
    logoPlaceholder: { width: 48, height: 48, borderRadius: 12, marginRight: 12, backgroundColor: '#fff', borderWidth: 1, borderColor: 'lightgray' },
    title: { fontSize: 20, fontWeight: "700", color: "rgb(54,138,89)" },
    subtitle: { fontSize: 12, color: "rgb(107, 114, 128)" }, 
    user: {
      flexDirection: "row",
      alignItems: "center",
      padding: 24,
      borderBottomWidth: 1,
      borderColor: "rgb(198, 211, 199)",
    },
    avatar: {
      fontSize: 32,
      marginRight: 12,
      width: 48,
      height: 48,
      textAlignVertical: 'center',
      backgroundColor: "rgb(54, 138, 89, 0.2)",
      borderWidth: 0.5,
      borderColor: 'lightgray',
      borderRadius: 24,
      textAlign: "center",
      lineHeight: 48,
    },
    username: { fontSize: 18, fontWeight: "500", color: "rgb(17, 24, 39)" },
    userLevel: { fontSize: 12, color: "rgb(107, 114, 128)" },
    navItems: { flex: 1, paddingHorizontal: 16, marginTop: 12 },
    button: {
      flexDirection: "row",
      alignItems: "center",
      paddingVertical: 12,
      paddingHorizontal: 8,
      borderRadius: 8,
      marginVertical: 4,
    },
    activeButton: {
      backgroundColor: "rgba(54,138,89,0.1)",
      borderWidth: 1,
      borderColor: "rgba(54,138,89,0.2)",
      shadowColor: "#000",
      shadowOpacity: 0.05,
      shadowOffset: { width: 0, height: 1 },
      shadowRadius: 2,
    },
    icon: { marginRight: 8, color: "rgb(107,114,128)" },
    activeIcon: { color: "rgb(54,138,89)", transform: [{ scale: 1.05 }] },
    label: { fontSize: 16, color: "rgb(107,114,128)" },
    activeLabel: { color: "rgb(54,138,89)", fontWeight: "600" },
    footer: {
      padding: 16,
      borderTopWidth: 1,
      borderColor: "rgb(198,211,199)",
      backgroundColor: "#ebf4f0",
    },
  });