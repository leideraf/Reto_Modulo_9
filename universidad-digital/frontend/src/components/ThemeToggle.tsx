import { useTheme } from "../hooks/useTheme";

type ThemeToggleProps = {
  className?: string;
};

export function ThemeToggle({ className = "" }: ThemeToggleProps) {
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`.trim()}
      onClick={toggleTheme}
      aria-label={`Cambiar a modo ${isDark ? "claro" : "oscuro"}`}
      aria-pressed={isDark}
      title={`Tema actual: ${theme}`}
    >
      <span aria-hidden="true">{isDark ? "L" : "D"}</span>
      <span>{isDark ? "Modo claro" : "Modo oscuro"}</span>
    </button>
  );
}
