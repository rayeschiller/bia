import { notFound } from "next/navigation";
import { LessonRoute } from "@/components/lesson/LessonRoute";
import { getLesson, getUnits } from "@/lib/content";

export function generateStaticParams() {
  return getUnits().flatMap((u) => u.lessons.map((l) => ({ lessonId: l.id })));
}

export default async function LessonPage({ params }: PageProps<"/lesson/[lessonId]">) {
  const { lessonId } = await params;
  if (!getLesson(lessonId)) notFound();
  return <LessonRoute lessonId={lessonId} />;
}
