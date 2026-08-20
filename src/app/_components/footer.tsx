import Link from "next/link";
import Container from "@/app/_components/container";
import { withBasePath } from "@/lib/base-path";

// Mirrors the portal footer (apps/synapse-portal-framework/src/components/
// Footer.tsx): primary-colored main band with the white NF wordmark and link
// row, then a 10%-darker bottom band carrying the Sage attribution.
const links = [
  { name: "NF Data Portal", href: "https://nf.synapse.org/" },
  {
    name: "Help & Documentation",
    href: "https://help.nf.synapse.org/nf-data-portal-documentation",
  },
  {
    name: "Contact Us",
    href: "https://sagebionetworks.jira.com/servicedesk/customer/portal/2",
  },
  {
    name: "Terms of Service",
    href: "https://www.synapse.org/TrustCenter:TermsOfService",
  },
];

export function Footer() {
  return (
    <footer className="mt-24 text-white">
      <div className="bg-brand-500">
        <Container className="flex flex-col items-center gap-8 py-12 md:flex-row md:justify-between">
          <a href="https://nf.synapse.org/" aria-label="NF Data Portal">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={withBasePath("/brand/nf-logo-white.svg")}
              alt="NF Data Portal"
              className="h-12 w-auto"
              width={166}
              height={48}
            />
          </a>
          <div className="flex flex-wrap items-center justify-center gap-x-7 gap-y-3">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                rel="noopener noreferrer"
                className="font-medium underline-offset-4 hover:underline"
              >
                {link.name}
              </a>
            ))}
            <Link
              href="/briefs"
              className="font-medium underline-offset-4 hover:underline"
            >
              Research Briefs
            </Link>
            <a
              href={withBasePath("/feed.xml")}
              className="font-medium underline-offset-4 hover:underline"
            >
              RSS
            </a>
          </div>
        </Container>
      </div>
      <div className="bg-brand-shade">
        <Container className="py-8 text-sm text-brand-100">
          <p>
            Developed by{" "}
            <a
              href="https://sagebionetworks.org"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-white"
            >
              Sage Bionetworks
            </a>
            , a 501(c)(3) nonprofit research organization · EIN 26-4489946 ·{" "}
            <a
              href="https://sagebionetworks.org/trust-center"
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-white"
            >
              Trust Center
            </a>
          </p>
        </Container>
      </div>
    </footer>
  );
}

export default Footer;
