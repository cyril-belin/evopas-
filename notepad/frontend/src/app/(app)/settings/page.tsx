"use client";

import { useAuthStore } from "@/stores/auth-store";
import { useThemeStore } from "@/stores/theme-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Settings, Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useThemeStore();

  const themeOptions = [
    { value: "light" as const, label: "Light", icon: Sun },
    { value: "dark" as const, label: "Dark", icon: Moon },
    { value: "system" as const, label: "System", icon: Monitor },
  ];

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="mx-auto max-w-lg">
        <h1 className="mb-6 flex items-center gap-2 text-xl font-semibold">
          <Settings className="h-5 w-5" />
          Settings
        </h1>

        {/* Profile */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-400">
            Profile
          </h2>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <div className="space-y-2">
              <div>
                <Label className="text-neutral-500">Name</Label>
                <p className="text-sm font-medium">{user?.name || "—"}</p>
              </div>
              <div>
                <Label className="text-neutral-500">Email</Label>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Appearance */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-400">
            Appearance
          </h2>
          <div className="rounded-lg border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
            <Label className="mb-3 block">Theme</Label>
            <div className="flex gap-2">
              {themeOptions.map(({ value, label, icon: Icon }) => (
                <Button
                  key={value}
                  variant={theme === value ? "default" : "outline"}
                  size="sm"
                  onClick={() => setTheme(value)}
                  className="flex-1"
                >
                  <Icon className="mr-2 h-4 w-4" />
                  {label}
                </Button>
              ))}
            </div>
          </div>
        </section>

        {/* Keyboard shortcuts */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-neutral-400">
            Keyboard shortcuts
          </h2>
          <div className="rounded-lg border border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
            {[
              { keys: "Cmd+K", desc: "Command palette" },
              { keys: "Cmd+N", desc: "New note" },
              { keys: "Cmd+S", desc: "Force save" },
              { keys: "Cmd+Shift+F", desc: "Focus mode" },
              { keys: "Cmd+D", desc: "Duplicate note" },
              { keys: "Cmd+Backspace", desc: "Move to trash" },
            ].map(({ keys, desc }, i) => (
              <div
                key={keys}
                className={cn(
                  "flex items-center justify-between px-4 py-3",
                  i > 0 && "border-t border-neutral-100 dark:border-neutral-800"
                )}
              >
                <span className="text-sm">{desc}</span>
                <kbd className="rounded bg-neutral-100 px-2 py-1 text-xs font-medium dark:bg-neutral-800">
                  {keys}
                </kbd>
              </div>
            ))}
          </div>
        </section>

        <Separator className="mb-8" />

        {/* Logout */}
        <Button
          variant="outline"
          className="w-full text-red-600 hover:text-red-700 dark:text-red-400"
          onClick={() => {
            logout();
            router.push("/auth/login");
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign out
        </Button>
      </div>
    </div>
  );
}
