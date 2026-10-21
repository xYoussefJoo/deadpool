"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Contender } from "@/domain/entities";
import { buildBoard, placeBet, STAKES, totalStaked, type Stake } from "@/domain/deadPool";
import { betsStore } from "@/infrastructure/storage/betsStore";

/**
 * The live thing: the betting board at the bar where Wade drinks.
 * Rows are the index; the yellow slip follows the row you point at or pick.
 */
export function DeadPoolBoard({ contenders }: { contenders: Contender[] }) {
  const bets = useSyncExternalStore(betsStore.subscribe, betsStore.getSnapshot, betsStore.getServerSnapshot);
  const [selectedId, setSelectedId] = useState(contenders[0].id);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [stake, setStake] = useState<Stake>(STAKES[0]);
  const [justPlaced, setJustPlaced] = useState(false);
  const rowRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const slipRef = useRef<HTMLElement>(null);

  const focusId = hoveredId ?? selectedId;
  const board = buildBoard(contenders, bets);
  const focused = board.find((row) => row.contender.id === focusId)!;

  // Keep the slip level with the row it talks about (desktop only; on small screens it sits under the list).
  useEffect(() => {
    const row = rowRefs.current[focusId];
    const slip = slipRef.current;
    if (!row || !slip) return;
    const top = window.matchMedia("(min-width: 1024px)").matches ? row.offsetTop + row.offsetHeight / 2 - 80 : 0;
    slip.style.setProperty("--slip-top", `${Math.max(0, top)}px`);
  }, [focusId]);

  const onPlaceBet = () => {
    betsStore.save(placeBet(bets, selectedId, stake));
    setJustPlaced(true);
  };

  return (
    <section id="dead-pool" className="pool page-x" aria-labelledby="pool-heading">
      <div className="pool__intro">
        <h2 id="pool-heading" className="display pool__heading" data-reveal>
          The dead pool
        </h2>
        <p className="pool__lead" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
          The bar where Wade drinks keeps a board of who dies next. That&rsquo;s where his name comes from. Pick a name, stake
          some chimichangas and watch the odds move.
        </p>
      </div>

      <div className="pool__board" onMouseLeave={() => setHoveredId(null)}>
        <ul className="pool__list">
          {board.map(({ contender, odds, yourStake }) => (
            <li key={contender.id}>
              <button
                ref={(element) => {
                  rowRefs.current[contender.id] = element;
                }}
                type="button"
                className="pool__row"
                aria-pressed={contender.id === selectedId}
                onClick={() => {
                  setSelectedId(contender.id);
                  setJustPlaced(false);
                }}
                onMouseEnter={() => setHoveredId(contender.id)}
                onFocus={() => setHoveredId(contender.id)}
                onBlur={() => setHoveredId(null)}
              >
                <span>{contender.name}</span>
                <span className="pool__odds">
                  {odds.toFixed(1)} to 1{yourStake > 0 ? ` · yours: ${yourStake}` : ""}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <aside ref={slipRef} className="pool__slip" aria-live="polite">
        <p className="pool__slip-name">{focused.contender.name}</p>
        <p className="pool__quip">
          {justPlaced && focusId === selectedId ? "Bet's in. No refunds, no take-backs, no crying." : focused.contender.quip}
        </p>
        <div className="pool__stakes" role="group" aria-label="Stake in chimichangas">
          {STAKES.map((value) => (
            <button key={value} type="button" className="pool__stake" aria-pressed={value === stake} onClick={() => setStake(value)}>
              {value} {value === 1 ? "chimichanga" : "chimichangas"}
            </button>
          ))}
        </div>
        <button type="button" className="button button--dark" onClick={onPlaceBet}>
          Bet on {contenders.find((c) => c.id === selectedId)!.name.split(",")[0]}
        </button>
        <p className="pool__total">You have {totalStaked(bets)} chimichangas on the board.</p>
      </aside>
    </section>
  );
}
