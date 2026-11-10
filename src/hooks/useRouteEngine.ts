import { useCallback, useMemo, useRef, useState } from 'react';
import { CHARGE_QUOTA, DAILY_SCANS } from '../constants/config';
import {
  GATE_CYCLE,
  pegAt,
  pegId,
  simulate,
  type GateState,
  type Gates,
  type Layout,
  type SimResult,
} from '../game/boardSim';
import { generateLayout, routeDescriptor } from '../game/levelGen';
import { starsFor } from '../game/scoring';

export type Phase = 'idle' | 'scanning' | 'falling' | 'resolving';

export interface RoundResult {
  routeIndex: number;
  solved: boolean;
  stars: number;
  redirectsUsed: number;
  drops: number;
  landedLane: number;
  targetLane: number;
  tint: SimResult['tint'];
  requiredTint: Layout['requiredTint'];
  pegsLit: number;
  par: number;
  refunded: boolean;
  blind: boolean;
  isDaily: boolean;
}

interface Options {
  routeIndex: number;
  isDaily: boolean;
  dailySeed?: number;
  routePreview: boolean;
  /** Drops already spent on this board in this session (star scoring). */
  initialDrops?: number;
}

export function useRouteEngine({ routeIndex, isDaily, dailySeed, routePreview, initialDrops = 0 }: Options) {
  const descriptor = useMemo(() => routeDescriptor(routeIndex), [routeIndex]);

  // Generation is deliberately lazy: it never runs at module load.
  const layout = useMemo(
    () => generateLayout(routeIndex, isDaily ? dailySeed : undefined),
    [routeIndex, isDaily, dailySeed],
  );

  const [gates, setGates] = useState<Gates>({});
  const [order, setOrder] = useState<string[]>([]);
  const [redirectsLeft, setRedirectsLeft] = useState(descriptor.budget);
  const [scansLeft, setScansLeft] = useState(isDaily ? DAILY_SCANS : layout.scans);
  const [phase, setPhase] = useState<Phase>('idle');
  const [chargedIds, setChargedIds] = useState<string[]>([]);
  const [refundUsed, setRefundUsed] = useState(false);
  const [drops, setDrops] = useState(initialDrops);
  const [budgetPulse, setBudgetPulse] = useState(0);
  const [rejectPulse, setRejectPulse] = useState(0);
  const [ghost, setGhost] = useState<SimResult | null>(null);
  const [blind, setBlind] = useState(false);

  const scanTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const phaseRef = useRef<Phase>('idle');
  phaseRef.current = phase;

  const redirectsUsed = order.length;

  const clearScanTimer = useCallback(() => {
    if (scanTimer.current !== null) {
      clearTimeout(scanTimer.current);
      scanTimer.current = null;
    }
  }, []);

  /** Tap an empty peg to place a gate (-1 redirect); tap again to rotate (free). */
  const pressPeg = useCallback(
    (row: number, col: number) => {
      if (phaseRef.current === 'falling' || phaseRef.current === 'resolving') {return;}
      const id = pegId(row, col);
      const current = gates[id];
      if (current === undefined) {
        // Placement costs a redirect; rotation below is free.
        if (redirectsLeft <= 0) {
          setRejectPulse(p => p + 1);
          return;
        }
        setGates(prev => ({ ...prev, [id]: GATE_CYCLE[0] }));
        setOrder(o => [...o, id]);
        setRedirectsLeft(n => n - 1);
        setBudgetPulse(p => p + 1);
      } else {
        const nextState = GATE_CYCLE[(current + 1) % GATE_CYCLE.length] as GateState;
        setGates(prev => ({ ...prev, [id]: nextState }));
      }
      setGhost(null);
    },
    [gates, redirectsLeft],
  );

  /** Removes the last placed gate and refunds its redirect. */
  const undo = useCallback(() => {
    if (phaseRef.current === 'falling' || phaseRef.current === 'resolving') {return;}
    if (order.length === 0) {return;}
    const last = order[order.length - 1];
    setOrder(o => o.slice(0, -1));
    setGates(prev => {
      const next = { ...prev };
      delete next[last];
      return next;
    });
    setRedirectsLeft(n => n + 1);
    setBudgetPulse(p => p + 1);
    setGhost(null);
  }, [order]);

  /** Spends one Route Scan to preview the simulated path. */
  const scan = useCallback(() => {
    if (phaseRef.current !== 'idle' && phaseRef.current !== 'scanning') {return;}
    if (scansLeft <= 0) {return;}
    setScansLeft(n => n - 1);
    setGhost(simulate(layout, gates));
    setPhase('scanning');
    if (!routePreview) {setBlind(true);}
    clearScanTimer();
    scanTimer.current = setTimeout(() => {
      setGhost(null);
      setPhase(p => (p === 'scanning' ? 'idle' : p));
      scanTimer.current = null;
    }, 4000);
  }, [clearScanTimer, gates, layout, routePreview, scansLeft]);

  /** Runs the deterministic simulation and hands the path to the animation. */
  const beginDrop = useCallback((): SimResult | null => {
    if (phaseRef.current === 'falling' || phaseRef.current === 'resolving') {return null;}
    clearScanTimer();
    setGhost(null);
    setPhase('falling');
    setDrops(n => n + 1);
    return simulate(layout, gates);
  }, [clearScanTimer, gates, layout]);

  /** Called by the animation completion callback. Always leaves 'falling'. */
  const resolveDrop = useCallback(
    (sim: SimResult): RoundResult => {
      setPhase('resolving');
      const previouslyCharged = new Set(chargedIds);
      const newly = sim.chargedPegs.filter(id => !previouslyCharged.has(id));
      const merged = Array.from(new Set([...chargedIds, ...sim.chargedPegs]));
      setChargedIds(merged);

      let refunded = false;
      if (!refundUsed && newly.length >= CHARGE_QUOTA) {
        refunded = true;
        setRefundUsed(true);
        setRedirectsLeft(n => n + 1);
        setBudgetPulse(p => p + 1);
      }

      const dropCount = drops + 1;
      const stars = starsFor({
        solved: sim.solved,
        redirectsUsed: order.length,
        par: descriptor.par,
        drops: dropCount,
      });

      return {
        routeIndex,
        solved: sim.solved,
        stars,
        redirectsUsed: order.length,
        drops: dropCount,
        landedLane: sim.landedLane,
        targetLane: layout.targetLane,
        tint: sim.tint,
        requiredTint: layout.requiredTint,
        pegsLit: merged.length,
        par: descriptor.par,
        refunded,
        blind,
        isDaily,
      };
    },
    [blind, chargedIds, descriptor.par, drops, isDaily, layout, order.length, refundUsed, routeIndex],
  );

  /** Fresh attempt on the same board: gates cleared, budget restored. */
  const resetAttempt = useCallback(() => {
    clearScanTimer();
    setGates({});
    setOrder([]);
    setRedirectsLeft(descriptor.budget);
    setRefundUsed(false);
    setGhost(null);
    setBlind(false);
    setPhase('idle');
  }, [clearScanTimer, descriptor.budget]);

  const tintOfPeg = useCallback(
    (row: number, col: number) => pegAt(layout, row, col).tint,
    [layout],
  );

  return {
    layout,
    descriptor,
    gates,
    order,
    phase,
    redirectsLeft,
    redirectsUsed,
    scansLeft,
    chargedIds,
    drops,
    budgetPulse,
    rejectPulse,
    ghost,
    blind,
    pressPeg,
    undo,
    scan,
    beginDrop,
    resolveDrop,
    resetAttempt,
    tintOfPeg,
    clearScanTimer,
  };
}

export default useRouteEngine;
