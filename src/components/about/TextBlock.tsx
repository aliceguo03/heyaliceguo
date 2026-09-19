import { InlineLink } from "@/components/ui/InlineLink";
import { ColorReveal } from "@/components/motion/ColorReveal";
import type { AboutBodyPart } from "@/content/about";

// One "text with header" block (Figma 696:5291 etc.) — a mono header and a
// Satoshi body paragraph, gap-md between them. Header is stored all-caps in
// the content module and rendered verbatim here — no CSS text-transform.
//
// `filled` (session 5C) drives the body paragraph's color reveal via
// ColorReveal — see that component's own comment. Defaults to `true` so
// every existing caller keeps rendering fully revealed without having to
// know this prop exists.
//
// Headers never fill for the PINNED view specifically — locked decision,
// no fill state for them there (useAboutPin.ts's own currentIndex is the
// only caller of `filled`, and never passes `headerFills`). The mobile
// spotlight session's own spec is different: its header DOES participate
// ("its header+body render in the dark state" when active) — a deliberate
// divergence between the two mechanics, not an inconsistency to resolve.
// `headerFills` (default false, preserving the locked pinned-view
// behavior for every other caller) opts a caller into that: the header
// renders through ColorReveal too, against its own muted-gray (not the
// body's dark-gray — a different existing token), rather than the flat,
// unconditional `<p>` below.
//
// `data-about-block` (session 5C): the marker useAboutPin.ts's
// ResizeObserver-driven measure() queries to read this block's own
// vertical offset within the content column. Present unconditionally
// (harmless outside the pinned tree) rather than threaded as a prop, so
// this component doesn't need to know whether it's being measured.
//
// Tablet pin reflow session: body copy is `text-body` (20/26) at every
// width below 1440, stepping up to `text-body-large` (24/32) only via the
// `desktop:` variant — tablet renders at 20/26 per 1045:9705's own
// measured type (--text-body, not the old flat --text-body-large every
// tier used to share), and the SAME class then rides the site's existing
// mobile type ramp (globals.css, <744) down to 16/20 for free, no extra
// variant needed here.
//
// Mobile static stack session: header<->body gap steps too — gap-sm (12)
// below --breakpoint-about (980), stepping up to gap-md (20) via the
// `about:` variant. 1064:9884/1064:9885 (phone) measure 12px between the
// header and body; 1045:9709/1045:9710 (tablet) and 523:6601 (desktop)
// both measure 20px — the same `about:` boundary this file's type step
// already uses, not a separate one.
export function TextBlock({
  header,
  body,
  filled = true,
  headerFills = false,
}: {
  header: string;
  body: AboutBodyPart[];
  filled?: boolean;
  headerFills?: boolean;
}) {
  return (
    <div className="flex flex-col items-start gap-sm about:gap-md" data-about-block>
      {headerFills ? (
        <ColorReveal filled={filled} mutedClassName="text-muted-gray" className="text-mono font-mono">
          {header}
        </ColorReveal>
      ) : (
        <p className="text-mono font-mono text-muted-gray">{header}</p>
      )}
      <ColorReveal filled={filled} className="text-body desktop:text-body-large font-sans">
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
