import type { Actor, Bio, Contender, Hero, NavLink, Photo, Power, TimelineEntry } from "@/domain/entities";

/** What the landing page needs from a content source. Infrastructure implements it. */
export interface ContentRepository {
  getNavigation(): NavLink[];
  getHero(): Hero;
  getBio(): Bio;
  getPowers(): Power[];
  getGallery(): Photo[];
  getActor(): Actor;
  getTimeline(): TimelineEntry[];
  getContenders(): Contender[];
}
