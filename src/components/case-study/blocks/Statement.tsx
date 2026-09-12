import { InlineLink } from "@/components/ui/InlineLink";
import type { Paragraph } from "@/content/case-studies/types";

// The gradient-filled Satoshi Bold 24/32 treatment Figma uses identically
// for section hooks (a standalone `statement` block, e.g. 736:6079) and
// every sub-heading inside proseFigure/tiles/credits (e.g. 736:6084,
// "Usability Audit") — one component for both, per the "statement (section
// hooks and sub-headings — identical treatment)" read in the P1 plan.
//
// Renders its own segments rather than delegating to Segments.tsx: a link
// nested in this gradient-clipped text needs the extra text-gradient-link
// class to break out of the inherited transparent fill (globals.css), a
// treatment specific to this component and not shared by plain prose.
export function Statement({ text, as: Tag = "p" }: { text: Paragraph; as?: "p" | "h3" }) {
  return (
    <Tag className="text-gradient-project w-full text-body-large font-sans font-black">
      {text.map((segment, index) =>
        segment.href ? (
          <InlineLink
            key={index}
            href={segment.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gradient-link"
          >
            {segment.text}
          </InlineLink>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </Tag>
  );
}
