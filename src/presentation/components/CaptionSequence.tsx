"use client";

import { useEffect, useRef, useState } from "react";

/** Deadpool's yellow caption boxes: they pop in one after another once the reader can see them. */
export function CaptionSequence({ captions, className, startDelay = 300 }: { captions: string[]; className?: string; startDelay?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [shown, setShown] = useState(0);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const timers: number[] = [];
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      observer.disconnect();
      captions.forEach((_, index) => timers.push(window.setTimeout(() => setShown(index + 1), startDelay + index * 1100)));
    });
    observer.observe(element);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, [captions, startDelay]);

  return (
    <div ref={ref} className={className} aria-live="polite">
      {captions.map((caption, index) => (
        <p key={caption} className={`caption-box${index < shown ? " is-shown" : ""}`} style={{ "--tilt": `${index % 2 ? 2.5 : -2}deg` } as React.CSSProperties}>
          {caption}
        </p>
      ))}
    </div>
  );
}
