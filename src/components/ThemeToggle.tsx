import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="p-2 rounded-xl text-muted-foreground hover:bg-muted transition-colors focus:ring-2 focus:ring-primary focus:outline-none"
      aria-label="Toggle theme"
    >
      <Sun className="w-5 h-5 block dark:hidden" />
      <Moon className="w-5 h-5 hidden dark:block" />
    </button>
  );
};
