"use client";

import { useState } from "react";
import type { Progress } from "@/lib/types";
import { Card } from "@/components/ui/Card";
import { FaText } from "@/components/ui/FaText";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Switch } from "@/components/ui/Switch";

type Settings = Progress["settings"];

const TRANSLIT_OPTIONS = [
  { value: "always", label: "Always" },
  { value: "fade", label: "Fade out" },
  { value: "off", label: "Off" },
] as const satisfies ReadonlyArray<{ value: Settings["translit"]; label: string }>;

const RATE_OPTIONS = [
  { value: 1, label: "Normal" },
  { value: 0.75, label: "Slow" },
] as const satisfies ReadonlyArray<{ value: Settings["audioRate"]; label: string }>;

/** UI-only settings. TODO(wiring): read/write Progress.settings via the progress store. */
export function SettingsForm() {
  const [settings, setSettings] = useState<Settings>({ translit: "always", audioRate: 1, sfx: true });
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) =>
    setSettings((s) => ({ ...s, [key]: value }));

  return (
    <div className="mt-5 flex flex-col gap-4">
      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="font-extrabold">Transliteration</h2>
          <p className="text-sm text-ink-muted">Show Finglish under Persian words.</p>
        </div>
        <SegmentedControl
          label="Transliteration"
          options={TRANSLIT_OPTIONS}
          value={settings.translit}
          onChange={(v) => set("translit", v)}
        />
        <div className="flex justify-center rounded-tile bg-surface-2 py-2">
          <FaText fa="سلام" translit="salâm" showTranslit={settings.translit !== "off"} size="lg" />
        </div>
      </Card>

      <Card className="flex flex-col gap-3">
        <h2 className="font-extrabold">Audio speed</h2>
        <SegmentedControl
          label="Audio speed"
          options={RATE_OPTIONS}
          value={settings.audioRate}
          onChange={(v) => set("audioRate", v)}
        />
      </Card>

      <Card>
        <Switch
          label="Sound effects"
          description="Dings and buzzes after you check an answer."
          checked={settings.sfx}
          onChange={(v) => set("sfx", v)}
        />
      </Card>
    </div>
  );
}
