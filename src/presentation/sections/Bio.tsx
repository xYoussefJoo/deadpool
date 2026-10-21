import type { Bio as BioContent } from "@/domain/entities";
import { CaptionSequence } from "@/presentation/components/CaptionSequence";

export function Bio({ bio }: { bio: BioContent }) {
  const { picture } = bio.photo;
  return (
    <section id="who" className="bio" aria-labelledby="bio-heading">
      <div className="bio__text">
        <p className="eyebrow" data-reveal>Who is he</p>
        <h2 id="bio-heading" className="display bio__heading" data-reveal>
          {bio.heading}
        </h2>
        {bio.paragraphs.map((paragraph, index) => (
          <p key={index} className="bio__paragraph" data-reveal style={{ "--d": index + 1 } as React.CSSProperties}>
            {paragraph}
          </p>
        ))}
        <dl className="bio__facts" data-reveal style={{ "--d": 4 } as React.CSSProperties}>
          {bio.facts.map((fact) => (
            <div key={fact.label}>
              <dt>{fact.label}</dt>
              <dd>{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <figure className="bio__portrait" data-reveal style={{ "--d": 2 } as React.CSSProperties}>
        <img src={picture.src} width={picture.width} height={picture.height} alt={picture.alt} loading="lazy" decoding="async" />
        <CaptionSequence className="bio__captions" captions={bio.captions} />
        <figcaption className="photo-credit">
          Photo: {bio.photo.credit}, {bio.photo.license}
        </figcaption>
      </figure>
    </section>
  );
}
