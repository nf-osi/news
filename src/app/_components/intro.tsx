import Container from "@/app/_components/container";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { withBasePath } from "@/lib/base-path";

// No colored band: the portal's molecule artwork sits on the page background
// in its own teal, unblended. It's laid in on the right as a decorative layer,
// the type keeps to the left of it, and it fades out at its leading edge so
// nothing ever reads through the letters.
export function Intro() {
  return (
    <section className="relative overflow-hidden border-b border-card-line dark:border-ink-700">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[42%] bg-right bg-no-repeat md:block"
        style={{
          backgroundImage: `url(${withBasePath("/brand/molecules.svg")})`,
          backgroundSize: "auto 100%",
          maskImage: "linear-gradient(to right, transparent, #000 45%)",
          WebkitMaskImage: "linear-gradient(to right, transparent, #000 45%)",
        }}
      />
      <Container className="relative flex flex-col items-baseline gap-x-6 gap-y-2 py-8 md:flex-row md:py-10">
        <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
          {SITE_NAME}
        </h1>
        <p className="max-w-md leading-snug text-ink-500 dark:text-slate-400">
          {SITE_TAGLINE}
        </p>
      </Container>
    </section>
  );
}
