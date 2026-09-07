"use client";

import { useEffect, useState } from "react";
import { useCursorLabel } from "@/components/motion/CursorLabel";

export const EMAIL = "a2guo@ucsd.edu";
export const LINKEDIN_HREF = "https://www.linkedin.com/in/aliceguo03/";

const COPY_FEEDBACK_MS = 1500; // matches the custom cursor's "COPIED" hold, step 10

// Fallback for browsers without the async Clipboard API (older Safari,
// insecure contexts). document.execCommand is deprecated but still the
// standard way to copy without it.
function copyWithFallback(text: string): boolean {
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.focus();
  textarea.select();
  let succeeded = false;
  try {
    succeeded = document.execCommand("copy");
  } catch {
    succeeded = false;
  }
  document.body.removeChild(textarea);
  return succeeded;
}

// `copied` is what step 10's custom cursor will read to swap its label to
// "COPIED" — no visible UI here yet, just the state and the copy logic.
export function useCopyEmail() {
  const [copied, setCopied] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  async function handleCopyEmail() {
    let didCopy = false;
    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(EMAIL);
        didCopy = true;
      } else {
        didCopy = copyWithFallback(EMAIL);
      }
    } catch {
      didCopy = copyWithFallback(EMAIL);
    }

    if (!didCopy) return;

    setCopied(true);
    setAnnouncement(`Copied ${EMAIL} to clipboard`);
    window.setTimeout(() => setCopied(false), COPY_FEEDBACK_MS);
  }

  return { copied, announcement, handleCopyEmail };
}

export function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M22.75 4.875H3.25C3.03451 4.875 2.82785 4.9606 2.67548 5.11298C2.5231 5.26535 2.4375 5.47201 2.4375 5.6875V19.5C2.4375 19.931 2.6087 20.3443 2.91345 20.649C3.2182 20.9538 3.63152 21.125 4.0625 21.125H21.9375C22.3685 21.125 22.7818 20.9538 23.0865 20.649C23.3913 20.3443 23.5625 19.931 23.5625 19.5V5.6875C23.5625 5.47201 23.4769 5.26535 23.3245 5.11298C23.1722 4.9606 22.9655 4.875 22.75 4.875ZM13 13.523L5.33914 6.5H20.6609L13 13.523ZM10.0252 13L4.0625 18.4651V7.53492L10.0252 13ZM11.2277 14.102L12.4465 15.2242C12.5964 15.3618 12.7925 15.4382 12.9959 15.4382C13.1994 15.4382 13.3955 15.3618 13.5454 15.2242L14.7641 14.102L20.6548 19.5H5.33914L11.2277 14.102ZM15.9748 13L21.9375 7.53391V18.4661L15.9748 13Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function LinkedinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 26 26"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M21.9375 2.4375H4.0625C3.63152 2.4375 3.2182 2.6087 2.91345 2.91345C2.6087 3.2182 2.4375 3.63152 2.4375 4.0625V21.9375C2.4375 22.3685 2.6087 22.7818 2.91345 23.0865C3.2182 23.3913 3.63152 23.5625 4.0625 23.5625H21.9375C22.3685 23.5625 22.7818 23.3913 23.0865 23.0865C23.3913 22.7818 23.5625 22.3685 23.5625 21.9375V4.0625C23.5625 3.63152 23.3913 3.2182 23.0865 2.91345C22.7818 2.6087 22.3685 2.4375 21.9375 2.4375ZM21.9375 21.9375H4.0625V4.0625H21.9375V21.9375ZM9.75 11.375V17.875C9.75 18.0905 9.6644 18.2972 9.51202 18.4495C9.35965 18.6019 9.15299 18.6875 8.9375 18.6875C8.72201 18.6875 8.51535 18.6019 8.36298 18.4495C8.2106 18.2972 8.125 18.0905 8.125 17.875V11.375C8.125 11.1595 8.2106 10.9528 8.36298 10.8005C8.51535 10.6481 8.72201 10.5625 8.9375 10.5625C9.15299 10.5625 9.35965 10.6481 9.51202 10.8005C9.6644 10.9528 9.75 11.1595 9.75 11.375ZM18.6875 14.2188V17.875C18.6875 18.0905 18.6019 18.2972 18.4495 18.4495C18.2972 18.6019 18.0905 18.6875 17.875 18.6875C17.6595 18.6875 17.4528 18.6019 17.3005 18.4495C17.1481 18.2972 17.0625 18.0905 17.0625 17.875V14.2188C17.0625 13.68 16.8485 13.1634 16.4676 12.7824C16.0866 12.4015 15.57 12.1875 15.0312 12.1875C14.4925 12.1875 13.9759 12.4015 13.5949 12.7824C13.214 13.1634 13 13.68 13 14.2188V17.875C13 18.0905 12.9144 18.2972 12.762 18.4495C12.6097 18.6019 12.403 18.6875 12.1875 18.6875C11.972 18.6875 11.7653 18.6019 11.613 18.4495C11.4606 18.2972 11.375 18.0905 11.375 17.875V11.375C11.376 11.176 11.45 10.9843 11.583 10.8362C11.716 10.6881 11.8987 10.594 12.0965 10.5717C12.2942 10.5494 12.4933 10.6005 12.6559 10.7152C12.8185 10.83 12.9334 11.0004 12.9787 11.1942C13.5283 10.8214 14.1691 10.6053 14.8323 10.5691C15.4955 10.533 16.156 10.6782 16.7429 10.9891C17.3298 11.3001 17.821 11.765 18.1636 12.334C18.5061 12.903 18.6873 13.5546 18.6875 14.2188ZM10.1562 8.53125C10.1562 8.7723 10.0848 9.00793 9.95085 9.20835C9.81694 9.40877 9.62659 9.56498 9.4039 9.65723C9.1812 9.74947 8.93615 9.77361 8.69973 9.72658C8.46332 9.67956 8.24616 9.56348 8.07571 9.39304C7.90527 9.22259 7.78919 9.00543 7.74217 8.76902C7.69514 8.5326 7.71928 8.28755 7.81152 8.06485C7.90377 7.84216 8.05998 7.65181 8.2604 7.5179C8.46082 7.38398 8.69645 7.3125 8.9375 7.3125C9.26073 7.3125 9.57073 7.4409 9.79929 7.66946C10.0278 7.89802 10.1562 8.20802 10.1562 8.53125Z"
        fill="currentColor"
      />
    </svg>
  );
}

