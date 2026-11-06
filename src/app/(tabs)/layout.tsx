import { BottomNav } from "@/components/nav/BottomNav";

/** Shell for tabbed screens (Learn, Alphabet, Settings): content + bottom nav. */
export default function TabsLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <div className="mx-auto w-full max-w-lg flex-1 pb-28">{children}</div>
      <BottomNav />
    </>
  );
}
