import { InlineLink } from "@/components/ui/InlineLink";
import { ColorReveal } from "@/components/motion/ColorReveal";
import type { AboutBodyPart } from "@/content/about";

// One "text with header" block (Figma 696:5291 etc.) — a mono header and a
// Satoshi body paragraph, gap-md between them. Header is stored all-caps in
// the content module and rendered verbatim here — no CSS text-transform.
//
// `filled` (session 5C) drives the body paragraph's color reveal via
// ColorReveal — see that component's own comment. Defaults to `true` so
// every existing caller (AboutFallbackRow, and any future one) keeps
// rendering fully revealed without having to know this prop exists;
// useAboutPin.ts's pinned branch is the only caller that ever passes
// `false`. Headers never fill — locked decision, no fill state for them.
//
// `data-about-block` (session 5C): the marker useAboutPin.ts's
// ResizeObserver-driven measure() queries to read this block's own
// vertical offset within the content column. Present unconditionally
// (harmless outside the pinned tree) rather than threaded as a prop, so
// this component doesn't need to know whether it's being measured.
export function TextBlock({
  header,
  body,
  filled = true,
}: {
  header: string;
  body: AboutBodyPart[];
  filled?: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-md" data-about-block>
      <p className="text-mono font-mono text-muted-gray">{header}</p>
      <ColorReveal filled={filled} className="text-body-large font-sans">
        {body.map((part, index) =>
          part.href ? (
            <InlineLink key={index} href={part.href} target="_blank" rel="noopener noreferrer">
              {part.text}
            </InlineLink>
          ) : (
            <span key={index}>{part.text}</span>
          ),
        )}
      </ColorReveal>
    </div>
  );
}
