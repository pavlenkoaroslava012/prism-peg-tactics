import React from 'react';
import { ImageBackground, StyleSheet, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import assets from '../assets';
import THEME from '../constants/theme';

interface Props {
  children: React.ReactNode;
  /** Top-to-bottom overlay; each screen passes its own so they read apart. */
  overlay?: readonly string[];
  /** Violet top-left blob / cyan bottom-right blob opacities. */
  blobs?: boolean;
}

/**
 * bg_game is the only background image in the project. Screens are told
 * apart by their overlay, not by a second art file.
 */
export function ScreenBackground({ children, overlay = THEME.gradients.screenOverlay, blobs = true }: Props) {
  return (
    <ImageBackground source={assets.bgGame} style={styles.bg} resizeMode="cover">
      <LinearGradient
        colors={overlay as string[]}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {blobs ? (
        <View style={StyleSheet.absoluteFill} pointerEvents="none">
          <View style={styles.blobViolet} />
          <View style={styles.blobCyan} />
        </View>
      ) : null}
      {children}
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  bg: { flex: 1, backgroundColor: THEME.colors.bgDeep },
  blobViolet: {
    position: 'absolute',
    top: -60,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: THEME.colors.primary,
    opacity: 0.16,
  },
  blobCyan: {
    position: 'absolute',
    bottom: 40,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: THEME.colors.secondary,
    opacity: 0.1,
  },
});

export default ScreenBackground;
