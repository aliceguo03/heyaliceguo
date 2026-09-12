import { Segments } from "@/components/case-study/Segments";
import type { Paragraph } from "@/content/case-studies/types";

// Plain Satoshi 20/26 body copy (e.g. 736:6066, and section 02's lead
// paragraph, 760:6100) — gap-md between multiple paragraphs, matching the
// content column's own element-to-element rhythm.
export function Prose({ paragraphs }: { paragraphs: Paragraph[] }) {
  return (
    <div className="flex w-full flex-col gap-md text-body font-sans text-deep-black">
      {paragraphs.map((paragraph, index) => (
        <p key={index} className="m-0">
          <Segments segments={paragraph} />
        </p>
      ))}
    </div>
  );
}
