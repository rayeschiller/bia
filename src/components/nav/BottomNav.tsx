"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";
import { cn } from "@/lib/cn";
import { AlphabetIcon, HomeIcon, SettingsIcon } from "@/components/ui/icons";

const items: Array<{ href: "/" | "/alphabet" | "/settings"; label: string; Icon: ComponentType<{ size?: number }> }> = [
  { href: "/", label: "Learn", Icon: HomeIcon },
  { href: "/alphabet", label: "Alphabet", Icon: AlphabetIcon },
  { href: "/settings", label: "Settings", Icon: SettingsIcon },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-20 border-t-2 border-border bg-surface pb-[env(safe-area-inset-bottom)]"
    >
      <ul className="mx-auto flex max-w-lg">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href;
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-0.5 text-xs font-bold",
                  active ? "text-primary" : "text-ink-muted",
                )}
              >
                <span className={cn("rounded-xl px-4 py-1", active && "bg-primary-soft")}>
                  <Icon size={24} />
                </span>
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
