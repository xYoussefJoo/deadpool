import type { Photo } from "@/domain/entities";

export function Footer({ photos }: { photos: Photo[] }) {
  return (
    <footer className="footer page-x">
      <p className="footer__mark display" aria-hidden="true">
        Deadpool
      </p>
      <div className="footer__grid">
        <p className="footer__legal">
          An unofficial fan page made for practice. Deadpool and all related characters belong to Marvel and Disney. This page is
          not affiliated with or endorsed by them.
        </p>
        <div>
          <p className="footer__label">Photo credits</p>
          <ul className="footer__credits">
            {photos.map((photo) => (
              <li key={photo.picture.src}>
                <a href={photo.source} target="_blank" rel="noreferrer">
                  {photo.caption}
                </a>{" "}
                by {photo.credit}, {photo.license}
              </li>
            ))}
            <li>Hero image: Marvel Studios promotional still</li>
          </ul>
        </div>
      </div>
    </footer>
  );
}
