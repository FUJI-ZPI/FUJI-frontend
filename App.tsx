import React, {useEffect, useState} from "react";
import {NavigationContainer} from "@react-navigation/native";
import {createNativeStackNavigator} from "@react-navigation/native-stack";
import {createDrawerNavigator} from "@react-navigation/drawer";
import {StyleSheet} from "react-native";
import {DrawerContent, NavItem, ScreenComponentType} from "./src/components/navigation/DrawerContent";
import {DashboardScreen} from "./src/screens/DashboardScreen";
import {PlaceholderScreen} from "./src/screens/PlaceholderScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import LoginScreen from "./src/screens/LoginScreen";
import ToastProvider from "./src/providers/ToastProvider";
import "./src/i18n/i18n";
import {useTranslation} from "react-i18next";
import * as SecureStore from "expo-secure-store";
import {UserProvider} from "./src/context/UserContex";
import KanjiLevelsScreen from "./src/screens/KanjiLevelScreen";
import ChatbotScreen from "./src/screens/ChatbotScreen";
import SettingsCard from "./src/screens/SettingsScreen";
import KanjiMountainPage from "./src/screens/KanjiMountainScreen";
import PracticeScreen from "./src/screens/PracticeScreen";

const Stack = createNativeStackNavigator();

const Drawer = createDrawerNavigator();

function AppDrawer({ onLogout }: { onLogout: () => void }) {
  const { t } = useTranslation();
    
  const navItems: NavItem[] = [
    { id: "Dashboard", label: t("nav.dashboard"), icon: "home-outline", component: DashboardScreen as ScreenComponentType },
      {
          id: "Practice",
          label: t("nav.practice"),
          icon: "pencil-sharp",
          component: PracticeScreen as ScreenComponentType
      },
    { id: "Vocabulary", label: t("nav.vocabulary"), icon: "book-outline", component: KanjiLevelsScreen as ScreenComponentType },
    { id: "Chat", label: t("nav.chat"), icon: "chatbubble-ellipses-outline", component: ChatbotScreen as ScreenComponentType },
    { id: "Leaderboard", label: t("nav.leaderboard"), icon: "trophy-outline", component: PlaceholderScreen as ScreenComponentType },
    { id: "Profile", label: t("nav.profile"), icon: "person-outline", component: ProfileScreen as ScreenComponentType },
    { id: "Settings", label: t("nav.settings"), icon: "settings-outline", component: SettingsCard as ScreenComponentType },
    { id: "Mountain", label: 'Mountain', icon: "mountain-outline", component: KanjiMountainPage as ScreenComponentType },
  ];

  return (
    <Drawer.Navigator
      drawerContent={(props) => (
        <DrawerContent {...props} navItems={navItems} onLogout={onLogout} />
    )}
      screenOptions={{
        headerShown: true,
        headerTitle: "",
      }}
    >
      {navItems.map((item: NavItem) => (
        <Drawer.Screen
          key={item.id}
          name={item.id}
          component={item.component}
        />
      ))}
    </Drawer.Navigator>
  );
}

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogout = async () => {
    await SecureStore.deleteItemAsync("accessToken");
    await SecureStore.deleteItemAsync("refreshToken");
    setIsAuthenticated(false);
  };

useEffect(() => {
  const checkAuth = async () => {
    const access = await SecureStore.getItemAsync('accessToken');
    const refresh = await SecureStore.getItemAsync('refreshToken');

    if (access) {
      setIsAuthenticated(true);
    } else if (refresh) {
      try {
        const res = await fetch(`${process.env.EXPO_PUBLIC_BACKEND_URL}/api/auth/v1/refresh`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: refresh }),
        });

        if (res.ok) {
          const data = await res.json();
          await SecureStore.setItemAsync('accessToken', data.access);
          await SecureStore.setItemAsync('refreshToken', data.refresh);
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      }
    } else {
      setIsAuthenticated(false);
    }
  };

  checkAuth();
}, []);


  return (
    <UserProvider>
      <ToastProvider>
        <NavigationContainer>
          <Stack.Navigator screenOptions={{ headerShown: false }}>
            {!isAuthenticated ? (
              <Stack.Screen name="Login">
                {(props) => (
                  <LoginScreen {...props} onLogin={() => setIsAuthenticated(true)} />
                )}
              </Stack.Screen>
            ) : (
              <Stack.Screen name="App">
                {(props) => <AppDrawer {...props} onLogout={handleLogout} />}
              </Stack.Screen>
            )}
          </Stack.Navigator>
        </NavigationContainer>
      </ToastProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  }
});
