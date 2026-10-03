/**
 * The debug menu is available in development, and in production only when
 * NEXT_PUBLIC_DEBUG_MENU=1 is set (never set it for a public launch).
 */
export const debugEnabled: boolean =
  process.env.NODE_ENV !== 'production' || process.env.NEXT_PUBLIC_DEBUG_MENU === '1';
