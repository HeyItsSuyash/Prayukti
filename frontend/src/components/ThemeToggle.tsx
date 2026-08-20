"use client";

import * as React from "react"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const toggleTheme = () => {
    if (document.documentElement.classList.contains("dark")) {
      document.documentElement.classList.remove("dark");
      try {
        const prefs = JSON.parse(localStorage.getItem("vlab_settings") || "{}");
        prefs.darkMode = false;
        localStorage.setItem("vlab_settings", JSON.stringify(prefs));
      } catch (e) {}
    } else {
      document.documentElement.classList.add("dark");
      try {
        const prefs = JSON.parse(localStorage.getItem("vlab_settings") || "{}");
        prefs.darkMode = true;
        localStorage.setItem("vlab_settings", JSON.stringify(prefs));
      } catch (e) {}
    }
  }

  return (
    <button
      onClick={toggleTheme}
      className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-9 w-9"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle theme</span>
    </button>
  )
}
