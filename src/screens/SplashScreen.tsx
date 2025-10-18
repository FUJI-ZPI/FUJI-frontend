import LottieView from "lottie-react-native";
import React from "react"
import { View, Text, StyleSheet } from 'react-native';

const SPLASH_SCREEN = require("../../assets/splash_screen.json");

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  return (
    <View style={styles.container}>
      <LottieView style={styles.lottie}
        source={SPLASH_SCREEN}
        autoPlay
        speed={2.5}
        loop={false}
        onAnimationFinish={onFinish}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0ede7",
  },
  lottie: {
    width: '100%', 
    height: '100%',
  }
});