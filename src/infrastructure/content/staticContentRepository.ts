import type { ContentRepository } from "@/application/ports/contentRepository";
import type { Photo } from "@/domain/entities";

// The only content source for now: the copy lives in code.
// Swapping this for a CMS means writing another class that implements ContentRepository.

const WIKI = "https://en.wikipedia.org/wiki/";

/** Real, openly licensed photographs from Wikimedia Commons, each with the credit its licence asks for. */
const photos = {
  onSet: {
    picture: { src: "/assets/deadpool-georgia-viaduct-vancouver-april-6-2015.jpg", width: 1346, height: 1642, alt: "Deadpool standing on a car on the Georgia Viaduct in Vancouver while the first film was being shot" },
    caption: "On set: the Georgia Viaduct, Vancouver, April 2015",
    credit: "Flickr user 49347467@N05",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Deadpool,_Georgia_Viaduct,_Vancouver,_April_6_2015_-_3.jpg",
  },
  ryan: {
    picture: { src: "/assets/deadpool-2-japan-premiere-red-carpet-ryan.jpg", width: 1761, height: 2641, alt: "Ryan Reynolds smiling on the red carpet" },
    caption: "Ryan Reynolds at the Deadpool 2 premiere in Tokyo, 2018",
    credit: "Dick Thomas Johnson",
    license: "CC BY 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Deadpool_2_Japan_Premiere_Red_Carpet_Ryan_Reynolds_(cropped).jpg",
  },
  shush: {
    picture: { src: "/assets/supanova-2022-cosplay-of-deadpool-2.jpg", width: 1920, height: 1920, alt: "Deadpool holding a finger to his masked lips" },
    caption: "Shh. Spoilers.",
    credit: "Paul Carmona",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Supanova_2022_Cosplay_of_Deadpool_2.jpg",
  },
  thumbsTall: {
    picture: { src: "/assets/supanova-2022-cosplay-of-deadpool-3.jpg", width: 1920, height: 2879, alt: "Deadpool giving two thumbs up" },
    caption: "Two thumbs, both regrown",
    credit: "Paul Carmona",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Supanova_2022-Cosplay_of_Deadpool.jpg",
  },
  pointing: {
    picture: { src: "/assets/supanova-2022-cosplay-of-deadpool.jpg", width: 1920, height: 1920, alt: "Deadpool pointing straight at the camera" },
    caption: "Yes, you.",
    credit: "Paul Carmona",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Supanova_2022_Cosplay_of_Deadpool.jpg",
  },
  guns: {
    picture: { src: "/assets/cosplay-of-deadpool-at-the-2021-new.jpg", width: 1920, height: 2880, alt: "Deadpool raising two pistols with a pink backpack on" },
    caption: "New York Comic Con, 2021",
    credit: "Romer Jed Medina",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:Cosplay_of_Deadpool_at_the_2021_New_York_Comic_Con_(51573817204).jpg",
  },
  wolverine: {
    picture: { src: "/assets/deadpool-wolverine-cosplay.jpg", width: 1448, height: 2000, alt: "Deadpool and Wolverine squaring up in front of a cinema poster" },
    caption: "Deadpool vs Wolverine, round one",
    credit: "Igordebraga",
    license: "CC0",
    source: "https://commons.wikimedia.org/wiki/File:Deadpool_Wolverine_cosplay.jpg",
  },
  corps: {
    picture: { src: "/assets/san-diego-comic-con-2024-masquerade-deadpools.jpg", width: 1920, height: 1280, alt: "A crowd of Deadpools in different costumes on stage with one Wolverine" },
    caption: "The Deadpool Corps at San Diego Comic-Con, 2024",
    credit: "William Tung",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:San_Diego_Comic-Con_2024_Masquerade_-_Deadpools_and_Wolverine_4.jpg",
  },
  cable: {
    picture: { src: "/assets/sdcc-2017-cable-and-deadpool-cosplay-35308464974.jpg", width: 1920, height: 1280, alt: "Cable and Deadpool together at a convention" },
    caption: "Cable and Deadpool, San Diego, 2017",
    credit: "William Tung",
    license: "CC BY-SA 2.0",
    source: "https://commons.wikimedia.org/wiki/File:SDCC_2017_-_Cable_and_Deadpool_Cosplay_(35308464974).jpg",
  },
  panel: {
    picture: { src: "/assets/deadpool-wolverine-panel-by-gage-skidmore.jpg", width: 1920, height: 1313, alt: "Ryan Reynolds and Hugh Jackman on stage at the Deadpool & Wolverine Comic-Con panel" },
    caption: "Reynolds and Jackman at the Deadpool & Wolverine panel, 2024",
    credit: "Gage Skidmore",
    license: "CC BY-SA 3.0",
    source: "https://commons.wikimedia.org/w/index.php?curid=151598684",
  },
} satisfies Record<string, Photo>;

export class StaticContentRepository implements ContentRepository {
  getNavigation() {
    return [
      { label: "Who", href: "#who" },
      { label: "Powers", href: "#powers" },
      { label: "Gallery", href: "#gallery" },
      { label: "Films", href: "#timeline" },
      { label: "Dead pool", href: "#dead-pool" },
    ];
  }

