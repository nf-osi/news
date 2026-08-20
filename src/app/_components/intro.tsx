import Container from "@/app/_components/container";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";
import { withBasePath } from "@/lib/base-path";

// The portal's own hero treatment: primary-colored band with the molecule
// artwork multiplied over it (`$header-url` plus `background-blend-mode:
// multiply` in apps/portals/nf/src/config/style/_style_overrides.scss).
export function Intro() {
  return (
    <section
      className="bg-brand-500 bg-cover bg-center text-white"
      style={{
        backgroundImage: `url(${withBasePath("/brand/molecules.svg")})`,
        backgroundBlendMode: "multiply",
      }}
    >
      <Container className="flex flex-col gap-x-8 gap-y-2 py-8 md:flex-row md:items-baseline md:py-10">
        <h1 className="text-2xl font-bold tracking-tight text-white md:text-3xl">
          {SITE_NAME}
        </h1>
        <p className="max-w-2xl leading-snug text-brand-100">{SITE_TAGLINE}</p>
        <a
          href={withBasePath("/feed.xml")}
          className="whitespace-nowrap text-sm font-bold underline-offset-4 hover:underline md:ml-auto"
        >
          Subscribe via RSS
        </a>
      </Container>
    </section>
  );
}
