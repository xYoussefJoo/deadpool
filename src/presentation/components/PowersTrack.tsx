"use client";

import { useEffect, useRef } from "react";

/**
 * Sideways track inside a pinned stage: vertical scroll through the tall wrapper moves the panels left.
 * On phones and with reduced motion the panels simply stack (CSS turns the pin off).
 */
export function PowersTrack({ count, children }: { count: number; children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const track = trackRef.current;
    const wrapper = track?.closest("[data-scene-root]") as HTMLElement | null;
    if (!track || !wrapper) return;
    const pinned = window.matchMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");

    let frame = 0;
    const update = () => {
      frame = 0;
      if (!pinned.matches) {
        track.style.transform = "";
        return;
      }
      const rect = wrapper.getBoundingClientRect();
      const progress = Math.min(Math.max(-rect.top / (rect.height - window.innerHeight), 0), 1);
      track.style.transform = `translate3d(${-progress * (count - 1) * 100}vw, 0, 0)`;
      wrapper.style.setProperty("--powers-progress", progress.toFixed(4));
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count]);

  return (
    <div className="powers__stage">
      <div ref={trackRef} className="powers__track" style={{ "--count": count } as React.CSSProperties}>
        {children}
      </div>
      <div className="powers__progress" aria-hidden="true">
        <span />
      </div>
    </div>
  );
}
