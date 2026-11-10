/**
 * Prism Peg Tactics — navigation state machine.
 *
 * One place owns the current screen; there is no navigation library.
 * Loader -> Menu -> Game -> Result -> Menu, plus the five one-tap routes
 * reachable from the Menu hub.
 */
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Animated, BackHandler, StatusBar, StyleSheet, View } from 'react-native';
import ChallengeScreen from './src/screens/ChallengeScreen';
import CollectionScreen from './src/screens/CollectionScreen';
import DailyModeScreen from './src/screens/DailyModeScreen';
import GameScreen from './src/screens/GameScreen';
import LoaderScreen from './src/screens/LoaderScreen';
import MenuScreen from './src/screens/MenuScreen';
import ProgressScreen from './src/screens/ProgressScreen';
import ResultScreen from './src/screens/ResultScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import { TOTAL_ROUTES } from './src/constants/config';
import THEME from './src/constants/theme';
import { shardsEarned } from './src/game/scoring';
import { useDailyRoute } from './src/hooks/useDailyRoute';
import { usePersistentProgress } from './src/hooks/usePersistentProgress';
import { useSettings } from './src/hooks/useSettings';
import type { RoundResult } from './src/hooks/useRouteEngine';
import {
  applyRouteOutcome,
  firstUnsolvedRoute,
  recordDaily,
  threeStarCount,
  type Settings,
} from './src/storage/progressStore';

export type Screen =
  | 'loader'
  | 'menu'
  | 'game'
  | 'result'
  | 'challenge'
  | 'progress'
  | 'collection'
  | 'daily'
  | 'settings';

