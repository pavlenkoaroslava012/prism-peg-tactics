import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import THEME from '../constants/theme';

const STAR_PATH =
  'M12 2.4 L14.9 8.6 L21.6 9.5 L16.7 14.1 L17.9 20.8 L12 17.6 L6.1 20.8 L7.3 14.1 L2.4 9.5 L9.1 8.6 Z';

interface Props {
  earned: number;
  total?: number;
  size?: number;
  accent?: string;
}

export function StarRow({ earned, total = 3, size = 22, accent = THEME.colors.secondary }: Props) {
  return (
    <View style={styles.row}>
      {Array.from({ length: total }, (_, i) => {
        const lit = i < earned;
        return (
          <Svg key={i} width={size} height={size} viewBox="0 0 24 24">
            <Path
              d={STAR_PATH}
              fill={lit ? accent : 'transparent'}
              stroke={lit ? accent : 'rgba(255,255,255,0.22)'}
              strokeWidth={1.5}
            />
          </Svg>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 6 },
});

export default StarRow;
