# Bia design system

Playful and warm, with chunky pressable controls, Persian tile turquoise, saffron, and a cream background. Mobile-first: designed at 375px, with content capped at `max-w-lg`.

## Tokens

Raw values are CSS variables on `:root` in `src/app/globals.css`, redefined under `prefers-color-scheme: dark`. `@theme inline` maps them to Tailwind utilities (`bg-primary`, `text-ink`, `border-border`, …).

| Token | Light | Dark | Use |
|---|---|---|---|
| `turquoise` | `#1AA6A6` | `#2BC4C4` | Brand accent, progress rings, focus outline |
| `saffron` / `accent` | `#F4A300` | `#F7B32B` | Streak, XP, completed units |
| `primary` | `#139494` | `#2BC4C4` | Primary button fill (deeper than brand turquoise so white text is legible) |
| `primary-shadow` | `#0B6B6B` | `#178C8C` | 3D bottom edge |
| `primary-soft` | `#DFF3F2` | `#173A3C` | Selected tile, active nav pill |
| `on-primary` | `#FFFFFF` | `#16141F` | Text on primary |
| `success` / `-shadow` / `-soft` / `-ink` | `#4C9A0E` … | `#7AD13A` … | Correct state, progress bar |
| `error` / `-shadow` / `-soft` / `-ink` | `#D9483A` … | `#FF7A66` … | Wrong state (coral) |
| `bg` | `#FFF8EC` (cream) | `#16141F` | Page |
| `surface` / `surface-2` | `#FFFFFF` / `#F6EEDF` | `#221F2E` / `#2C2839` | Cards, wells |
| `border` | `#E8DCC6` | `#3A3549` | Borders, resting 3D edges |
| `ink` / `ink-muted` | `#2B2A33` / `#6E6A78` | `#F5EFE4` / `#A8A2B4` | Text |
| `disabled` / `on-disabled` | `#E9E2D4` / `#A49D8F` | `#2C2839` / `#6E6880` | Disabled fill and text |

Every `-ink`-on-`-soft` and `ink-muted`-on-`bg` pair meets WCAG AA (4.5:1 or better). White on `primary` is 3.7:1, which passes AA for the large, extra-bold uppercase button labels.

**Other tokens:** `rounded-tile` (0.875rem), `rounded-card` (1.25rem), `animate-sheet-up`, `animate-pop`.

**Fonts** (`next/font/google`, set in `src/app/layout.tsx`):
- `--font-latin` is Nunito, exposed as `font-sans` and used as the body default.
- `--font-fa` is Vazirmatn (arabic subset), exposed as `font-persian`.

**Motion:** a global `prefers-reduced-motion: reduce` rule in `globals.css` cuts every animation and transition to about 0ms.

## Bidi rules

- The page is `<html lang="en" dir="ltr">`, and layout always stays LTR.
- Persian always goes in its own RTL island: `<bdi dir="rtl" lang="fa" className="font-persian">`. Use `FaText` or `Tile` instead of writing that by hand.
- A row of Persian words, such as a sentence-building answer row or word bank, gets `dir="rtl" lang="fa"` on the container so that tiles flow right-to-left.
- Transliteration is always a separate `dir="ltr"` element.

## Components (`src/components/ui/`, barrel at `@/components/ui`)

