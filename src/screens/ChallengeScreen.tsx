import React, { useMemo, useState } from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { Play } from 'lucide-react-native';
import assets from '../assets';
import ChapterChips from '../components/ChapterChips';
import EmptyState from '../components/EmptyState';
import RouteTile, { type RouteTileState } from '../components/RouteTile';
import ScreenBackground from '../components/ScreenBackground';
import ScreenHeader from '../components/ScreenHeader';
import { CHAPTER_NAMES, ROUTES_PER_CHAPTER, TOTAL_ROUTES } from '../constants/config';
import THEME from '../constants/theme';
import { routeDescriptor } from '../game/levelGen';
import type { RouteRecord } from '../storage/progressStore';

interface Props {
  routes: RouteRecord[];
  activeRoute: number;
  sessionRuns: number;
  sessionRedirects: number;
  recovered: boolean;
  onSelectRoute: (index: number) => void;
  onDismissError: () => void;
  onBack: () => void;
}

export function ChallengeScreen({
  routes,
  activeRoute,
  sessionRuns,
  sessionRedirects,
  recovered,
  onSelectRoute,
  onDismissError,
  onBack,
}: Props) {
  const [chapter, setChapter] = useState(() => Math.floor(activeRoute / ROUTES_PER_CHAPTER));

  const clearedTotal = useMemo(() => routes.filter(r => r.cleared).length, [routes]);

  const unlockedChapters = useMemo(() => {
    let count = 1;
    for (let c = 0; c < CHAPTER_NAMES.length - 1; c++) {
      const start = c * ROUTES_PER_CHAPTER;
      const cleared = routes.slice(start, start + ROUTES_PER_CHAPTER).filter(r => r.cleared).length;
      if (cleared >= ROUTES_PER_CHAPTER) {count++;}
      else {break;}
    }
    return count;
  }, [routes]);

  const visible = useMemo(() => {
    const start = chapter * ROUTES_PER_CHAPTER;
    return routes.slice(start, start + ROUTES_PER_CHAPTER).map((record, i) => {
      const index = start + i;
      const state: RouteTileState = record.cleared ? 'cleared' : record.unlocked ? 'open' : 'locked';
      return { index, record, state, par: routeDescriptor(index).par };
    });
  }, [chapter, routes]);

  return (
    <ScreenBackground>
      <ScreenHeader
        title="CHALLENGE"
        subtitle="ROUTE SELECT"
        onBack={onBack}
        rightSlot={<Text style={styles.count}>{clearedTotal + '/' + TOTAL_ROUTES}</Text>}
      />

      <View style={styles.body}>
        {recovered ? (
          <EmptyState
            title="PROGRESS UNAVAILABLE"
            hint="The saved routes could not be read, so the run restarts at chapter one. Nothing else was lost."
            actionLabel="CONTINUE"
            onAction={onDismissError}
            ActionIcon={Play}
            accent={THEME.colors.tertiary}
          />
        ) : (
          <>
            <View style={styles.band}>
              <Image source={assets.iconPause} style={styles.bandMark} resizeMode="contain" />
              <View style={styles.bandChips}>
                <ChapterChips
                  chapters={CHAPTER_NAMES}
                  activeIndex={chapter}
                  unlockedCount={unlockedChapters}
                  onSelect={setChapter}
                />
              </View>
            </View>

            <View style={styles.grid}>
              {visible.map(entry => (
                <View key={entry.index} style={styles.cell}>
                  <RouteTile
                    index={entry.index}
                    par={entry.par}
                    stars={entry.record.stars}
                    state={entry.state}
                    onPress={onSelectRoute}
                  />
                </View>
              ))}
            </View>

            <Text style={styles.session}>
              {'SESSION - ' + sessionRuns + ' ROUTES RUN - ' + sessionRedirects + ' REDIRECTS SPENT'}
            </Text>
            <Text style={styles.hint}>TAP A ROUTE TO LOAD ITS BOARD AND START PLANNING</Text>
          </>
        )}
      </View>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  count: {
    color: THEME.colors.secondary,
    fontSize: 14,
    lineHeight: 18,
    fontWeight: '700',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  body: { flex: 1, padding: 16, gap: 14 },
  band: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bandMark: { width: 22, height: 22 },
  bandChips: { flex: 1 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  cell: { width: '31%', flexGrow: 1 },
  session: {
    marginTop: 4,
    color: THEME.colors.textSecondary,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '600',
    letterSpacing: 1,
    fontVariant: ['tabular-nums'],
  },
  hint: {
    color: THEME.colors.textMuted,
    fontSize: 11,
    lineHeight: 15,
    fontWeight: '500',
    letterSpacing: 1,
  },
});

export default ChallengeScreen;
