"use client";

import type { Progress } from "@/lib/types";
import { useProgress } from "@/lib/progress";
import { Card } from "@/components/ui/Card";
import { FaText } from "@/components/ui/FaText";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Switch } from "@/components/ui/Switch";
import { ResetProgress } from "./ResetProgress";

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

/** Settings bound to Progress.settings; every change is saved immediately. */
export function SettingsForm() {
  const { progress, updateSettings } = useProgress();
  const { settings } = progress;

  return (
    <div className="mt-5 flex flex-col gap-4 pb-6">
      <Card className="flex flex-col gap-3">
        <div>
          <h2 className="font-extrabold">Transliteration</h2>
          <p className="text-sm text-ink-muted">Show Finglish under Persian words.</p>
        </div>
        <SegmentedControl
          label="Transliteration"
          options={TRANSLIT_OPTIONS}
          value={settings.translit}
          onChange={(translit) => updateSettings({ translit })}
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
