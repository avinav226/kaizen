import type { Frequency, ISODate } from './types';

export type Rung = 'longTerm' | 'milestone' | 'step' | 'planB';

/** Every rung has several versions the user can cycle through. */
export interface LadderVersions {
  longTerm: string[];
  milestone: string[];
  step: string[];
  planB: string[];
  milestoneDue: ISODate;
}

export interface LadderChoice {
  longTerm: string;
  milestone: string;
  milestoneDue: ISODate;
  step: string;
  planB: string;
  frequency: Frequency;
  source: 'ai' | 'fallback' | 'user';
}
