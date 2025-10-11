import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { StyleSheet } from "react-native";
import { DrawerContent } from "./src/components/navigation/DrawerContent";
import { NavItem, ScreenComponentType } from "./src/components/navigation/DrawerContent";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { PlaceholderScreen } from "./src/screens/PlaceholderScreen";
import ProfileScreen from "./src/screens/ProfileScreen";
import ToastProvider from "./src/providers/ToastProvider";
import './src/i18n/i18n';
import { useTranslation } from "react-i18next";


const Drawer = createDrawerNavigator();

export default function App() {
  const { t } = useTranslation();

  const navItems: NavItem[] = [
    { id: "Dashboard", label: t("nav.dashboard"), icon: "home-outline", component: DashboardScreen as ScreenComponentType },
    { id: "Practice", label: t("nav.practice"), icon: "pencil-sharp", component: PlaceholderScreen as ScreenComponentType },
    { id: "Vocabulary", label: t("nav.vocabulary"), icon: "book-outline", component: PlaceholderScreen as ScreenComponentType },
    { id: "Chat", label: t("nav.chat"), icon: "chatbubble-ellipses-outline", component: PlaceholderScreen as ScreenComponentType },
    { id: "Leaderboard", label: t("nav.leaderboard"), icon: "trophy-outline", component: PlaceholderScreen as ScreenComponentType },
    { id: "Profile", label: t("nav.profile"), icon: "person-outline", component: ProfileScreen as ScreenComponentType },
    { id: "Settings", label: t("nav.settings"), icon: "settings-outline", component: PlaceholderScreen as ScreenComponentType },
  ];


  return (
    <ToastProvider>
      <NavigationContainer>
        <Drawer.Navigator
          drawerContent={(props) => <DrawerContent {...props} navItems={navItems} />}
          screenOptions={{
            headerShown: true,
            headerTitle: '', 
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
      </NavigationContainer>
    </ToastProvider>
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
});