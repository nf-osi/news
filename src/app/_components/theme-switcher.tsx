"use client";

import cn from "classnames";
import { memo, useEffect, useState } from "react";

declare global {
  var updateDOM: () => void;
}

type ColorSchemePreference = "system" | "dark" | "light";

const STORAGE_KEY = "nf-news-theme";
const modes: ColorSchemePreference[] = ["system", "dark", "light"];

/** to reuse updateDOM function defined inside injected script */

/** function to be injected in script tag for avoiding FOUC (Flash of Unstyled Content) */
export const NoFOUCScript = (storageKey: string) => {
  /* can not use outside constants or function as this script will be injected in a different context */
  const [SYSTEM, DARK, LIGHT] = ["system", "dark", "light"];

  /** Modify transition globally to avoid patched transitions */
  const modifyTransition = () => {
    const css = document.createElement("style");
    css.textContent = "*,*:after,*:before{transition:none !important;}";
    document.head.appendChild(css);

    return () => {
      /* Force restyle. This script runs from <head>, so on the first call
         there is no body yet — and no rendered transitions to suppress. */
      if (document.body) getComputedStyle(document.body);
      /* Wait for next tick before removing */
      setTimeout(() => document.head.removeChild(css), 1);
    };
  };

  const media = matchMedia(`(prefers-color-scheme: ${DARK})`);

  /** function to add remove dark class */
  window.updateDOM = () => {
    const restoreTransitions = modifyTransition();
    const mode = localStorage.getItem(storageKey) ?? SYSTEM;
    const systemMode = media.matches ? DARK : LIGHT;
    const resolvedMode = mode === SYSTEM ? systemMode : mode;
    const classList = document.documentElement.classList;
    if (resolvedMode === DARK) classList.add(DARK);
    else classList.remove(DARK);
    document.documentElement.setAttribute("data-mode", mode);
    restoreTransitions();
  };
  window.updateDOM();
  media.addEventListener("change", window.updateDOM);
};

let updateDOM: () => void;

// Which icon shows is driven by the `data-mode` attribute the FOUC script puts
// on <html>, not by React state — the button has to render identically on the
// server and on the client or hydration fails, and the stored preference is
// only readable in the browser.
const icons = [
  {
    mode: "system" as const,
    className: "theme-icon theme-icon-system",
    // Half-filled circle: follow the OS.
    path: (
      <>
        <circle cx="12" cy="12" r="8" />
        <path d="M12 4a8 8 0 0 1 0 16Z" fill="currentColor" stroke="none" />
      </>
    ),
  },
  {
    mode: "dark" as const,
    className: "theme-icon theme-icon-dark",
    path: <path d="M20 14.5A8.5 8.5 0 0 1 9.5 4a8.5 8.5 0 1 0 10.5 10.5Z" />,
  },
  {
    mode: "light" as const,
    className: "theme-icon theme-icon-light",
    path: (
      <>
        <circle cx="12" cy="12" r="4.5" />
        <path d="M12 2.5v2M12 19.5v2M2.5 12h2M19.5 12h2M5.2 5.2l1.4 1.4M17.4 17.4l1.4 1.4M18.8 5.2l-1.4 1.4M6.6 17.4l-1.4 1.4" />
      </>
    ),
  },
];

/**
 * Cycles system → dark → light. Sized and colored to sit inline with the
 * links in the site header rather than float over the page.
 */
export const ThemeToggle = ({ className }: { className?: string }) => {
  const [mode, setMode] = useState<ColorSchemePreference>(
    () =>
      ((typeof localStorage !== "undefined" &&
        localStorage.getItem(STORAGE_KEY)) ??
        "system") as ColorSchemePreference,
  );

  useEffect(() => {
    // store global functions to local variables to avoid any interference
    updateDOM = window.updateDOM;
    /** Sync the tabs */
    addEventListener("storage", (e: StorageEvent): void => {
      e.key === STORAGE_KEY && setMode(e.newValue as ColorSchemePreference);
    });
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, mode);
    updateDOM();
  }, [mode]);

  /** toggle mode */
  const handleModeSwitch = () => {
    const index = modes.indexOf(mode);
    setMode(modes[(index + 1) % modes.length]);
  };

  return (
    <button
      type="button"
      onClick={handleModeSwitch}
      aria-label="Switch color theme"
      title="Switch color theme"
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600 dark:text-slate-300 dark:hover:bg-ink-700 dark:hover:text-white",
        className,
      )}
    >
      {icons.map((icon) => (
        <svg
          key={icon.mode}
          className={icon.className}
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          aria-hidden="true"
        >
          {icon.path}
        </svg>
      ))}
    </button>
  );
};

/**
 * Applies the stored preference before first paint. Must be rendered once, as
 * early in the document as possible.
 */
export const ThemeScript = memo(() => (
  <script
    dangerouslySetInnerHTML={{
      __html: `(${NoFOUCScript.toString()})('${STORAGE_KEY}')`,
    }}
  />
));
ThemeScript.displayName = "ThemeScript";
