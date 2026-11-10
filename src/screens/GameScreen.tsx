import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Eye, Undo2, Zap } from 'lucide-react-native';
import assets from '../assets';
import ChargeStrip from '../components/ChargeStrip';
import GhostRoute from '../components/GhostRoute';
import Orb from '../components/Orb';
import PegBoard from '../components/PegBoard';
import PrimaryButton from '../components/PrimaryButton';
import RedirectMeter from '../components/RedirectMeter';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import SecondaryButton from '../components/SecondaryButton';
import {
  CHAPTER_NAMES,
  CHARGE_QUOTA,
  RESULT_DELAY_MS,
  orbCenterY,
  pegCenterX,
} from '../constants/config';
import THEME from '../constants/theme';
import type { SimResult } from '../game/boardSim';
import { useDropAnimation } from '../hooks/useDropAnimation';
import { useRouteEngine, type RoundResult } from '../hooks/useRouteEngine';
import type { DerivedSettings } from '../hooks/useSettings';

interface Props {
  routeIndex: number;
  isDaily: boolean;
  dailySeed?: number;
  settings: DerivedSettings;
  routePreview: boolean;
  /** Drops already spent on this board this session (3-star scoring). */
  initialDrops: number;
  onBack: () => void;
  onGameOver: (result: RoundResult) => void;
}

