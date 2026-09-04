import Image from "next/image";

// Figma "photo album" component (307:155/441:5970). Geometry below is
// derived from the node's transforms — it's frame-specific pixel math, not
// a design token, so it's kept here as documented consts rather than in
// @theme. The component cycles through four photos on click starting at
// step 10; this build renders the static resting fan only (front-most
// three layers, per the "Default" variant).
const STACK_SIZE = { width: 289.293, height: 256 };

const PHOTO_LAYERS = [
  {
    src: "/photos/photo-03.jpg",
    alt: "Alice standing outdoors against a stone column, greenery in the background",
    size: 207.36,
    left: 75.97,
    top: 17.97,
    rotate: 3.4,
  },
  {
    src: "/photos/photo-02.jpg",
    alt: "Alice smiling in front of an ocean sunset",
    size: 230.4,
    left: 39.32,
    top: 6.32,
    rotate: 1.77,
  },
  {
    src: "/photos/photo-01.jpg",
    alt: "Alice Guo, wearing a maroon top, standing in a sunlit outdoor walkway",
    size: 256,
    left: 0,
    top: 0,
    rotate: 0,
  },
] as const;

export function PhotoStack() {
  return (
    <div className="relative" style={STACK_SIZE}>
      {PHOTO_LAYERS.map((layer, index) => {
        const isFront = index === PHOTO_LAYERS.length - 1;
        return (
          <div
            key={layer.src}
            className="absolute overflow-hidden rounded-card"
            style={{
              width: layer.size,
              height: layer.size,
              left: layer.left,
              top: layer.top,
              transform: `rotate(${layer.rotate}deg)`,
              boxShadow: isFront ? "var(--shadow-photo)" : undefined,
            }}
          >
            <Image
              src={layer.src}
              alt={layer.alt}
              fill
              sizes="256px"
              className="object-cover"
              priority={isFront}
              loading={isFront ? undefined : "eager"}
            />
          </div>
        );
      })}
    </div>
  );
}
