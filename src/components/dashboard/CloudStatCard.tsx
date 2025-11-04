import React from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle, TextStyle } from 'react-native';
import Svg, { Path, G } from 'react-native-svg';
import { Ionicons, Feather } from '@expo/vector-icons';
import { colors } from '../../theme/styles';

const cloudSvgs = {
  1: {
    width: 152 * 1.6,
    height: 64 * 1.6,
    viewBox: "70 135 70 30",
    paths: [
      { d: "m 108.04223,142.23813 c 0.98861,1.56883 1.55014,4.16237 1.90437,6.54362 0,0 6.17631,-0.68107 12.41052,5.80153 2.32647,2.4186 6.11219,3.83428 9.32205,4.8123 q 0.35049,0.10646 0.71655,0.20545 a 0.28761765,0.28761765 0 0 1 -0.0697,0.56714 H 78.680325 a 1.4194118,1.4194118 0 0 1 -1.414432,-1.56571 c 0.37353,-3.59647 2.335182,-12.24803 12.555569,-13.63383 0,0 0.03113,-0.1575 0.105211,-0.43578 a 10.221633,10.221633 0 0 1 5.87126,-6.84804 c 0,0 8.107457,-2.01332 12.244297,4.55332 z", fill: "#ffffff", opacity: 0.98 },
      { d: "m 132.39572,159.6004 q -0.36606,-0.0984 -0.71655,-0.20482 a 19.710525,19.710525 0 0 1 -8.40441,-5.26302 c -6.23483,-6.48261 -12.17021,-5.96589 -12.17021,-5.96589 a 18.212672,18.212672 0 0 0 -1.92181,-5.98892 c -2.79276,-5.19891 -8.75117,-6.49942 -13.384807,-4.48734 0.07159,-0.008 10.821147,-1.18658 11.978467,14.2514 0,0 6.72353,-1.30175 11.22643,3.45265 a 18.271814,18.271814 0 0 0 4.43192,3.52052 c 0.76449,0.42022 1.6317,0.85476 2.56615,1.25319 h 6.3251 a 0.2882402,0.2882402 0 0 0 0.0697,-0.56777 z", fill: "#dfe4f9", opacity: 0.98 }
    ]
  },
  2: {
    width: 160 * 1.3,
    height: 67 * 1.3,
    viewBox: "55 109 65 30",
    paths: [
      { d: "m 55.565192,132.92239 h 54.592568 c 0.70396,0.002 0.93361,-0.94437 0.30692,-1.26502 -3.12689,-1.54671 -6.07272,-3.43523 -8.78355,-5.63095 0,0 -4.473011,-8.60363 -12.1148,-6.6314 -0.167267,-1.1812 -0.482687,-2.33661 -0.938804,-3.43896 -0.500225,-1.2581 -1.241936,-2.40609 -2.18328,-3.3792 0,0 -8.047691,-5.33586 -16.289618,4.71457 -0.04731,0.0579 -6.283387,0.74706 -7.418916,6.64633 -0.435785,2.25799 -2.215652,4.17108 -3.915834,5.71625 -1.029864,0.93389 -2.202927,1.69646 -3.474446,2.25861 -0.514686,0.23713 -0.346922,1.00799 0.21976,1.00977 z", fill: "#ffffff", opacity: 0.98 },
      { d: "m 65.820442,127.75337 c 0.91328,-8.86946 8.478495,-9.64951 8.478495,-9.64951 3.469466,-8.86635 11.890687,-5.61851 12.139706,-5.52077 -5.070039,-5.19891 -14.784917,-3.683 -17.306863,4.097 -0.02366,0.0716 -0.04607,0.14318 -0.06848,0.21602 0,0 -5.951569,0.93943 -7.087098,6.8387 a 10.621309,10.621309 0 0 1 -3.161304,5.92169 12.979525,12.979525 0 0 1 -3.473824,2.25861 0.52916668,0.52916668 0 0 0 0.223495,1.00977 h 6.922123 a 7.0298236,7.0298236 0 0 0 3.33375,-5.17151 z", fill: "#dfe4f9", opacity: 0.98 }
    ]
  }
};

interface CloudStatCardProps {
  iconName: any;
  iconSet: 'Ionicons' | 'Feather';
  iconColor: string;
  value: string | number;
  label: string;
  cloudType: 1 | 2;
  contentStyle?: StyleProp<ViewStyle>;
  valueStyle?: StyleProp<TextStyle>;
  labelStyle?: StyleProp<TextStyle>;
}

export const CloudStatCard: React.FC<CloudStatCardProps> = ({
  iconName,
  iconSet,
  iconColor,
  value,
  label,
  cloudType,
  contentStyle,
  valueStyle,
  labelStyle
}) => {
  const cloud = cloudSvgs[cloudType];

  const IconComponent = iconSet === 'Ionicons' ? Ionicons : Feather;

  return (
    <View style={{ width: cloud.width, height: cloud.height }}>
      <Svg
        width="100%"
        height="100%"
        viewBox={cloud.viewBox}
        preserveAspectRatio="xMidYMid meet"
        style={{ position: 'absolute' }}
      >
        <G>
          {cloud.paths.map((path, index) => (
            <Path key={index} d={path.d} fill={path.fill} opacity={path.opacity} />
          ))}
        </G>
      </Svg>
      {/* Kontener na zawartość statystyk */}
      <View style={[styles.content, contentStyle]}>
        <View style={styles.topRow}>
          <IconComponent name={iconName} size={styles.value.fontSize} color={iconColor} />
          <Text style={[styles.value, valueStyle]}>{value}</Text>
        </View>
        <Text style={[styles.label, labelStyle]}>{label}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 5, 
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  value: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  label: {
    fontSize: 13,
    color: colors.text,
    marginTop: 0,
  },
});
