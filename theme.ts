/**
 * Design tokens for the Kaizen app (Next.js PWA).
 * Every colour, size and spacing value in the app comes from here: map these into
 * tailwind.config.ts and CSS variables. No hardcoded hex values in components.
 */

export const colors = {
  // Surfaces
  background: '#F5F1E8', // warm paper, the app's base
  surface: '#FFFDF8', // cards on paper
  surfaceMuted: '#EFEADF', // quiet blocks, collapsed rows, reward panel
  surfaceSunken: '#EAE3D5', // progress track, toggle background

  // Ink
  text: '#1C1B19',
  textSecondary: '#5E5A52',
  textMuted: '#8A847A',

  // Lines
  border: '#DDD5C5',
  borderStrong: '#CFC7B6',
  borderDashed: '#B9B09E',
  divider: '#EAE3D5',

  // Accent (the one accent colour: done, primary actions, selection)
  accent: '#2F4B6E',
  accentDeep: '#1F3450',
  accentSoft: '#9DB0C7', // partly
  accentBg: '#E4EAF1', // informational cards
  accentBgStrong: '#EEF2F7', // selected cards
  accentBorder: '#C9D4E1',
  onAccent: '#FFFFFF',

  // Positive (earned rewards, confirmations, quick wins only)
  positive: '#2C5626',
  positiveDeep: '#1F3F1B',
  positiveBorder: '#4E7F45',
  positiveBg: '#E3EDDF',

  // Warm clay — "on a bad day" context ONLY. Never an error colour.
  clay: '#7A3317',
  clayBorder: '#B5613C',
  clayBg: '#F6E3D8',

  // Genuine errors only (validation), never for missed days
  error: '#A23B2A',
} as const;

/** Loaded with next/font/google and exposed as CSS variables. */
export const fonts = {
  display: 'var(--font-shippori), Georgia, serif', // steps, goals, headlines
  body: 'var(--font-plex), system-ui, sans-serif',
} as const;

export const weight = {
  regular: 400,
  medium: 500,
  semibold: 600,
} as const;

/** Display sizes use the serif; the rest use the sans. */
export const type = {
  display: { fontFamily: fonts.display, fontSize: 28, lineHeight: 35 },
  displaySmall: { fontFamily: fonts.display, fontSize: 20, lineHeight: 26 },
  step: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30 },
  quote: { fontFamily: fonts.display, fontSize: 17, lineHeight: 25 },
  body: { fontFamily: fonts.body, fontSize: 15, lineHeight: 23 },
  bodyStrong: { fontFamily: fonts.bodyMedium, fontSize: 15, lineHeight: 23 },
  button: { fontFamily: fonts.bodyMedium, fontSize: 16, lineHeight: 20 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  stat: { fontFamily: fonts.bodyMedium, fontSize: 26, lineHeight: 30 },
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  xxl: 28,
  screenX: 24, // horizontal screen padding
  screenTop: 56,
} as const;

export const radius = {
  sm: 10,
  md: 12,
  lg: 14,
  xl: 16,
  pill: 999,
} as const;

/** Minimum touch target, enforced on every interactive element. */
export const touchTarget = 44;

/** Phone-shaped layout: the app centres on wider screens. */
export const layout = {
  designWidth: 390,
  maxWidth: 430,
} as const;

/** Manifest values, kept here so the installed app matches the UI. */
export const manifest = {
  name: 'Kaizen',
  themeColor: colors.background,
  backgroundColor: colors.background,
  display: 'standalone',
} as const;

export const controlHeight = {
  input: 48,
  segment: 44,
  primary: 54,
} as const;

/** Check-in status styling, used by the week strip, month grid and answer buttons. */
export const checkinStatus = {
  done: { fill: colors.accent, border: 'none', label: 'Done' },
  partly: { fill: colors.accentSoft, border: 'none', label: 'Partly' },
  not_today: {
    fill: 'transparent',
    border: `1.5px solid ${colors.borderDashed}`,
    label: 'Not today',
  },
  today: {
    fill: 'transparent',
    border: `1.5px dashed ${colors.accent}`,
    label: 'Today',
  },
} as const;

/** No drop shadows anywhere. Selection is shown with an inset ring. */
export const selectionRing = `inset 0 0 0 1px ${colors.accent}`;
