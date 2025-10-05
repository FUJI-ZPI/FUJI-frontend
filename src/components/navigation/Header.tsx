import React from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export interface HeaderProps {
  navigation: any; 
}

export function Header({ navigation }: HeaderProps) {
  return (
    <View style={styles.header}>
      <TouchableOpacity 
        onPress={() => navigation.toggleDrawer()}
        style={styles.menuButton}
      >
        <Ionicons name="menu" size={28} color="#4a90e2" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    height: 60,
    backgroundColor: "#f2f2f2",
    paddingTop: 15,
    position: 'relative', 
  },
  menuButton: {
    position: 'absolute',
    top: 15,
    right: 15,
    zIndex: 10, 
  }
});