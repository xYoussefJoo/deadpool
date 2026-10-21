import type { Hero as HeroContent } from "@/domain/entities";
import { CaptionSequence } from "@/presentation/components/CaptionSequence";
import { HeroFigure } from "@/presentation/components/HeroFigure";
import { ThreeStage } from "@/presentation/three/ThreeStage";

/**
 * The page opens behind a pane of glass: the fourth wall.
 * The hero stays pinned while scrolling cracks the glass and blows it toward the viewer.
 */
export function Hero({ hero }: { hero: HeroContent }) {
  return (
    <section id="top" className="hero" data-scene-root aria-labelledby="hero-name">
      <div className="hero__sticky">
        <h1 id="hero-name" className="hero__name">
          {hero.name}
        </h1>

        <HeroFigure picture={hero.figure} />

        <CaptionSequence className="hero__captions" captions={hero.captions} startDelay={900} />

        <div className="hero__foot page-x">
          <p className="hero__tagline">{hero.tagline}</p>
          <div className="hero__actions">
            <a className="button" href="#who">Meet Wade</a>
            <a className="button button--ghost" href="#dead-pool">Play the dead pool</a>
          </div>
          <p className="hero__hint">Scroll to break the fourth wall, or click the glass.</p>
        </div>

        <div className="hero__glass">
          <ThreeStage scene="fourth-wall" mode="pinned" />
        </div>
      </div>
    </section>
  );
}
