"use client";

import { useCallback, useEffect, useState } from "react";
import type { Photo } from "@/domain/entities";

/** A masonry wall of real photos; clicking one opens it full screen (arrow keys move, Escape closes). */
export function Gallery({ photos }: { photos: Photo[] }) {
  const [open, setOpen] = useState<number | null>(null);

  const step = useCallback((delta: number) => setOpen((index) => (index === null ? null : (index + delta + photos.length) % photos.length)), [photos.length]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
      if (event.key === "ArrowRight") step(1);
      if (event.key === "ArrowLeft") step(-1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [open, step]);

  const current = open === null ? null : photos[open];

  return (
    <section id="gallery" className="gallery page-x" aria-labelledby="gallery-heading">
      <div className="section-head">
        <p className="eyebrow" data-reveal>Gallery</p>
        <h2 id="gallery-heading" className="display section-head__title" data-reveal>
          Deadpools in the wild
        </h2>
        <p className="section-head__lead" data-reveal style={{ "--d": 1 } as React.CSSProperties}>
          On film sets, red carpets and convention floors. Click any photo to see it full size.
        </p>
      </div>

      <ul className="gallery__grid">
        {photos.map((photo, index) => (
          <li key={photo.picture.src} className="gallery__item" data-reveal style={{ "--d": index % 3 } as React.CSSProperties}>
            <button type="button" className="gallery__button" onClick={() => setOpen(index)} aria-label={`Open photo: ${photo.caption}`}>
              <img src={photo.picture.src} width={photo.picture.width} height={photo.picture.height} alt={photo.picture.alt} loading="lazy" decoding="async" />
              <span className="gallery__caption">{photo.caption}</span>
            </button>
          </li>
        ))}
      </ul>

      {current && (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label={current.caption} onClick={() => setOpen(null)}>
          <figure className="lightbox__figure" onClick={(event) => event.stopPropagation()}>
            <img src={current.picture.src} width={current.picture.width} height={current.picture.height} alt={current.picture.alt} />
            <figcaption>
              <span>{current.caption}</span>
              <a href={current.source} target="_blank" rel="noreferrer">
                Photo: {current.credit}, {current.license}
              </a>
            </figcaption>
          </figure>
          <button type="button" className="lightbox__nav lightbox__nav--prev" onClick={(e) => (e.stopPropagation(), step(-1))} aria-label="Previous photo">
            ‹
          </button>
          <button type="button" className="lightbox__nav lightbox__nav--next" onClick={(e) => (e.stopPropagation(), step(1))} aria-label="Next photo">
            ›
          </button>
          <button type="button" className="lightbox__close" onClick={() => setOpen(null)} aria-label="Close">
            ×
          </button>
        </div>
      )}
    </section>
  );
}
