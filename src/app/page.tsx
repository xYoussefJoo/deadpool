import { getLandingPage } from "@/application/getLandingPage";
import { StaticContentRepository } from "@/infrastructure/content/staticContentRepository";
import { RevealOnScroll } from "@/presentation/components/RevealOnScroll";
import { SiteHeader } from "@/presentation/components/SiteHeader";
import { Actor } from "@/presentation/sections/Actor";
import { Bio } from "@/presentation/sections/Bio";
import { DeadPoolBoard } from "@/presentation/sections/DeadPoolBoard";
import { Footer } from "@/presentation/sections/Footer";
import { Gallery } from "@/presentation/sections/Gallery";
import { Hero } from "@/presentation/sections/Hero";
import { MaximumEffort } from "@/presentation/sections/MaximumEffort";
import { Powers } from "@/presentation/sections/Powers";
import { Timeline } from "@/presentation/sections/Timeline";

// Composition root: the only place that knows which content source is used.
export default function Home() {
  const page = getLandingPage(new StaticContentRepository());

  return (
    <>
      <SiteHeader navigation={page.navigation} />
      <main>
        <Hero hero={page.hero} />
        <Bio bio={page.bio} />
        <Powers powers={page.powers} figure={page.hero.figure} />
        <Gallery photos={page.gallery} />
        <Actor actor={page.actor} />
        <Timeline entries={page.timeline} />
        <DeadPoolBoard contenders={page.contenders} />
        <MaximumEffort />
      </main>
      <Footer photos={page.credits} />
      <RevealOnScroll />
    </>
  );
}
