import React, { useEffect, useState } from 'react';
import { View, Animated, Dimensions, Easing, Text } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

interface Cloud {
  id: number;
  y: number;
  size: number;
  speed: number;
  kanji?: string;
  variant: number;
  anim: Animated.Value;
  zIndex: number;
}

const KANJI_SIGNS = ['水', '火', '木', '金', '土', '日', '月', '人', '山', '空', '水', '心', '風', '火', '月'];

export const FlyingClouds: React.FC = () => {
  const [clouds, setClouds] = useState<Cloud[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      const id = Date.now();
      const y = Math.random() * (SCREEN_HEIGHT * 0.35); // tylko górna część ekranu
      const size = 0.5 + Math.random() * 1.3; // losowa wielkość
      const variant = Math.random() > 0.5 ? 1 : 2;
      const anim = new Animated.Value(SCREEN_WIDTH + 150);

      // paralaksa — duże chmury lecą wolniej, małe szybciej
      const baseDuration = 16000;
      const speed = baseDuration * (1 + size * 0.8);

      const showKanji = Math.random() < 0.25;
      const kanji = showKanji
        ? KANJI_SIGNS[Math.floor(Math.random() * KANJI_SIGNS.length)]
        : undefined;

      const zIndex = Math.round(10 + size * 10); // większe bliżej (nad innymi)

      const newCloud: Cloud = { id, y, size, speed, kanji, variant, anim, zIndex };
      setClouds(prev => [...prev, newCloud]);

      Animated.timing(anim, {
        toValue: -200,
        duration: speed,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => {
        setClouds(prev => prev.filter(c => c.id !== id));
      });
    }, 5500 + Math.random() * 7000);    // częstotliwość generowania chmur (nowa chmura co 5.5 do (5.5 + 7) sekuny)

    return () => clearInterval(interval);
  }, []);

  const renderCloud = (variant: number, size: number) => {
    const width = 120 * size;
    const height = 50 * size;
    const opacity = 0.9;

    if (variant === 1) {
      return (
        <Svg
          width={width}
          height={height}
          viewBox="70 135 70 30"
          preserveAspectRatio="xMidYMid meet"
        >
          <G>
            <Path
              d="m 108.04223,142.23813 c 0.98861,1.56883 1.55014,4.16237 1.90437,6.54362 0,0 6.17631,-0.68107 12.41052,5.80153 2.32647,2.4186 6.11219,3.83428 9.32205,4.8123 q 0.35049,0.10646 0.71655,0.20545 a 0.28761765,0.28761765 0 0 1 -0.0697,0.56714 H 78.680325 a 1.4194118,1.4194118 0 0 1 -1.414432,-1.56571 c 0.37353,-3.59647 2.335182,-12.24803 12.555569,-13.63383 0,0 0.03113,-0.1575 0.105211,-0.43578 a 10.221633,10.221633 0 0 1 5.87126,-6.84804 c 0,0 8.107457,-2.01332 12.244297,4.55332 z"
              fill="#ffffff"
              opacity={opacity}
            />
            <Path
              d="m 132.39572,159.6004 q -0.36606,-0.0984 -0.71655,-0.20482 a 19.710525,19.710525 0 0 1 -8.40441,-5.26302 c -6.23483,-6.48261 -12.17021,-5.96589 -12.17021,-5.96589 a 18.212672,18.212672 0 0 0 -1.92181,-5.98892 c -2.79276,-5.19891 -8.75117,-6.49942 -13.384807,-4.48734 0.07159,-0.008 10.821147,-1.18658 11.978467,14.2514 0,0 6.72353,-1.30175 11.22643,3.45265 a 18.271814,18.271814 0 0 0 4.43192,3.52052 c 0.76449,0.42022 1.6317,0.85476 2.56615,1.25319 h 6.3251 a 0.2882402,0.2882402 0 0 0 0.0697,-0.56777 z"
              fill="#dfe4f9"
              opacity={opacity}
            />
          </G>
        </Svg>
      );
    } else {
      return (
        <Svg
          width={width}
          height={height}
          viewBox="55 109 65 30"
          preserveAspectRatio="xMidYMid meet"
        >
          <G>
            <Path
              d="m 55.565192,132.92239 h 54.592568 c 0.70396,0.002 0.93361,-0.94437 0.30692,-1.26502 -3.12689,-1.54671 -6.07272,-3.43523 -8.78355,-5.63095 0,0 -4.473011,-8.60363 -12.1148,-6.6314 -0.167267,-1.1812 -0.482687,-2.33661 -0.938804,-3.43896 -0.500225,-1.2581 -1.241936,-2.40609 -2.18328,-3.3792 0,0 -8.047691,-5.33586 -16.289618,4.71457 -0.04731,0.0579 -6.283387,0.74706 -7.418916,6.64633 -0.435785,2.25799 -2.215652,4.17108 -3.915834,5.71625 -1.029864,0.93389 -2.202927,1.69646 -3.474446,2.25861 -0.514686,0.23713 -0.346922,1.00799 0.21976,1.00977 z"
              fill="#ffffff"
              opacity={opacity}
            />
            <Path
              d="m 65.820442,127.75337 c 0.91328,-8.86946 8.478495,-9.64951 8.478495,-9.64951 3.469466,-8.86635 11.890687,-5.61851 12.139706,-5.52077 -5.070039,-5.19891 -14.784917,-3.683 -17.306863,4.097 -0.02366,0.0716 -0.04607,0.14318 -0.06848,0.21602 0,0 -5.951569,0.93943 -7.087098,6.8387 a 10.621309,10.621309 0 0 1 -3.161304,5.92169 12.979525,12.979525 0 0 1 -3.473824,2.25861 0.52916668,0.52916668 0 0 0 0.223495,1.00977 h 6.922123 a 7.0298236,7.0298236 0 0 0 3.33375,-5.17151 z"
              fill="#dfe4f9"
              opacity={opacity}
            />
          </G>
        </Svg>
      );
    }
  };

  return (
    <View
      pointerEvents="none"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: SCREEN_WIDTH,
        height: SCREEN_HEIGHT * 0.5,
        zIndex: 5,
      }}
    >
      {clouds.map(cloud => (
        <Animated.View
          key={cloud.id}
          pointerEvents="none"
          style={{
            position: 'absolute',
            top: cloud.y,
            transform: [{ translateX: cloud.anim }],
            zIndex: cloud.zIndex,
          }}
        >
          {renderCloud(cloud.variant, cloud.size)}
          {cloud.kanji && (
            <View
              style={{
                position: 'absolute',
                top: '18%',
                left: '25%',
                zIndex: cloud.zIndex + 1,
                pointerEvents: "none"
              }}
            >
              <Text
                style={{
                  fontSize: 22 * cloud.size,
                  fontWeight: 'bold',
                  color: "#c1cdfdff",
                  pointerEvents: "none"
                }}
              >
                {cloud.kanji}
              </Text>
            </View>
          )}
        </Animated.View>
      ))}
    </View>
  );
};
