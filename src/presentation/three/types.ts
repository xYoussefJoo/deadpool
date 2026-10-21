/** What every three.js scene exposes to the React stage that hosts it. */
export interface SceneController {
  /** 0..1, driven by scroll. What it means is up to the scene. */
  setProgress(progress: number): void;
  /** -1..1 on both axes, from the pointer position over the stage. */
  setPointer(x: number, y: number): void;
  /** Optional: a click on the stage, -1..1 on both axes. */
  hit?(x: number, y: number): void;
  resize(width: number, height: number): void;
  render(timeSeconds: number): void;
  dispose(): void;
}

export type SceneFactory = (canvas: HTMLCanvasElement) => SceneController;
