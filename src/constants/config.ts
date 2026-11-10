import { Dimensions } from 'react-native';

/**
 * Loader hold. MUST stay 8000 — the UI harness needs 4-6 s to reach its first
 * screenshot, so anything shorter races the capture window and the Loader
 * never lands in a review frame.
 */
export const LOADER_DURATION_MS = 8000;

/** Board geometry (see PegBoard — overflow must stay <= 2px). */
export const LANES = 9;
export const ROWS = 8;
export const PAD = 10;
export const BORDER = 2;
export const BOARD_FRAME = PAD + BORDER; // 12
export const SLOT_H = 46;
export const ENTRY_LANE = 4;

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

/**
 * The tile is bounded by BOTH axes: nine lanes must fit the width and eight
 * rows plus the slot row must fit between the header and the floating control
 * bar. Deriving it this way keeps board overflow at zero on short screens.
 */
export const BOARD_MAX_W = Math.min(SCREEN_W - 32, 380);
// header + hint + funnel + the floating bar's reserved 108 + breathing room
const STAGE_CHROME_H = 44 + 72 + 28 + 40 + 108 + 24;
const BOARD_MAX_H = Math.max(200, SCREEN_H - STAGE_CHROME_H);
export const TILE = Math.max(
  26,
  Math.min(
    Math.floor((BOARD_MAX_W - 2 * BOARD_FRAME) / LANES),
    Math.floor((BOARD_MAX_H - 2 * BOARD_FRAME - SLOT_H) / ROWS),
  ),
);
export const BOARD_W = TILE * LANES + 2 * BOARD_FRAME;
export const BOARD_H = TILE * ROWS + 2 * BOARD_FRAME + SLOT_H;

export const PEG_SIZE = Math.min(18, Math.round(TILE * 0.46));
export const ORB_SIZE = Math.min(24, Math.round(TILE * 0.58));
export const GATE_SIZE = Math.min(28, Math.round(TILE * 0.72));

/** Drop pacing. A full 8-row fall is ~1.3 s at NORMAL. */
export const DROP_SPEEDS = { SLOW: 220, NORMAL: 150, FAST: 95 } as const;
export type DropSpeed = keyof typeof DROP_SPEEDS;
export const DEFAULT_DROP_SPEED: DropSpeed = 'NORMAL';
export const RESULT_DELAY_MS = 650;
export const SETTLE_MS = 220;

/** Resources — fictional, no money anywhere in this app. */
export const CHARGE_QUOTA = 5;
export const SCANS_PER_ROUTE = 2;
export const DAILY_SCANS = 1;
export const SCAN_VISIBLE_MS = 4000;
export const TRAIL_LENGTH = 6;

/** Progression. */
export const CHAPTER_COUNT = 4;
export const ROUTES_PER_CHAPTER = 6;
export const TOTAL_ROUTES = CHAPTER_COUNT * ROUTES_PER_CHAPTER; // 24
export const TOTAL_STARS = TOTAL_ROUTES * 3; // 72
export const TOTAL_SHARDS = 12;
export const ROUTES_PER_SHARD = 2;

export const CHAPTER_NAMES = ['PRISM', 'REFRACTION', 'SPLIT', 'APEX'] as const;

/** Header inset — status bar safe area, every screen uses the same value. */
export const HEADER_TOP = 44;
export const HEADER_H = 72;

/** Generation guards — keeps level generation off the ANR path. */
export const MAX_GEN_ATTEMPTS = 20;
export const MAX_SOLVER_NODES = 12000;
export const MAX_SOLVER_DEPTH = 3;

/** Board geometry helpers — shared by PegBoard, Orb and the drop animation. */
export function pegCenterX(col: number): number {
  return BOARD_FRAME + col * TILE + TILE / 2;
}

export function pegCenterY(row: number): number {
  return BOARD_FRAME + row * TILE + TILE / 2;
}

/** row -1 is the funnel mouth, row === ROWS is the middle of the slot row. */
export function orbCenterY(row: number): number {
  if (row < 0) {return BOARD_FRAME - TILE / 2 + 6;}
  if (row >= ROWS) {return BOARD_FRAME + ROWS * TILE + SLOT_H / 2;}
  return pegCenterY(row);
}

export function slotCenterX(lane: number): number {
  return pegCenterX(lane);
}
