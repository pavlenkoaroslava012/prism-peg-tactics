import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import assets from '../assets';
import { LOADER_DURATION_MS } from '../constants/config';
import THEME from '../constants/theme';
import HudFrame from '../components/HudFrame';

const BAR_W = 220;
const FRAME = 180;

interface Props {
  onDone: () => void;
}

/**
 * Brand card, not a menu duplicate: no PLAY button, no stat chips, no touch
 * handler. The 8 s timer is the only exit.
 */
export function LoaderScreen({ onDone }: Props) {
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const barWidth = useRef(new Animated.Value(0)).current;
  const scan = useRef(new Animated.Value(0)).current;
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    const entry = Animated.parallel([
      Animated.timing(logoOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.spring(logoScale, { toValue: 1, useNativeDriver: true, ...THEME.spring.pop }),
    ]);
    entry.start();

    // Width cannot run on the native driver — this is the only such animation.
    const bar = Animated.timing(barWidth, {
      toValue: BAR_W,
      duration: LOADER_DURATION_MS,
      easing: Easing.linear,
      useNativeDriver: false,
    });
    bar.start();

    const sweep = Animated.loop(
      Animated.timing(scan, {
        toValue: 1,
        duration: 2200,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
    );
    sweep.start();

    const timer = setTimeout(() => doneRef.current(), LOADER_DURATION_MS);

    return () => {
      clearTimeout(timer);
      entry.stop();
      bar.stop();
      sweep.stop();
    };
  }, [logoOpacity, logoScale, barWidth, scan]);

  const scanY = scan.interpolate({ inputRange: [0, 1], outputRange: [0, FRAME] });

  return (
    <View style={styles.root}>
      <Image source={assets.bgGame} style={StyleSheet.absoluteFill} resizeMode="cover" />
      {/* Deliberately much darker than Menu so the two frames never match. */}
      <LinearGradient
        colors={['rgba(5,0,12,0.92)', 'rgba(10,0,20,0.95)', 'rgba(18,0,38,0.90)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.blobViolet} pointerEvents="none" />
      <View style={styles.blobCyan} pointerEvents="none" />

      <View style={styles.centre}>
        <HudFrame accent={THEME.colors.secondary} bracketSize={22} style={styles.frame}>
          <View style={styles.frameInner}>
            <Animated.View pointerEvents="none" style={{ opacity: logoOpacity, transform: [{ scale: logoScale }] }}>
              <Image source={assets.logo} style={styles.logo} resizeMode="contain" />
            </Animated.View>
          </View>
          <Animated.View
            pointerEvents="none"
            style={[styles.scanLine, { transform: [{ translateY: scanY }] }]}
          />
        </HudFrame>

        <Text style={styles.titleTop}>PRISM PEG</Text>
        <Text style={styles.titleBottom}>TACTICS</Text>
        <Text style={styles.subtitle}>CALIBRATING PEG MATRIX</Text>

        <View style={styles.barTrack}>
          <Animated.View pointerEvents="none" style={[styles.barFillWrap, { width: barWidth }]}>
            <LinearGradient
              colors={THEME.gradients.beam as unknown as string[]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.barFill}
            />
          </Animated.View>
        </View>
        <Text style={styles.loading}>LOADING...</Text>
      </View>

      <Text style={styles.footer}>OFFLINE - NO REAL MONEY - 12+</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05000C', alignItems: 'center', justifyContent: 'center' },
  blobViolet: {
    position: 'absolute',
    top: -60,
    left: -80,
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: THEME.colors.primary,
    opacity: 0.18,
  },
  blobCyan: {
    position: 'absolute',
    bottom: 40,
    right: -70,
    width: 260,
    height: 260,
    borderRadius: 130,
    backgroundColor: THEME.colors.secondary,
    opacity: 0.12,
  },
  centre: { alignItems: 'center' },
  frame: {
    width: FRAME,
    height: FRAME,
    backgroundColor: 'rgba(10,0,20,0.55)',
    borderColor: 'rgba(0,212,255,0.22)',
  },
  frameInner: { width: FRAME, height: FRAME, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 148, height: 148 },
  scanLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: 1,
    backgroundColor: THEME.colors.secondary,
    opacity: 0.6,
  },
  titleTop: {
    marginTop: 30,
    color: THEME.colors.textPrimary,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: 5,
  },
  titleBottom: {
    color: THEME.colors.secondary,
    fontSize: 34,
    lineHeight: 40,
    fontWeight: '800',
    letterSpacing: 10,
    textShadowColor: THEME.colors.secondary,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  subtitle: {
    marginTop: 14,
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 3,
  },
  barTrack: {
    marginTop: 26,
    width: BAR_W,
    height: 4,
    borderRadius: 2,
    backgroundColor: THEME.colors.track,
    overflow: 'hidden',
  },
  barFillWrap: { height: 4, borderRadius: 2, overflow: 'hidden' },
  barFill: { flex: 1, height: 4 },
  loading: {
    marginTop: 12,
    color: THEME.colors.textMuted,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '700',
    letterSpacing: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 26,
    color: THEME.colors.textMuted,
    fontSize: 10,
    lineHeight: 13,
    fontWeight: '600',
    letterSpacing: 2,
  },
});

export default LoaderScreen;
