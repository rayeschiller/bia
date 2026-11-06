import type { Unit } from "@/lib/types";
import { UnitNode, type UnitNodeState } from "./UnitNode";

/** A unit that has no content yet; always drawn locked at the end of the path. */
export interface UpcomingUnit {
  id: string;
  title: string;
  emoji: string;
}

export interface SkillPathProps {
  units: Unit[];
  completedLessons: string[];
  upcoming?: UpcomingUnit[];
}

// Horizontal offsets (px) for the winding effect; repeats every 4 nodes.
// Max 64px each side keeps an 88px node inside a 343px (375 - gutters) column.
const OFFSETS = [0, 56, 0, -56];

function unitState(unit: Unit, done: Set<string>, isFirstIncomplete: boolean): UnitNodeState {
  if (unit.lessons.every((l) => done.has(l.id))) return "done";
  return isFirstIncomplete ? "current" : "locked";
}

/** Vertical winding path of unit nodes. The current node links to its next incomplete lesson. */
export function SkillPath({ units, completedLessons, upcoming = [] }: SkillPathProps) {
  const done = new Set(completedLessons);
  const firstIncomplete = units.findIndex((u) => u.lessons.some((l) => !done.has(l.id)));
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
      {upcoming.map((u, j) => (
        <li key={u.id} style={offset(units.length + j)}>
          <UnitNode title={u.title} emoji={u.emoji} progress={0} state="locked" href="/" />
        </li>
      ))}
    </ol>
  );
}
