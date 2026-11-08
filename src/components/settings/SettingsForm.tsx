"use client";

import type { Progress } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Switch } from "@/components/ui/Switch";
import { ResetProgress } from "./ResetProgress";

type Settings = Progress["settings"];

const RATE_OPTIONS = [
  { value: 1, label: "Normal" },
  { value: 0.75, label: "Slow" },
] as const satisfies ReadonlyArray<{ value: Settings["audioRate"]; label: string }>;

/** Settings bound to Progress.settings; every change is saved immediately. */
export function SettingsForm() {
  const { progress, updateSettings } = useProgress();
  const { settings } = progress;

  return (
    <div className="mt-5 flex flex-col gap-4 pb-6">
      <Card className="flex flex-col gap-3">
        <h2 className="font-extrabold">Audio speed</h2>
        <SegmentedControl
          label="Audio speed"
          options={RATE_OPTIONS}
          value={settings.audioRate}
          onChange={(audioRate) => updateSettings({ audioRate })}
        />
      </Card>

      <Card>
        <Switch
          label="Sound effects"
          description="Dings and buzzes after you check an answer."
          checked={settings.sfx}
          onChange={(sfx) => updateSettings({ sfx })}
        />
      </Card>

      <ResetProgress />
    </div>
  );
}
