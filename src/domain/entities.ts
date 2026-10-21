// Domain entities: plain data shapes. No React, no Next.js, no three.js.

export interface Picture {
  src: string;
  width: number;
  height: number;
  alt: string;
}

export interface NavLink {
  label: string;
  href: string;
}

export interface Hero {
  name: string;
  tagline: string;
  figure: Picture;
  captions: string[];
}

export interface Bio {
  heading: string;
  paragraphs: string[];
  facts: { label: string; value: string }[];
  captions: string[];
  photo: Photo;
}

/** One power in the pinned "powers" scroll; each one owns a 3D scene or the character himself. */
export interface Power {
  id: string;
  name: string;
  description: string;
  caption: string;
  visual: "healing" | "katanas" | "fourth-wall";
}

/** A real photograph, with the credit its licence asks for. */
export interface Photo {
  picture: Picture;
  caption: string;
  credit: string;
  license: string;
  source: string;
}

export interface Actor {
  name: string;
  heading: string;
  paragraphs: string[];
  photo: Photo;
}

export interface TimelineEntry {
  id: string;
  year: string;
  photo?: Photo;
  kind: "Comic" | "Film";
  title: string;
  blurb: string;
  href: string;
}

export interface Contender {
  id: string;
  name: string;
  /** Chimichangas already riding on this contender before the visitor arrives. */
  basePool: number;
  quip: string;
}