export function GameScreen({
  routeIndex,
  isDaily,
  dailySeed,
  settings,
  routePreview,
  initialDrops,
  onBack,
  onGameOver,
}: Props) {
  const engine = useRouteEngine({ routeIndex, isDaily, dailySeed, routePreview, initialDrops });
  const {
    layout,
    descriptor,
    gates,
    phase,
    redirectsLeft,
    scansLeft,
    chargedIds,
    budgetPulse,
    rejectPulse,
    ghost,
    order,
  } = engine;

  const simRef = useRef<SimResult | null>(null);
  const prevChargedRef = useRef<Set<string>>(new Set());
  const resultTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [landed, setLanded] = useState<{ index: number; solved: boolean } | null>(null);

  // Stable peg handler: the engine callback changes on every placement, a ref
  // keeps all 72 memoised pegs from re-rendering for that alone.
  const pressRef = useRef(engine.pressPeg);
  pressRef.current = engine.pressPeg;
  const handlePeg = useCallback((row: number, col: number) => {
    pressRef.current(row, col);
  }, []);

  const handleComplete = useCallback(() => {
    const sim = simRef.current;
    if (sim === null) {return;}
    setLanded({ index: sim.landedLane, solved: sim.solved });
    const result = engine.resolveDrop(sim);
    if (resultTimer.current !== null) {clearTimeout(resultTimer.current);}
    resultTimer.current = setTimeout(() => {
      resultTimer.current = null;
      onGameOver(result);
    }, RESULT_DELAY_MS);
  }, [engine, onGameOver]);

  const anim = useDropAnimation({
    stepMs: settings.dropStepMs,
    reducedMotion: settings.reducedMotion,
    onComplete: handleComplete,
  });

  const { park, start, stop } = anim;

  // Park the orb in the funnel whenever a fresh board is shown.
  useEffect(() => {
    park({ x: pegCenterX(layout.entryLane), y: orbCenterY(-1) });
    setLanded(null);
  }, [layout, park]);

  useEffect(() => {
    return () => {
      stop();
      if (resultTimer.current !== null) {clearTimeout(resultTimer.current);}
    };
  }, [stop]);

  const handleDrop = useCallback(() => {
    const sim = engine.beginDrop();
    if (sim === null) {return;}
    simRef.current = sim;
    prevChargedRef.current = new Set(chargedIds);
    setLanded(null);
    start(sim.path.map(node => ({ x: pegCenterX(node.lane), y: orbCenterY(node.row) })));
  }, [chargedIds, engine, start]);

  const falling = phase === 'falling' || phase === 'resolving';
  const stepIndex = anim.stepIndex;

  const liveCharged = useMemo(() => {
    const sim = simRef.current;
    if (!falling || sim === null) {return chargedIds;}
    return chargedIds.concat(sim.chargedPegs.slice(0, Math.max(0, stepIndex)));
  }, [chargedIds, falling, stepIndex]);

  const newlyCharged = useMemo(() => {
    const sim = simRef.current;
    if (sim === null) {return 0;}
    const prev = prevChargedRef.current;
    const upTo = falling ? Math.max(0, stepIndex) : sim.chargedPegs.length;
    return sim.chargedPegs.slice(0, upTo).filter(id => !prev.has(id)).length;
  }, [falling, stepIndex]);

  const trail = useMemo(() => {
    const sim = simRef.current;
    if (!falling || sim === null || settings.trailLength === 0) {return [];}
    const from = Math.max(0, stepIndex - settings.trailLength);
    return sim.path.slice(from, Math.max(from, stepIndex)).map((node, i, arr) => ({
      x: pegCenterX(node.lane),
      y: orbCenterY(node.row),
      opacity: 0.06 + (0.44 * (i + 1)) / Math.max(1, arr.length),
    }));
  }, [falling, settings.trailLength, stepIndex]);

  const ghostPoints = useMemo(() => {
    if (ghost === null) {return [];}
    return ghost.path.map(node => ({ x: pegCenterX(node.lane), y: orbCenterY(node.row) }));
  }, [ghost]);

  const orbTint = falling && simRef.current !== null ? simRef.current.tint : layout.requiredTint;
  const chapterName = CHAPTER_NAMES[Math.min(CHAPTER_NAMES.length - 1, layout.chapter)];

  return (
    <ScreenBackground>
      <ScreenHeader
        title={isDaily ? 'DAILY ROUTE' : descriptor.label}
        subtitle={'CHAPTER ' + (layout.chapter + 1) + ' - ' + chapterName}
        onBack={onBack}
        rightSlot={
          <RedirectMeter
            left={redirectsLeft}
            total={descriptor.budget}
            pulseKey={budgetPulse}
            rejectKey={rejectPulse}
            reducedMotion={settings.reducedMotion}
          />
        }
      />

      {/* The gesture and its result, visible for the whole idle state. */}
      <Text style={styles.hint}>TAP A PEG TO PLACE OR ROTATE A GATE</Text>

      <View style={styles.stage}>
        <Image source={assets.spriteFunnel} style={styles.funnel} resizeMode="contain" />
        <PegBoard
          layout={layout}
          gates={gates}
          chargedIds={liveCharged}
          showMarkers={settings.showBiasMarkers}
          highContrast={settings.highContrast}
          reducedMotion={settings.reducedMotion}
          landedIndex={landed === null ? null : landed.index}
          landedSolved={landed !== null && landed.solved}
          dim={falling}
          disabled={falling}
          onPegPress={handlePeg}
          overlay={
            <>
              <GhostRoute
                points={ghostPoints}
                visible={ghost !== null}
                tint={ghost === null ? null : ghost.tint}
                landingOnly={!settings.showGhostRoute}
              />
              <Orb
                translateX={anim.translateX}
                translateY={anim.translateY}
                squash={anim.squash}
                tint={orbTint}
                trail={trail}
              />
            </>
          }
        />
      </View>

      <View style={styles.bar}>
        <Image source={assets.buttonRect} style={styles.barPlate} resizeMode="cover" />
        <ChargeStrip charged={Math.min(CHARGE_QUOTA, newlyCharged)} quota={CHARGE_QUOTA} />
        <SecondaryButton
          square
          badge={'SCAN ' + scansLeft}
          Icon={Eye}
          accent={THEME.colors.secondary}
          disabled={scansLeft <= 0 || falling}
          onPress={engine.scan}
        />
        <View style={styles.dropSlot}>
          <PrimaryButton label="DROP" Icon={Zap} height={60} disabled={falling} onPress={handleDrop} />
        </View>
        {order.length > 0 ? (
          <SecondaryButton
            square
            badge="UNDO"
            Icon={Undo2}
            accent={THEME.colors.textSecondary}
            disabled={falling}
            onPress={engine.undo}
          />
        ) : null}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  hint: {
    marginTop: 10,
    textAlign: 'center',
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 1,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 108,
  },
  funnel: { width: 64, height: 34, marginBottom: 4 },
  bar: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    height: 92,
    borderRadius: THEME.radius.xl,
    backgroundColor: THEME.colors.barFill,
    borderWidth: 1,
    borderColor: THEME.colors.hudBorder,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    overflow: 'hidden',
    ...THEME.softGlow(THEME.colors.primary),
  },
  barPlate: { ...StyleSheet.absoluteFillObject, opacity: 0.12 },
  dropSlot: { flex: 1 },
});

export default GameScreen;
