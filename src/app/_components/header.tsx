"use client";

import Link from "next/link";
import { useState } from "react";
import cn from "classnames";
import Container from "@/app/_components/container";
import { withBasePath } from "@/lib/base-path";
import { ThemeToggle } from "./theme-switcher";

// Matches the portal's own navbar: light bar, NF wordmark on the left, links
// on the right. The wordmark points at nf.synapse.org (as it does on every
// other portal page) and "News" next to it is this site's home link.
const navLinks = [
  { name: "Latest", href: "/" },
  { name: "Research Briefs", href: "/briefs" },
];

const portalLinks = [
  { name: "Data Portal", href: "https://nf.synapse.org/" },
  {
    name: "Help",
    href: "https://help.nf.synapse.org/nf-data-portal-documentation",
  },
];

const Header = () => {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-brand-50 bg-white/95 backdrop-blur dark:border-ink-700 dark:bg-ink-900/95">
      <Container className="flex items-center gap-4 py-3">
        <Wordmark />
        <span
          aria-hidden="true"
          className="hidden h-7 w-px bg-brand-100 dark:bg-ink-600 sm:block"
        />
        <Link
          href="/"
          className="hidden text-lg font-bold tracking-tight text-brand-600 hover:underline dark:text-brand-200 sm:block"
        >
          News
        </Link>

        <nav
          aria-label="Site"
          className="ml-auto hidden items-center gap-1 md:flex"
        >
          <NavLinks onNavigate={() => setOpen(false)} />
          <ThemeToggle />
        </nav>

        <div className="ml-auto flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setOpen((wasOpen) => !wasOpen)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="nav-link uppercase tracking-wide"
          >
            {open ? "Close" : "Menu"}
          </button>
        </div>
      </Container>

      <Container
        id="mobile-nav"
        className={cn("flex-col gap-1 pb-4 md:hidden", open ? "flex" : "hidden")}
      >
        <nav aria-label="Site" className="flex flex-col gap-1">
          <NavLinks onNavigate={() => setOpen(false)} />
        </nav>
      </Container>
    </header>
  );
};

function NavLinks({ onNavigate }: { onNavigate: () => void }) {
  return (
    <>
      {navLinks.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          className="nav-link"
          onClick={onNavigate}
        >
          {link.name}
        </Link>
      ))}
      {portalLinks.map((link) => (
        <a key={link.href} href={link.href} className="nav-link">
          {link.name}
          <ExternalIcon />
        </a>
      ))}
      <a href={withBasePath("/feed.xml")} className="nav-link">
        RSS
      </a>
    </>
  );
}

function Wordmark() {
  return (
    <a
      href="https://nf.synapse.org/"
      className="shrink-0"
      aria-label="NF Data Portal"
    >
      {/* eslint-disable @next/next/no-img-element */}
      <img
        src={withBasePath("/brand/nf-logo.svg")}
        alt="NF Data Portal"
        className="h-9 w-auto dark:hidden"
        width={156}
        height={36}
      />
      <img
        src={withBasePath("/brand/nf-logo-white.svg")}
        alt="NF Data Portal"
        className="hidden h-9 w-auto dark:block"
        width={125}
        height={36}
      />
      {/* eslint-enable @next/next/no-img-element */}
    </a>
  );
}

function ExternalIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className="ml-1 inline-block opacity-60"
    >
      <path d="M14 4h6v6M20 4 10 14M18 14v6H4V6h6" />
    </svg>
  );
}

export default Header;
