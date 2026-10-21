import type { Actor as ActorContent } from "@/domain/entities";

export function Actor({ actor }: { actor: ActorContent }) {
  const { picture } = actor.photo;
  return (
    <section className="actor" aria-labelledby="actor-heading">
      <figure className="actor__photo" data-reveal>
        <img src={picture.src} width={picture.width} height={picture.height} alt={picture.alt} loading="lazy" decoding="async" />
        <figcaption className="photo-credit">
          {actor.photo.caption}. Photo: {actor.photo.credit}, {actor.photo.license}
        </figcaption>
      </figure>
      <div className="actor__text">
        <p className="eyebrow" data-reveal>{actor.heading}</p>
        <h2 id="actor-heading" className="display actor__name" data-reveal>
          {actor.name}
        </h2>
        {actor.paragraphs.map((paragraph, index) => (
          <p key={index} className="actor__paragraph" data-reveal style={{ "--d": index + 1 } as React.CSSProperties}>
            {paragraph}
          </p>
        ))}
        <p className="caption-box is-shown actor__caption" data-reveal style={{ "--d": 3 } as React.CSSProperties}>
          He&rsquo;s fine. I&rsquo;m better looking.
        </p>
      </div>
    </section>
  );
}
