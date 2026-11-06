import { LessonDemo } from "@/components/lesson/LessonDemo";

export default async function LessonPage({ params }: PageProps<"/lesson/[lessonId]">) {
  // TODO(wiring): load the Lesson by id from the ContentBundle and hand it to the lesson engine.
  const { lessonId } = await params;
  return (
    <>
      <span className="sr-only">Lesson {lessonId}</span>
      <LessonDemo />
    </>
  );
}
