import Link from "next/link";
import Container from "@/app/_components/container";
import { PageHeading } from "@/app/_components/page-heading";
import DateFormatter from "@/app/_components/date-formatter";
import { getAllBriefs } from "@/lib/briefs";

export default function BriefsIndex() {
  const briefs = getAllBriefs();

  return (
    <main>
      <Container>
        <PageHeading>Research Briefs</PageHeading>
        <ul className="mb-32">
          {briefs.map((brief) => (
            <li
              key={brief.slug}
              className="border-b border-brand-50 py-6 dark:border-ink-700"
            >
              <h2 className="text-2xl font-bold mb-2">
                <Link href={`/briefs/${brief.slug}`} className="hover:underline">
                  {brief.title}
                </Link>
              </h2>
              <div className="text-lg text-ink-300 dark:text-slate-400">
                <DateFormatter dateString={brief.date} />
                {brief.status && ` · ${brief.status}`}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
