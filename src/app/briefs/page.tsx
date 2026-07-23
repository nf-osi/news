import Link from "next/link";
import Container from "@/app/_components/container";
import Header from "@/app/_components/header";
import DateFormatter from "@/app/_components/date-formatter";
import { getAllBriefs } from "@/lib/briefs";

export default function BriefsIndex() {
  const briefs = getAllBriefs();

  return (
    <main>
      <Container>
        <Header />
        <h1 className="mb-8 text-5xl md:text-7xl font-bold tracking-tighter leading-tight">
          Research Briefs
        </h1>
        <ul className="mb-32">
          {briefs.map((brief) => (
            <li
              key={brief.slug}
              className="border-b border-accent-2 dark:border-slate-700 py-6"
            >
              <h2 className="text-2xl font-bold mb-2">
                <Link href={`/briefs/${brief.slug}`} className="hover:underline">
                  {brief.title}
                </Link>
              </h2>
              <div className="text-lg text-accent-7 dark:text-slate-400">
                <DateFormatter dateString={brief.date} /> · {brief.status}
              </div>
            </li>
          ))}
        </ul>
      </Container>
    </main>
  );
}
