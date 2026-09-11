import { InlineLink } from "@/components/ui/InlineLink";
import type { Paragraph } from "@/content/case-studies/types";

// Renders one Paragraph (Segment[]), emitting InlineLink for any segment
// with an href. The exact map TextBlock.tsx already uses for
// content/about.ts's AboutBodyPart[] — lifted here so prose, statement, and
// credits share one implementation instead of three copies of the same
// ternary.
export function Segments({ segments }: { segments: Paragraph }) {
  return (
    <>
      {segments.map((segment, index) =>
        segment.href ? (
          <InlineLink key={index} href={segment.href} target="_blank" rel="noopener noreferrer">
            {segment.text}
          </InlineLink>
        ) : (
          <span key={index}>{segment.text}</span>
        ),
      )}
    </>
  );
}
