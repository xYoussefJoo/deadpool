import type { Picture, Power } from "@/domain/entities";
import { PowersTrack } from "@/presentation/components/PowersTrack";
import { LookingFigure } from "@/presentation/components/LookingFigure";
import { ThreeStage } from "@/presentation/three/ThreeStage";

const SCENE_LABELS = {
  healing: "A red mass of shattered fragments knitting itself back together",
  katanas: "Two katanas crossing into an X, polished steel catching the light",
};

/** Three powers, one screen each, travelling sideways while the page holds still. */
export function Powers({ powers, figure }: { powers: Power[]; figure: Picture }) {
  return (
    <section id="powers" className="powers" data-scene-root aria-labelledby="powers-heading">
      <h2 id="powers-heading" className="sr-only">
        Powers
      </h2>
      <PowersTrack count={powers.length}>
        {powers.map((power) => (
          <article key={power.id} className={`power power--${power.id}`} aria-labelledby={`power-${power.id}`}>
            <div className="power__text">
              <p className="power__kicker">Power</p>
              <h3 id={`power-${power.id}`} className="display power__name">
                {power.name}
              </h3>
              <p className="power__description">{power.description}</p>
              <p className="caption-box is-shown power__caption">{power.caption}</p>
            </div>
            <div className="power__visual">
              {power.visual === "fourth-wall" ? (
                <LookingFigure picture={figure} />
              ) : (
                <ThreeStage scene={power.visual} mode="horizontal" label={SCENE_LABELS[power.visual]} />
              )}
            </div>
          </article>
        ))}
      </PowersTrack>
    </section>
  );
}
