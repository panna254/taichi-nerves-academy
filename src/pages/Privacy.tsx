import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Info, Clock, ExternalLink } from "lucide-react";

type PolicySection = {
  title: string;
  description: string;
  points: string[];
  icon: React.ElementType;
};

const policySections: PolicySection[] = [
  {
    title: "What We Collect",
    description: "Information you choose to provide and non-personal, aggregate data captured as you browse.",
    points: [
      "Personal details you submit via forms (e.g., contact, signup).",
      "Non-personal usage data such as browser type, operating system, visit timestamps, and pages viewed.",
      "IP addresses are anonymized so they cannot be linked back to a specific visitor.",
    ],
    icon: Info,
  },
  {
    title: "How We Use Your Information",
    description: "We process data only for the purposes you expect.",
    points: [
      "Responding to inquiries you submit and providing requested services.",
      "Improving site performance and understanding aggregated usage trends.",
      "Sending service-related updates you opt into; no unsolicited marketing without consent.",
    ],
    icon: Shield,
  },
  {
    title: "Cookies",
    description: "Only strictly necessary cookies are used for core functionality.",
    points: [
      "We do not use marketing or tracking cookies.",
      "Cookies help keep sessions stable and improve basic navigation.",
      "You can manage cookies in your browser settings; blocking some cookies may affect site functionality.",
    ],
    icon: ExternalLink,
  },
  {
    title: "Sharing & Disclosure",
    description: "We do not sell your data and we limit disclosures.",
    points: [
      "No selling or trading of personal information.",
      "Aggregate, anonymized insights may be shared to improve services.",
      "We may disclose information only if required by law or to protect our rights.",
    ],
    icon: Lock,
  },
  {
    title: "Security & Retention",
    description: "We safeguard data and keep it only as long as needed for its purpose.",
    points: [
      "Access controls and technical safeguards help protect against unauthorized access.",
      "Data is retained only for as long as needed to fulfill the purpose you provided it for.",
      "After the purpose is complete, data is deleted or anonymized.",
    ],
    icon: Clock,
  },
  {
    title: "Your Rights",
    description: "You control your data and can request access or corrections.",
    points: [
      "Request copies of the personal data you have provided.",
      "Ask us to correct or delete inaccurate information where applicable.",
      "Withdraw consent for optional communications at any time.",
    ],
    icon: Shield,
  },
  {
    title: "Third-Party Links",
    description: "External links are subject to their own privacy practices.",
    points: [
      "Linked sites have independent privacy policies.",
      "Review those policies before providing information on third-party sites.",
    ],
    icon: ExternalLink,
  },
];

const Privacy = () => {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - Taichi Nerves</title>
        <meta
          name="description"
          content="Learn how Taichi Nerves collects, uses, and protects your information. Inspired by healthcare education privacy best practices."
        />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                  <Shield className="h-8 w-8 text-accent-foreground" />
                </div>
                <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
                  Privacy Policy
                </h1>
                <p className="mt-6 text-lg text-primary-foreground/80">
                  How we collect, use, protect, and respect your information across Taichi Nerves services.
                </p>
                <p className="mt-2 text-sm text-primary-foreground/70">
                  This overview draws from established educational privacy practices similar to those described by partners like Ninja Nerd.
                </p>
              </div>
            </div>
          </section>

          {/* Policy Sections */}
          <section className="py-16 lg:py-24 bg-gradient-subtle">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="grid gap-6 md:grid-cols-2">
                {policySections.map((section) => (
                  <div key={section.title} className="rounded-2xl bg-card p-6 shadow-soft">
                    <div className="flex items-center gap-3 mb-4">
                      <section.icon className="h-6 w-6 text-primary" />
                      <h2 className="font-display text-xl font-bold text-card-foreground">
                        {section.title}
                      </h2>
                    </div>
                    <p className="text-sm text-muted-foreground">{section.description}</p>
                    <ul className="mt-4 space-y-2 text-sm text-foreground/90">
                      {section.points.map((point) => (
                        <li key={point} className="flex gap-2">
                          <span className="mt-1 h-2 w-2 rounded-full bg-primary/70" aria-hidden />
                          <span>{point}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Contact */}
          <section className="py-12 bg-muted/50">
            <div className="container mx-auto px-4 lg:px-8 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Have a question about your data?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Contact us if you want to access, correct, or delete your personal information.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link to="/contact">
                  <Button className="gap-2">
                    Contact Us
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href="mailto:privacy@taichinerves.com"
                  className="text-sm text-primary hover:underline"
                >
                  privacy@taichinerves.com
                </a>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Privacy;

