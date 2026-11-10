/**
 * CYBERPUNK preset — HUD / SCI-FI FUI.
 * Thin line frames, corner brackets, glow-outline instead of fill-shadow,
 * monospace (tabular) numerics.
 */
export const THEME = {
  name: 'CYBERPUNK',

  colors: {
    bgDeep: '#0A0014',
    bgMid: '#120026',
    surface: '#1A0038',
    surfaceAlt: '#0D1B2A',

    primary: '#8B00FF',
    primaryDim: '#5A00B8',
    secondary: '#00D4FF',
    tertiary: '#FF2FB9',

    textPrimary: '#F2EAFF',
    textSecondary: '#A89BC4',
    textMuted: '#6E6190',
    white: '#FFFFFF',

    glass: 'rgba(255,255,255,0.05)',
    glassStrong: 'rgba(255,255,255,0.09)',
    border: 'rgba(255,255,255,0.10)',
    hudBorder: 'rgba(0,212,255,0.30)',
    hairline: 'rgba(0,212,255,0.18)',
    headerFill: 'rgba(0,0,0,0.32)',
    track: 'rgba(255,255,255,0.08)',
    slotIdle: 'rgba(255,255,255,0.04)',
    boardFill: 'rgba(10,0,20,0.72)',
    barFill: 'rgba(10,0,20,0.88)',
  },

  // The three spectrum tints a prism node can impart.
  tints: {
    violet: '#8B00FF',
    cyan: '#00D4FF',
    magenta: '#FF2FB9',
  },

  gradients: {
    loader: ['#05000C', '#0A0014', '#120026'],
    menuOverlay: ['rgba(10,0,20,0.62)', 'rgba(18,0,38,0.86)'],
    screenOverlay: ['rgba(10,0,20,0.72)', 'rgba(18,0,38,0.90)'],
    resultOverlay: ['rgba(10,0,20,0.90)', 'rgba(5,0,12,0.94)'],
    play: ['#8B00FF', '#5A00B8'],
    beam: ['#8B00FF', '#00D4FF'],
    charge: ['#00D4FF', '#FF2FB9'],
  },

  radius: { sm: 10, md: 14, lg: 18, xl: 22 },

  spacing: { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 },

  // Five typographic levels. Nothing sentence-length below 13, captions >= 10.
  type: {
    hero: { fontSize: 40, fontWeight: '800' as const, letterSpacing: 4 },
    title: { fontSize: 26, fontWeight: '800' as const, letterSpacing: 3 },
    section: { fontSize: 15, fontWeight: '700' as const, letterSpacing: 2 },
    body: { fontSize: 13, fontWeight: '500' as const, letterSpacing: 0 },
    caption: { fontSize: 11, fontWeight: '600' as const, letterSpacing: 2 },
  },

  numeric: { fontVariant: ['tabular-nums' as const], letterSpacing: 1 },

  glow: (color: string) => ({
    shadowColor: color,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 0 },
    elevation: 10,
  }),

  softGlow: (color: string) => ({
    shadowColor: color,
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 0 },
    elevation: 8,
  }),

  spring: {
    press: { tension: 300, friction: 12 },
    card: { tension: 60, friction: 9 },
    pop: { tension: 48, friction: 8 },
  },
} as const;

export type TintKey = keyof typeof THEME.tints;
export const TINT_KEYS: TintKey[] = ['violet', 'cyan', 'magenta'];
export const TINT_LABEL: Record<TintKey, string> = {
  violet: 'VIOLET',
  cyan: 'AZURE',
  magenta: 'MAGENTA',
};

export default THEME;
