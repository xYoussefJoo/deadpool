import type { TimelineEntry } from "@/domain/entities";

/** His history as a row of cards: comics in red, films with a real photo from that era. */
export function Timeline({ entries }: { entries: TimelineEntry[] }) {
  return (
    <section id="timeline" className="timeline" aria-labelledby="timeline-heading">
      <div className="section-head page-x">
        <p className="eyebrow" data-reveal>Comics &amp; films</p>
        <h2 id="timeline-heading" className="display section-head__title" data-reveal>
          From panel to screen
        </h2>
        <p className="section-head__lead" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
          A one-off villain in 1991. The highest-grossing R-rated film ever in 2024. Drag sideways.
        </p>
      </div>
      <ol className="timeline__row page-x">
        {entries.map((entry, index) => (
          <li key={entry.id} className={`card${entry.photo ? " card--photo" : ""}`} data-reveal style={{ "--d": index % 4 } as React.CSSProperties}>
            <a href={entry.href} target="_blank" rel="noreferrer" className="card__link">
              {entry.photo && (
                <img src={entry.photo.picture.src} width={entry.photo.picture.width} height={entry.photo.picture.height} alt={entry.photo.picture.alt} loading="lazy" decoding="async" />
              )}
              <span className="card__body">
                <span className="card__kind">{entry.kind}</span>
                <span className="card__year">{entry.year}</span>
                <span className="card__title">{entry.title}</span>
                <span className="card__blurb">{entry.blurb}</span>
                <span className="card__more">Read more →</span>
              </span>
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