  getHero() {
    return {
      name: "Deadpool",
      tagline: "The merc with a mouth. Healing factor, two katanas, zero filter.",
      figure: {
        src: "/assets/deadpool-cutout.webp",
        width: 799,
        height: 939,
        alt: "Deadpool in his red and black suit, a katana handle over his shoulder",
      },
      captions: ["Oh look. A website. About me.", "Scroll down. I dare you."],
    };
  }

  getBio() {
    return {
      heading: "The merc with a mouth",
      paragraphs: [
        "Wade Wilson was a mercenary with terminal cancer. Then a secret program called Weapon X offered him a cure.",
        "The cure worked a little too well. Every cell in his body now heals itself, his skin heals scarred, and his sense of humour never healed at all.",
        "He is also the only hero who knows he lives inside a comic book, and he talks to the reader about it. A lot.",
      ],
      facts: [
        { label: "Real name", value: "Wade Wilson" },
        { label: "First seen", value: "The New Mutants #98, 1991" },
        { label: "Created by", value: "Fabian Nicieza & Rob Liefeld" },
        { label: "Weakness", value: "Chimichangas, unicorns, his own voice" },
      ],
      captions: ["That's my good side.", "They're all my good side."],
      photo: photos.shush,
    };
  }

  getPowers() {
    return [
      {
        id: "healing",
        name: "Healing factor",
        description: "Cut him, shoot him, blow him to pieces: every cell grows back. Scroll and watch him put himself together.",
        caption: "Scroll slower. I'm regrowing.",
        visual: "healing" as const,
      },
      {
        id: "katanas",
        name: "Two katanas",
        description: "Carried crossed on his back, drawn together, cleaned never. Move your mouse to inspect the steel.",
        caption: "Careful. They're sharp. I'm not.",
        visual: "katanas" as const,
      },
      {
        id: "fourth-wall",
        name: "Breaking the fourth wall",
        description: "His real superpower: he knows he's a character. He knows you're there. He's looking at you right now.",
        caption: "Hi. Yes, you. Nice cursor.",
        visual: "fourth-wall" as const,
      },
    ];
  }

  getGallery() {
    return [photos.thumbsTall, photos.corps, photos.guns, photos.pointing, photos.wolverine, photos.cable, photos.onSet];
  }

  getActor() {
    return {
      name: "Ryan Reynolds",
      heading: "Behind the mask",
      paragraphs: [
        "Ryan Reynolds first played Wade Wilson in 2009, in a film that sewed the character's mouth shut. He spent the next seven years fighting to do it properly.",
        "When test footage leaked in 2014, the fans' reaction got the film made. He has played Deadpool in three films since, and co-wrote the last two.",
      ],
      photo: photos.ryan,
    };
  }

  getTimeline() {
    return [
      { id: "1991", year: "1991", kind: "Comic" as const, title: "The New Mutants #98", blurb: "First appearance, as a hired killer sent after Cable.", href: `${WIKI}Deadpool` },
      { id: "1997", year: "1997", kind: "Comic" as const, title: "Deadpool, ongoing", blurb: "Joe Kelly gives him the jokes, the guilt and the habit of talking to you.", href: `${WIKI}Deadpool` },
      { id: "2016", year: "2016", kind: "Film" as const, title: "Deadpool", blurb: "Shot in Vancouver. The suit is right, the mouth is back, the rating is R.", href: `${WIKI}Deadpool_(film)`, photo: photos.onSet },
      { id: "2018", year: "2018", kind: "Film" as const, title: "Deadpool 2", blurb: "Cable arrives. X-Force lasts about four minutes.", href: `${WIKI}Deadpool_2`, photo: photos.cable },
      { id: "2024", year: "2024", kind: "Film" as const, title: "Deadpool & Wolverine", blurb: "He drags Wolverine into the MCU and becomes the highest-grossing R-rated film ever.", href: `${WIKI}Deadpool_%26_Wolverine`, photo: photos.panel },
    ];
  }

  getContenders() {
    return [
      { id: "wolverine", name: "Wolverine", basePool: 4, quip: "He has a healing factor too. Terrible bet. I love it." },
      { id: "cable", name: "Cable", basePool: 9, quip: "He's from the future. He already knows how this ends. Cheater." },
      { id: "colossus", name: "Colossus", basePool: 6, quip: "Made of steel and good manners. The manners won't save him." },
      { id: "negasonic", name: "Negasonic Teenage Warhead", basePool: 7, quip: "Longest name on the board. Statistically doomed." },
      { id: "dopinder", name: "Dopinder", basePool: 12, quip: "Leave my driver out of this. Fine. Five chimichangas." },
      { id: "deadpool", name: "Deadpool", basePool: 2, quip: "Betting on me? I can't die. Easiest money you'll ever lose." },
      { id: "you", name: "You, the reader", basePool: 3, quip: "You put yourself on the board. Bold. I respect it." },
    ];
  }
}
