export interface ExerciseHeaderProps {
  title: string;
  isNew?: boolean;
}

/** Exercise instruction line, with a saffron "NEW WORD" badge on an item's first test. */
export function ExerciseHeader({ title, isNew }: ExerciseHeaderProps) {
  return (
    <div className="flex flex-col items-start gap-2">
      {isNew && (
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-black tracking-wider text-accent-shadow uppercase dark:text-saffron">
          <span aria-hidden>✨ </span>New word
        </span>
      )}
      <h1 className="text-2xl font-black">{title}</h1>
    </div>
  );
}