| Component | Props | Notes |
|---|---|---|
| `Button` | `variant?: "primary" \| "secondary" \| "ghost" \| "success" \| "error"`, `block?: boolean` (default `true`), plus all `<button>` attributes | 3D press: a 5px bottom border collapses on `:active`. `min-h-12` (48px). Disabled renders flat and grey. |
| `IconButton` | `label: string` (required, used as the aria-label), `icon: ReactNode`, `variant?: "plain" \| "filled"`, plus `<button>` attributes | 48×48. |
| `SpeakerButton` | `text?` (Persian to speak), `rate?`, `onClick?`, `speed?: "normal" \| "slow"`, `size?: "md" \| "lg"` (48 / 80px), `label?`, `className?` | Calls `speak(text)` from `lib/audio.ts` (speechSynthesis stub); `slow` plays at 0.75. |
| `ProgressBar` | `value: number` (0..1), `label?`, `tone?: "success" \| "primary" \| "accent"`, `className?` | `role="progressbar"` with aria values. |
| `FaText` | `fa: string`, `translit?: string`, `showTranslit?: boolean` (default `true`), `size?: "sm" \| "md" \| "lg" \| "xl" \| "2xl"`, `as?: ElementType`, `className?` | Persian is sized about 1.25× larger than Latin. Settings → "fade" is left for the lesson engine to implement, e.g. by toggling `showTranslit`. |
| `Card` | `padded?: boolean`, plus `<div>` attributes | Surface with a resting 3D bottom edge. |
| `Tile` | `fa`, `translit?`, `showTranslit?`, `state?: "idle" \| "selected" \| "correct" \| "wrong" \| "disabled"`, `onClick?`, `className?` | Word tile for sentence building. `disabled` is the empty slot left in the word bank after a word moves to the answer row. `correct` pops. |
| `FeedbackSheet` | `open: boolean`, `status: "correct" \| "wrong"`, `title?`, `correctAnswer?: ReactNode`, `onContinue: () => void`, `continueLabel?` | Fixed bottom sheet that slides up: green when correct, coral when wrong. It is a `role="status"` live region, and Continue gets autofocus. |
| `Switch` | `label`, `description?`, `checked`, `onChange(checked)` | The whole row is the tap target (`role="switch"`). |
| `SegmentedControl<T>` | `label`, `options: {value: T; label}[]`, `value: T`, `onChange(v: T)` | `role="radiogroup"` with 48px segments. |
| Icons (`icons.tsx`) | `size?` plus SVG props | `CloseIcon`, `SpeakerIcon`, `SlowIcon`, `CheckIcon`, `HomeIcon`, `AlphabetIcon`, `SettingsIcon`, `StarIcon`, `LockIcon`. |

## Feature components

- `home/TopBar` (`streak`, `xp`), `home/SkillPath` (`units`, `completedLessons`), and `home/UnitNode` (`title`, `emoji`, `progress`, `state: "done" | "current" | "locked"`, `href`). Each node is a 66px pressable button inside an 88px SVG progress ring, and the path winds through offsets 0 / +56 / 0 / −56 px.
- `lesson/LessonShell`: `progress`, `exitHref?`, `children` (exercise slot), `footer` (sticky Check button), and `overlay` (FeedbackSheet).
- `lesson/LessonPlayer` runs a list of exercises (re-queues wrong answers at the end, records answers, applies the translit setting) and ends on `lesson/LessonComplete` (confetti hidden under `motion-reduce`). `LessonRoute` and `ReviewSession` feed it.
- `home/SkillPath` also takes `upcoming` (locked placeholder units without content).

## Exercises (`src/components/exercises/`)

`MultipleChoice`, `BuildSentence`, `MatchPairs`, `ListenChoose`, `TypeTranslit`, picked by `ExerciseView` from `exercise.type`. They all take `ExerciseProps`:

- `exercise`, `seed` (stable option shuffle), `isNew` ("NEW WORD" badge), `showTranslit(itemId)`, `audioRate`.
- The exercise owns its answer state and calls `onReadyChange(boolean)` when Check may be pressed.
- The player calls the imperative `ref.check()`. The exercise grades itself, locks, and calls `onAnswer({correct, typo?, correctAnswer, graded})` once. `graded` maps each tested item id to correct/incorrect for `recordAnswer`.

Answer checking is pure and unit-tested in `src/lib/check.ts`; run `npm test`.
- `alphabet/LetterCard`, `settings/SettingsForm`, `nav/BottomNav`.

## Routes

- `(tabs)/` holds Home, `/alphabet` and `/settings`, which share a layout with `BottomNav`.
- `/lesson/[lessonId]` (lesson player) and `/lesson/review` (due-item review) are full-screen, with no bottom nav.
- `manifest.ts`, `icon.png`, `apple-icon.png` and `public/icon-{192,512}.png` are placeholder PWA assets.

Content comes from `src/lib/content.ts` (add a unit JSON there in one line). Progress comes from `useProgress()` in `src/lib/progress/`. Remaining placeholders (upcoming units, alphabet) live in `src/lib/mock.ts`, marked `TODO(wiring)`.
