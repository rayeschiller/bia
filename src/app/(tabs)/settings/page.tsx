import type { Metadata } from "next";
import { SettingsForm } from "@/components/settings/SettingsForm";

export const metadata: Metadata = { title: "Settings · Bia" };

export default function SettingsPage() {
  return (
    <main className="px-4 pt-6">
      <h1 className="text-2xl font-black">Settings</h1>
      <SettingsForm />
    </main>
  );
}
