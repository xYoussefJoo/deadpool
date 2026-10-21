"use client";

import { useEffect, useRef, useState } from "react";
import type { SceneController, SceneFactory } from "./types";

const loaders = {
  "fourth-wall": () => import("./fourthWallScene").then((m) => m.createFourthWallScene),
  healing: () => import("./healingFactorScene").then((m) => m.createHealingFactorScene),
  katanas: () => import("./katanaScene").then((m) => m.createKatanaScene),
} satisfies Record<string, () => Promise<SceneFactory>>;

export type SceneName = keyof typeof loaders;

/**
 * How scroll turns into the scene's 0..1 progress:
 * - "pinned": through a tall [data-scene-root] wrapper whose content is sticky (0 at its top, 1 at its end)
 * - "enter": as the [data-scene-root] arrives (0 when its top meets the bottom of the screen, 1 near the top)
 * - "horizontal": how centred the canvas is across the screen, for panels in a sideways track
 */
type ProgressMode = "pinned" | "enter" | "horizontal";

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(canvas.getContext("webgl2") ?? canvas.getContext("webgl"));
  } catch {
    return false;
  }
}

/** Hosts one three.js scene: loads it lazily, sizes it, feeds it scroll and pointer, and pauses it off screen. */
export function ThreeStage({ scene, label, mode }: { scene: SceneName; label?: string; mode: ProgressMode }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const root = (canvas.closest("[data-scene-root]") as HTMLElement | null) ?? canvas;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let controller: SceneController | null = null;
    let frame = 0;
    let visible = false;
    let cancelled = false;
    const start = performance.now();

    const measureProgress = () => {
      const viewport = window.innerHeight;
      if (mode === "horizontal") {
        const rect = canvas.getBoundingClientRect();
        const offCentre = Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2) / window.innerWidth;
        return 1 - offCentre * 1.6;
      }
      const rect = root.getBoundingClientRect();
      if (mode === "pinned") return -rect.top / Math.max(1, rect.height - viewport);
      return (viewport - rect.top) / (viewport * 0.85);
    };

    const tick = () => {
      if (!controller) return;
      controller.setProgress(reducedMotion ? (mode === "pinned" ? 0 : 1) : measureProgress());
      controller.render((performance.now() - start) / 1000);
      if (visible && !reducedMotion) frame = requestAnimationFrame(tick);
    };

    const toStage = (event: MouseEvent | PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return [((event.clientX - rect.left) / rect.width) * 2 - 1, ((event.clientY - rect.top) / rect.height) * -2 + 1] as const;
    };
    const onPointer = (event: PointerEvent) => controller?.setPointer(...toStage(event));
    const onClick = (event: MouseEvent) => {
      if ((event.target as HTMLElement).closest("a, button")) return;
      controller?.hit?.(...toStage(event));
      if (reducedMotion) tick();
    };

    const resizeObserver = new ResizeObserver(([entry]) => {
      controller?.resize(entry.contentRect.width, entry.contentRect.height);
      if (controller && reducedMotion) tick();
    });
    const visibilityObserver = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      cancelAnimationFrame(frame);
      if (visible) tick();
    });

    loaders[scene]()
      .then((create) => {
        if (cancelled) return;
        if (!supportsWebGL()) throw new Error("WebGL is not available");
        controller = create(canvas);
        const rect = canvas.getBoundingClientRect();
        controller.resize(rect.width, rect.height);
        resizeObserver.observe(canvas);
        visibilityObserver.observe(canvas);
        window.addEventListener("pointermove", onPointer, { passive: true });
        root.addEventListener("click", onClick);
        tick();
      })
      .catch(() => setFailed(true));

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      visibilityObserver.disconnect();
      window.removeEventListener("pointermove", onPointer);
      root.removeEventListener("click", onClick);
      controller?.dispose();
    };
  }, [scene, mode]);

  if (failed) return label ? <p className="stage-fallback">{label}</p> : null;
  return label ? <canvas ref={canvasRef} role="img" aria-label={label} /> : <canvas ref={canvasRef} aria-hidden="true" />;
}
