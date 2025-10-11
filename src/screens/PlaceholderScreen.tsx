import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface ScreenProps {
    route: any;
    navigation: any;
}

const screenStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
  },
});


export function PlaceholderScreen({ route, navigation }: ScreenProps) {
  return (
    <View style={{ flex: 1 }}>
      <View style={screenStyles.container}>
        <Text style={screenStyles.title}>{route.name} Screen</Text>
      </View>
    </View>
  );
}