import { type ReactNode } from "react";

type Props = {
  /** Small uppercase label above the title, e.g. "Tag". */
  eyebrow?: string;
  children: ReactNode;
};

export function PageHeading({ eyebrow, children }: Props) {
  return (
    <header className="pb-10 pt-12 md:pt-16">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl">
        {children}
      </h1>
    </header>
  );
}
