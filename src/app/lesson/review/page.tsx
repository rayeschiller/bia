import type { Metadata } from "next";
import { ReviewSession } from "@/components/lesson/ReviewSession";

export const metadata: Metadata = { title: "Review · Bia" };

export default function ReviewPage() {
  return <ReviewSession />;
}
