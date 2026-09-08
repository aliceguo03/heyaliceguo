import { ABOUT_SECTIONS } from "@/content/about";
import { TextBlock } from "./TextBlock";
import { TEXT_COL_W, TEXT_WINDOW_H } from "./aboutGeometry";

// Left column (Figma "text scroll", 523:6602). Session 5A renders all six
// blocks at rest, clipped with overflow:hidden at TEXT_WINDOW_H so the
// resting frame matches Figma exactly — at rest that shows blocks 1 and 2
// in full plus the top of block 3's gap. Scroll behavior is session 5B.
export function TextColumn() {
  return (
    <div
      className="flex shrink-0 flex-col items-start overflow-hidden"
      style={{ width: TEXT_COL_W, height: TEXT_WINDOW_H }}
    >
      <div className="flex flex-col items-start gap-3xl" style={{ width: TEXT_COL_W }}>
        {ABOUT_SECTIONS.map((section) => (
          <TextBlock key={section.id} header={section.header} body={section.body} />
        ))}
      </div>
    </div>
  );
}
