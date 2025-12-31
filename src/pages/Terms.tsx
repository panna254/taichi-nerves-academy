import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { ShieldAlert, ScrollText, Gavel, CreditCard, Globe2, Ban, HeartPulse, ExternalLink } from "lucide-react";

type TermsSection = {
  title: string;
  description: string;
  points: string[];
  icon: React.ElementType;
};

const termsSections: TermsSection[] = [
  {
    title: "Acceptance & Scope",
    description: "Using Taichi Nerves means you agree to these terms and our policies.",
    points: [
      "Access or use constitutes acceptance of these Terms of Service.",
      "If you do not agree, please discontinue use of the site and services.",
    ],
    icon: ScrollText,
  },
  {
    title: "Educational Use Only",
    description: "Content is informational and not a substitute for professional medical advice.",
    points: [
      "Always seek a licensed provider for diagnosis or treatment decisions.",
      "Use any learning materials at your own discretion and risk.",
    ],
    icon: HeartPulse,
  },
  {
    title: "Accounts & Conduct",
    description: "Keep your account secure and use the platform responsibly.",
    points: [
      "You are responsible for safeguarding login credentials.",
      "No misuse, unlawful activity, or interference with the service.",
      "Respect intellectual property and do not redistribute protected content.",
    ],
    icon: Ban,
  },
  {
    title: "Intellectual Property",
    description: "All site content and branding remain owned by Taichi Nerves or licensors.",
    points: [
      "Content is provided for personal or institutional educational use as permitted.",
      "No copying, resale, or derivative works without written permission.",
    ],
    icon: ShieldAlert,
  },
  {
    title: "Payments & Subscriptions",
    description: "Paid features follow the plan terms you select.",
    points: [
      "Fees, billing cycles, and access levels are defined at purchase.",
      "You are responsible for applicable taxes and payment methods.",
      "We may suspend access for unpaid or disputed charges.",
    ],
    icon: CreditCard,
  },
  {
    title: "Disclaimers & Liability Limits",
    description: "Services are provided “as is” with limited liability.",
    points: [
      "No warranties of uninterrupted or error-free service.",
      "Liability is limited to the greater of $100 or fees paid for the applicable service period.",
      "We are not liable for indirect, incidental, or consequential damages.",
    ],
    icon: ShieldAlert,
  },
  {
    title: "Indemnity",
    description: "You agree to hold Taichi Nerves harmless from claims arising from your use.",
    points: [
      "Covers misuse, breach of these terms, or violations of law or third-party rights.",
    ],
    icon: Gavel,
  },
  {
    title: "Changes & Termination",
    description: "We may update terms or suspend access where necessary.",
    points: [
      "Continued use after updates constitutes acceptance of revised terms.",
      "Accounts may be terminated for violations or legal compliance needs.",
    ],
    icon: ScrollText,
  },
  {
    title: "Governing Law & Disputes",
    description: "These terms follow applicable local law where Taichi Nerves operates.",
    points: [
      "Disputes are subject to the governing law and venue specified by Taichi Nerves.",
      "Some jurisdictions may not allow certain limitations—local rights may apply.",
    ],
    icon: Globe2,
  },
];

const Terms = () => {
  return (
    <>
      <Helmet>
        <title>Terms of Service - Taichi Nerves</title>
        <meta
          name="description"
          content="Summary of Taichi Nerves Terms of Service covering use of the site, educational purpose, conduct, payments, liability, and dispute guidelines."
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
                  <ShieldAlert className="h-8 w-8 text-accent-foreground" />
                </div>
                <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
                  Terms of Service
                </h1>
                <p className="mt-6 text-lg text-primary-foreground/80">
                  The essentials you need to know about using Taichi Nerves responsibly.
                </p>
                <p className="mt-2 text-sm text-primary-foreground/70">
                  This summary is inspired by established education platform terms such as those described by Ninja Nerd.
                </p>
              </div>
            </div>
          </section>

          {/* Terms Sections */}
          <section className="py-16 lg:py-24 bg-gradient-subtle">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="grid gap-6 md:grid-cols-2">
                {termsSections.map((section) => (
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
                Questions about these terms?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Reach out if you need clarifications or have concerns about how these terms apply to you.
              </p>
              <div className="mt-6 flex items-center justify-center gap-3">
                <Link to="/contact">
                  <Button className="gap-2">
                    Contact Us
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </Link>
                <a
                  href="mailto:legal@taichinerves.com"
                  className="text-sm text-primary hover:underline"
                >
                  legal@taichinerves.com
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

export default Terms;






