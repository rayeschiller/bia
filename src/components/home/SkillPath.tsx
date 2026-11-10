import type { Unit } from "@/lib/types";
import { firstIncompleteUnit, unitState } from "@/lib/lesson";
import { UnitNode } from "./UnitNode";

export interface SkillPathProps {
  units: Unit[];
  completedLessons: string[];
}

// Horizontal offsets (px) for the winding effect; repeats every 4 nodes.
// Max 64px each side keeps an 88px node inside a 343px (375 - gutters) column.
const OFFSETS = [0, 56, 0, -56];

/** Vertical winding path of unit nodes. The current node links to its next incomplete lesson. */
export function SkillPath({ units, completedLessons }: SkillPathProps) {
  const done = new Set(completedLessons);
  const firstIncomplete = firstIncompleteUnit(units, done);
  const offset = (i: number) => ({ transform: `translateX(${OFFSETS[i % OFFSETS.length]}px)` });

  return (
    <ol className="flex flex-col items-center gap-6 py-6">
      {units.map((unit, i) => {
        const completed = unit.lessons.filter((l) => done.has(l.id)).length;
        const next = unit.lessons.find((l) => !done.has(l.id)) ?? unit.lessons[0];
        return (
          <li key={unit.id} style={offset(i)}>
            <UnitNode
              title={unit.title}
              emoji={unit.emoji}
              progress={unit.lessons.length ? completed / unit.lessons.length : 0}
              state={unitState(unit, done, i === firstIncomplete)}
              href={`/lesson/${next.id}`}
            />
          </li>
        );
      })}
    </ol>
  );
}