function App(): React.JSX.Element {
  const {
    progress,
    ready,
    recovered,
    commit,
    patchSettings,
    resetAll,
    dismissRecovered,
  } = usePersistentProgress();
  const derived = useSettings(progress.settings);

  const [screen, setScreen] = useState<Screen>('loader');
  const daily = useDailyRoute(progress.daily, screen === 'daily');

  const [activeRoute, setActiveRoute] = useState(0);
  const [isDaily, setIsDaily] = useState(false);
  const [result, setResult] = useState<RoundResult | null>(null);
  const [shardUnlocked, setShardUnlocked] = useState<number | null>(null);
  const [routeAttempts, setRouteAttempts] = useState(0);
  const [boardKey, setBoardKey] = useState(0);
  const [session, setSession] = useState({ runs: 0, redirects: 0 });

  const history = useRef<Screen[]>([]);
  const fade = useRef(new Animated.Value(1)).current;

  // Resume on the first route that is unlocked but not yet solved.
  const resumedRef = useRef(false);
  useEffect(() => {
    if (!ready || resumedRef.current) {return;}
    resumedRef.current = true;
    setActiveRoute(firstUnsolvedRoute(progress));
  }, [ready, progress]);

  const navigate = useCallback(
    (next: Screen) => {
      setScreen(current => {
        if (current !== 'loader' && current !== next) {history.current.push(current);}
        return next;
      });
      fade.setValue(0);
      Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
    },
    [fade],
  );

  const goBack = useCallback(() => {
    const previous = history.current.pop();
    const target: Screen = previous === undefined || previous === 'loader' ? 'menu' : previous;
    setScreen(target);
    fade.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  }, [fade]);

  const goMenu = useCallback(() => {
    history.current = [];
    navigate('menu');
  }, [navigate]);

  // System Back: Menu closes the app, the splash is never on the back stack.
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (screen === 'loader') {return true;}
      if (screen === 'menu') {return false;}
      if (screen === 'result') {
        goMenu();
        return true;
      }
      goBack();
      return true;
    });
    return () => sub.remove();
  }, [screen, goBack, goMenu]);

  const startRoute = useCallback(
    (index: number, asDaily: boolean) => {
      setActiveRoute(index);
      setIsDaily(asDaily);
      setRouteAttempts(0);
      setBoardKey(k => k + 1);
      navigate('game');
    },
    [navigate],
  );

  const handlePlay = useCallback(() => {
    startRoute(activeRoute, false);
  }, [activeRoute, startRoute]);

  const dailyRouteIndex = useMemo(() => daily.today % TOTAL_ROUTES, [daily.today]);

  const handleStartDaily = useCallback(() => {
    startRoute(dailyRouteIndex, true);
  }, [dailyRouteIndex, startRoute]);

  const handleGameOver = useCallback(
    (round: RoundResult) => {
      const outcome = {
        routeIndex: round.routeIndex,
        solved: round.solved,
        stars: round.stars,
        redirectsUsed: round.redirectsUsed,
        drops: round.drops,
      };
      let next = applyRouteOutcome(progress, outcome);
      if (round.isDaily) {
        next = recordDaily(next, {
          day: daily.today,
          solved: round.solved,
          redirects: round.redirectsUsed,
        });
      }

      const before = shardsEarned(threeStarCount(progress));
      const after = shardsEarned(threeStarCount(next));
      setShardUnlocked(after > before ? after - 1 : null);

      commit(next);
      setSession(s => ({ runs: s.runs + 1, redirects: s.redirects + round.redirectsUsed }));
      setRouteAttempts(round.drops);
      setResult(round);
      navigate('result');
    },
    [commit, daily.today, navigate, progress],
  );

  const handleAgain = useCallback(() => {
    setBoardKey(k => k + 1);
    navigate('game');
  }, [navigate]);

  const handleNextRoute = useCallback(() => {
    const next = Math.min(TOTAL_ROUTES - 1, activeRoute + 1);
    startRoute(next, false);
  }, [activeRoute, startRoute]);

  const handleSettingsChange = useCallback(
    (patch: Partial<Settings>) => {
      patchSettings(patch);
    },
    [patchSettings],
  );

  const handleReset = useCallback(() => {
    resetAll();
    setActiveRoute(0);
    setSession({ runs: 0, redirects: 0 });
    goMenu();
  }, [goMenu, resetAll]);

  const shards = useMemo(() => shardsEarned(threeStarCount(progress)), [progress]);
  const solvedRoutes = useMemo(() => progress.routes.filter(r => r.cleared).length, [progress]);
  const bestRedirects = useMemo(() => {
    const values = progress.routes
      .map(r => r.bestRedirects)
      .filter((v): v is number => v !== null);
    return values.length === 0 ? null : Math.min(...values);
  }, [progress]);

  let body: React.ReactNode = null;
  if (screen === 'loader') {
    body = <LoaderScreen onDone={goMenu} />;
  } else if (screen === 'menu') {
    body = (
      <MenuScreen
        activeRoute={activeRoute}
        solvedRoutes={solvedRoutes}
        bestRedirects={bestRedirects}
        shards={shards}
        onPlay={handlePlay}
        onChallenge={() => navigate('challenge')}
        onDaily={() => navigate('daily')}
        onProgress={() => navigate('progress')}
        onCollection={() => navigate('collection')}
        onSettings={() => navigate('settings')}
      />
    );
  } else if (screen === 'game') {
    body = (
      <GameScreen
        key={'board-' + boardKey}
        routeIndex={activeRoute}
        isDaily={isDaily}
        dailySeed={isDaily ? daily.seed : undefined}
        settings={derived}
        routePreview={progress.settings.routePreview}
        initialDrops={routeAttempts}
        onBack={goMenu}
        onGameOver={handleGameOver}
      />
    );
  } else if (screen === 'result' && result !== null) {
    body = (
      <ResultScreen
        result={result}
        bestRedirects={progress.routes[result.routeIndex]?.bestRedirects ?? null}
        shardUnlocked={shardUnlocked}
        reducedMotion={derived.reducedMotion}
        hasNextRoute={result.routeIndex + 1 < TOTAL_ROUTES}
        onAgain={handleAgain}
        onNextRoute={handleNextRoute}
        onMenu={goMenu}
      />
    );
  } else if (screen === 'challenge') {
    body = (
      <ChallengeScreen
        routes={progress.routes}
        activeRoute={activeRoute}
        sessionRuns={session.runs}
        sessionRedirects={session.redirects}
        recovered={recovered}
        onSelectRoute={index => startRoute(index, false)}
        onDismissError={dismissRecovered}
        onBack={goMenu}
      />
    );
  } else if (screen === 'progress') {
    body = <ProgressScreen routes={progress.routes} onPlay={handlePlay} onBack={goMenu} />;
  } else if (screen === 'collection') {
    body = (
      <CollectionScreen
        unlockedCount={shards}
        onChallenge={() => navigate('challenge')}
        onBack={goMenu}
      />
    );
  } else if (screen === 'daily') {
    body = (
      <DailyModeScreen
        routeIndex={dailyRouteIndex}
        seed={daily.seed}
        dateLabel={daily.dateLabel}
        countdown={daily.countdown}
        played={daily.played}
        history={daily.history}
        highContrast={derived.highContrast}
        onStart={handleStartDaily}
        onBack={goMenu}
      />
    );
  } else if (screen === 'settings') {
    body = (
      <SettingsScreen
        settings={progress.settings}
        onChange={handleSettingsChange}
        onReset={handleReset}
        onBack={goMenu}
      />
    );
  } else {
    body = <MenuScreen
      activeRoute={activeRoute}
      solvedRoutes={solvedRoutes}
      bestRedirects={bestRedirects}
      shards={shards}
      onPlay={handlePlay}
      onChallenge={() => navigate('challenge')}
      onDaily={() => navigate('daily')}
      onProgress={() => navigate('progress')}
      onCollection={() => navigate('collection')}
      onSettings={() => navigate('settings')}
    />;
  }

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      {/* box-none: the cross-fade wrapper must never swallow a press. */}
      <Animated.View pointerEvents="box-none" style={[styles.fill, { opacity: fade }]}>
        {body}
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: THEME.colors.bgDeep },
  fill: { flex: 1 },
});

export default App;
