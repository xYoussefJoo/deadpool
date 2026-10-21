"use client";

import { useEffect, useRef } from "react";
import type { Picture } from "@/domain/entities";

/** The character cut-out: leans toward the pointer and sinks slowly as the hero scrolls away. */
export function HeroFigure({ picture }: { picture: Picture }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let frame = 0;
    const target = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };

    const onPointer = (event: PointerEvent) => {
      target.x = event.clientX / window.innerWidth - 0.5;
      target.y = event.clientY / window.innerHeight - 0.5;
    };
    const loop = () => {
      current.x += (target.x - current.x) * 0.08;
      current.y += (target.y - current.y) * 0.08;
      const sink = Math.min(window.scrollY, window.innerHeight) * 0.25;
      element.style.transform = `translate3d(${current.x * -18}px, ${current.y * -10 + sink}px, 0) rotateY(${current.x * 8}deg) rotateX(${current.y * -4}deg)`;
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
    <div ref={ref} className="hero__figure">
      <img src={picture.src} width={picture.width} height={picture.height} alt={picture.alt} fetchPriority="high" decoding="async" />
    </div>
  );
}