// Shared button/link markup, extracted session 4: identical between Nav and
// Footer before this except for a color className, which is now the one
// parameter that varies. `useCopyEmail()` itself and the aria-live
// announcement region stay in Nav.tsx/Footer.tsx — those two already sit in
// different positions relative to the icon row between the two callers
// (Footer's is a third child inside the icon row's own div; Nav's is a
// sibling after it), so lifting them in here would change one of the two
// callers' rendered output, which is exactly what this extraction is not
// supposed to do (see scripts/verify-animation.mjs's Nav/Footer render-
// identical check).
//
// Both publish to the cursor label bubble (CursorLabel.tsx) on hover
// enter/leave, and MailButton additionally on every `copied` flip — never on
// mousemove, per CLAUDE.md "Custom cursor". `cursorLabel` itself is a stable
// object (CursorLabelProvider memoizes it), so these effects only ever fire
// on a real hover/copy transition.
export function MailButton({
  copied,
  onClick,
  className,
}: {
  copied: boolean;
  onClick: () => void;
  className: string;
}) {
  const [hovered, setHovered] = useState(false);
  const cursorLabel = useCursorLabel();

  useEffect(() => {
    if (!hovered) {
      cursorLabel.hide();
      return;
    }
    cursorLabel.show(copied ? "COPIED" : `COPY ${EMAIL.toUpperCase()}`, copied ? "copied" : "action");
  }, [hovered, copied, cursorLabel]);

  return (
    <button
      type="button"
      onClick={onClick}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      aria-label={`Copy email address ${EMAIL} to clipboard`}
      className={className}
    >
      <EnvelopeIcon className="size-icon" />
    </button>
  );
}

export function LinkedinLink({ className }: { className: string }) {
  const [hovered, setHovered] = useState(false);
  const cursorLabel = useCursorLabel();

  useEffect(() => {
    if (hovered) {
      cursorLabel.show("CONNECT", "action");
    } else {
      cursorLabel.hide();
    }
  }, [hovered, cursorLabel]);

  return (
    <a
      href={LINKEDIN_HREF}
      aria-label="Alice on LinkedIn"
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      className={className}
    >
      <LinkedinIcon className="size-icon" />
    </a>
  );
}
