import { colors, layout, radius, spacing } from '@/theme';

const kebab = (s: string): string => s.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`);

/** Turns the tokens in theme.ts into CSS custom properties on :root. */
export function themeCss(): string {
  const vars: string[] = [];
  for (const [k, v] of Object.entries(colors)) vars.push(`--t-color-${kebab(k)}:${v}`);
  for (const [k, v] of Object.entries(radius)) vars.push(`--t-radius-${kebab(k)}:${v}px`);
  for (const [k, v] of Object.entries(spacing)) vars.push(`--t-space-${kebab(k)}:${v}px`);
  vars.push(`--t-layout-max-width:${layout.maxWidth}px`);
  return `:root{${vars.join(';')}}`;
}
