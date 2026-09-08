import Image from "next/image";
import { PageTitle } from "@/components/ui/PageTitle";
import { Ticker } from "@/components/chassis/Ticker";
import { ABOUT_HERO_PHOTOS } from "@/content/about";
import { tools } from "@/content/tools";
import { HERO_PHOTO, HERO_W } from "./aboutGeometry";

// About's hero (Figma "hero section", 523:6849), page "final". Figma's
// flat 850px — no viewport-fill here, unlike the homepage hero: About has
// no instruction in the file to fill the viewport, and the vertical rhythm
// (212px below the nav, 30px to the next section) is Figma's own, not
// derived from window height. Completely static: no hover, no magnet, no
// drag, no flip.
//
// No side padding on this wrapper — same pattern as Hero.tsx. The 868px
// title+photos column is centered independently via a fixed width; Ticker
// (reused unchanged, just a different `items` list) supplies its own
// 50px inset via its own internal px-xl.
export function AboutHero() {
  return (
    <div className="flex w-full flex-col items-center gap-3xl pt-4xl pb-lg">
      <div className="flex flex-col items-center gap-xl" style={{ width: HERO_W }}>
        <PageTitle>about.</PageTitle>

        <div className="flex items-center justify-center gap-xl">
          {ABOUT_HERO_PHOTOS.map((photo, index) => (
            <Image
              key={photo.src}
              src={photo.src}
              alt={photo.alt}
              width={HERO_PHOTO}
              height={HERO_PHOTO}
              priority={index === 0}
              loading={index === 0 ? undefined : "eager"}
              className="rounded-card object-cover"
            />
          ))}
        </div>
      </div>

      <Ticker items={tools} />
    </div>
  );
}
