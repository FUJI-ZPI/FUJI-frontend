import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { StyleSheet } from "react-native";
import { DrawerContent } from "./src/components/navigation/DrawerContent";
import { NavItem, ScreenComponentType } from "./src/components/navigation/DrawerContent";
import { DashboardScreen } from "./src/screens/DashboardScreen";
import { PlaceholderScreen } from "./src/screens/PlaceholderScreen";
import ProfileScreen from "./src/screens/ProfileScreen";


const Drawer = createDrawerNavigator();

export default function App() {
  const navItems: NavItem[] = [
    { id: "Dashboard", label: "Dashboard", icon: "home-outline", component: DashboardScreen as ScreenComponentType },
    { id: "Practice", label: "Practice", icon: "pencil-sharp", component: PlaceholderScreen as ScreenComponentType },
    { id: "Vocabulary", label: "Vocabulary", icon: "book-outline", component: PlaceholderScreen as ScreenComponentType },
    { id: "Chat", label: "Chat", icon: "chatbubble-ellipses-outline", component: PlaceholderScreen as ScreenComponentType },
    { id: "Leaderboard", label: "Leaderboard", icon: "trophy-outline", component: PlaceholderScreen as ScreenComponentType },
    { id: "Profile", label: "Profile", icon: "person-outline", component: ProfileScreen as ScreenComponentType },
    { id: "Settings", label: "Settings", icon: "settings-outline", component: PlaceholderScreen as ScreenComponentType },
  ];

  return (
    <NavigationContainer>
      <Drawer.Navigator
        drawerContent={(props) => <DrawerContent {...props} navItems={navItems} />}
        screenOptions={{
          headerShown: false,
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