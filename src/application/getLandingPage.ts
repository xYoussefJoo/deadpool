import type { Photo } from "@/domain/entities";
import type { ContentRepository } from "./ports/contentRepository";

/** Use case: gather everything the landing page shows, in the order the page tells it. */
export function getLandingPage(repository: ContentRepository) {
  const bio = repository.getBio();
  const gallery = repository.getGallery();
  const actor = repository.getActor();
  const timeline = repository.getTimeline();

  // Every photo shown anywhere on the page, once, so the footer can credit all of them.
  const shown = [bio.photo, actor.photo, ...gallery, ...timeline.flatMap((entry) => (entry.photo ? [entry.photo] : []))];
  const credits = [...new Map(shown.map((photo): [string, Photo] => [photo.picture.src, photo])).values()];

  return {
    navigation: repository.getNavigation(),
    hero: repository.getHero(),
    bio,
    powers: repository.getPowers(),
    gallery,
    actor,
    timeline,
    contenders: repository.getContenders(),
    credits,
  };
}

export type LandingPage = ReturnType<typeof getLandingPage>;
