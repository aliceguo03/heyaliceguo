"use client";

import type { ComponentType } from "react";
import { IslandIcon } from "@/components/ui/icons/IslandIcon";
import { LightbulbIcon } from "@/components/ui/icons/LightbulbIcon";
import { BankIcon } from "@/components/ui/icons/BankIcon";
import { LoadReveal } from "@/components/motion/LoadReveal";
import { LOAD } from "@/lib/motion";

// Site copy, not project data — projects.ts (rule 9) covers case-study
// content, not the hero bio. Per Figma node 441:5972: each line trails an
// organization name in accent-blue-light; line 2 carries a hard break before
// "Triton" that the other two lines don't have.
const BIO_LINES: {
  Icon: ComponentType<{ className?: string }>;
  lead: string;
  org: string;
  break?: boolean;
}[] = [
  {
    Icon: IslandIcon,
    lead: "Fourth-year design & interaction student @ ",
    org: "UC San Diego",
  },
  {
    Icon: LightbulbIcon,
    lead: "Current VP of Design @ ",
    org: "Triton Software Engineering",
    break: true,
  },
  {
    Icon: BankIcon,
    lead: "Prev. design intern @ ",
    org: "Chase",
  },
];

type BioListProps = {
  play: boolean;
  startDelay: number;
};

export function BioList({ play, startDelay }: BioListProps) {
  return (
    <ul className="flex w-full flex-col gap-sm">
      {BIO_LINES.map(({ Icon, lead, org, break: hasBreak }, index) => (
        <LoadReveal
          key={org}
          as="li"
          play={play}
          delay={startDelay + index * LOAD.bioStagger}
          className="flex items-start gap-sm"
        >
          <Icon className="size-icon shrink-0 text-muted-gray" />
          <p className="min-w-0 flex-1 text-body font-sans text-true-black">
            {lead}
            {hasBreak && <br />}
            <span className="text-accent-blue-light">{org}</span>
          </p>
        </LoadReveal>
      ))}
    </ul>
  );
}
