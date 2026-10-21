// The dead pool: the betting board Deadpool took his name from.
// Pure business rules, so they can be unit-tested without a browser.

import type { Contender } from "./entities";

export const STAKES = [1, 3, 5] as const;
export type Stake = (typeof STAKES)[number];

/** Chimichangas the visitor has placed, per contender id. */
export type Bets = Readonly<Record<string, number>>;

export interface BoardRow {
  contender: Contender;
  pool: number;
  /** Pari-mutuel odds: the whole pool divided by this contender's share, e.g. 4.2 means "4.2 to 1". */
  odds: number;
  yourStake: number;
}

export function placeBet(bets: Bets, contenderId: string, stake: Stake): Bets {
  if (!STAKES.includes(stake)) throw new RangeError(`Stake must be one of ${STAKES.join(", ")}.`);
  return { ...bets, [contenderId]: (bets[contenderId] ?? 0) + stake };
}

export function totalStaked(bets: Bets): number {
  return Object.values(bets).reduce((sum, stake) => sum + stake, 0);
}

export function buildBoard(contenders: readonly Contender[], bets: Bets): BoardRow[] {
  const pools = contenders.map((c) => c.basePool + (bets[c.id] ?? 0));
  const total = pools.reduce((sum, pool) => sum + pool, 0);

  return contenders.map((contender, index) => ({
    contender,
    pool: pools[index],
    odds: Math.round((total / pools[index]) * 10) / 10,
    yourStake: bets[contender.id] ?? 0,
  }));
}
