import { InlineLink } from "@/components/ui/InlineLink";
import type { AboutBodyPart } from "@/content/about";

// One "text with header" block (Figma 696:5291 etc.) — a mono header and a
// Satoshi body paragraph, gap-md between them. Header is stored all-caps in
// the content module and rendered verbatim here — no CSS text-transform.
export function TextBlock({ header, body }: { header: string; body: AboutBodyPart[] }) {
  return (
    <div className="flex flex-col items-start gap-md">
      <p className="text-mono font-mono text-muted-gray">{header}</p>
      <p className="text-body-large font-sans text-deep-black">
        {body.map((part, index) =>
          part.href ? (
            <InlineLink key={index} href={part.href} target="_blank" rel="noopener noreferrer">
              {part.text}
            </InlineLink>
          ) : (
            <span key={index}>{part.text}</span>
          ),
        )}
      </p>
    </div>
  );
}
