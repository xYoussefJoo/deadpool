const PHRASE = ["Maximum effort", "Maximum effort", "Maximum effort", "Maximum effort"];

/** The finale: his catchphrase running across the screen in two directions. */
export function MaximumEffort() {
  return (
    <section className="finale" aria-labelledby="finale-heading">
      <div className="marquee" aria-hidden="true">
        <div className="marquee__line">
          {[...PHRASE, ...PHRASE].map((word, index) => (
            <span key={index} className={index % 2 ? "is-outline" : ""}>
              {word}
            </span>
          ))}
        </div>
      </div>

      <div className="finale__centre page-x">
        <h2 id="finale-heading" className="display finale__heading" data-reveal>
          Still here? Respect.
        </h2>
        <div className="finale__actions" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
          <a className="button" href="https://en.wikipedia.org/wiki/Deadpool" target="_blank" rel="noreferrer">
            Read his full history
          </a>
          <a className="button button--ghost" href="#top">
            Rebuild the fourth wall
          </a>
        </div>
      </div>

      <div className="marquee marquee--reverse" aria-hidden="true">
        <div className="marquee__line">
          {[...PHRASE, ...PHRASE].map((word, index) => (
            <span key={index} className={index % 2 ? "" : "is-outline"}>
              {word}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
