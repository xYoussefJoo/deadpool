"use client";

import { useEffect, useRef } from "react";
import type { Picture } from "@/domain/entities";

/** Breaking the fourth wall: he turns toward wherever the reader's cursor is. */
export function LookingFigure({ picture }: { picture: Picture }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    const onPointer = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      target.x = Math.max(-1, Math.min(1, (event.clientX - (rect.left + rect.width / 2)) / (rect.width * 1.2)));
      target.y = Math.max(-1, Math.min(1, (event.clientY - (rect.top + rect.height * 0.25)) / rect.height));
    };
    const loop = () => {
      current.x += (target.x - current.x) * 0.1;
      current.y += (target.y - current.y) * 0.1;
      element.style.transform = `rotateY(${current.x * 18}deg) rotateX(${current.y * -8}deg) translateX(${current.x * 12}px)`;
      frame = requestAnimationFrame(loop);
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    frame = requestAnimationFrame(loop);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onPointer);
    };
  }, []);

  return (
    <div className="looking">
      <div ref={ref} className="looking__figure">
        <img src={picture.src} width={picture.width} height={picture.height} alt="Deadpool turning to look straight at the reader" loading="lazy" decoding="async" />
      </div>
    </div>
  );
}
