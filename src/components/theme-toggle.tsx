"use client";

type Theme = "light" | "dark";

type Props = {
  theme: Theme
  onToggle: () => void
};

/** Moon in light mode (switch to dark); sun in dark mode (switch to light). */
export function ThemeToggle({ theme, onToggle }: Props) {
  const toDark = theme === "light";
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={toDark ? "Switch to dark mode" : "Switch to light mode"}
      title={toDark ? "Dark mode" : "Light mode"}
    >
      {toDark ? (
        <svg
          className="theme-toggle__icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3a7 7 0 1 0 11.5 11.5Z" />
        </svg>
      ) : (
        <svg
          className="theme-toggle__icon"
          viewBox="0 0 24 24"
          width="18"
          height="18"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      )}
    </button>
  );
}
