import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Header } from '.././components/navigation/Header'; 

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
      <Header navigation={navigation} />
      <View style={screenStyles.container}>
        <Text style={screenStyles.title}>{route.name} Screen</Text>
      </View>
    </View>
  );
}