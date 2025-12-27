import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Check, Sparkles, Video, FileText, Headphones, HelpCircle, ArrowRight } from "lucide-react";

const Membership = () => {
  const features = [
    {
      icon: Video,
      title: "500+ Video Lectures",
      description: "Comprehensive video content covering all major health science topics",
    },
    {
      icon: FileText,
      title: "200+ Study Notes",
      description: "Downloadable notes and guides for offline studying",
    },
    {
      icon: Headphones,
      title: "100+ Podcast Episodes",
      description: "Learn on the go with expert discussions and reviews",
    },
    {
      icon: HelpCircle,
      title: "1000+ Quiz Questions",
      description: "Interactive quizzes to test and reinforce your knowledge",
    },
  ];

  const benefits = [
    "Unlimited access to all content",
    "New content added weekly",
    "Mobile and desktop access",
    "Downloadable resources",
    "Progress tracking",
    "Priority support",
    "Cancel anytime",
    "Exclusive member community",
  ];

  return (
    <>
      <Helmet>
        <title>Membership - Taichi Nerves</title>
        <meta name="description" content="Join Taichi Nerves membership for unlimited access to health science learning resources including video lectures, notes, podcasts, and quizzes." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
                  <Sparkles className="h-4 w-4" />
                  Membership
                </div>
                <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
                  Unlock Your Full
                  <span className="block">Learning Potential</span>
                </h1>
                <p className="mt-6 text-lg text-primary-foreground/80">
                  Get unlimited access to all our premium health science resources with a simple monthly subscription.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing Card */}
          <section className="py-16 lg:py-24 bg-gradient-subtle">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-xl">
                <div className="rounded-3xl bg-card p-8 shadow-elevated border-2 border-primary/20">
                  <div className="text-center">
                    <h2 className="font-display text-2xl font-bold text-card-foreground">
                      Monthly Subscription
                    </h2>
                    <div className="mt-4 flex items-baseline justify-center gap-1">
                      <span className="font-display text-5xl font-bold text-primary">Ksh 500</span>
                      <span className="text-muted-foreground">/month</span>
                    </div>
                    <p className="mt-2 text-muted-foreground">
                      Full access to all resources
                    </p>
                  </div>

                  <div className="mt-8 grid gap-3">
                    {benefits.map((benefit) => (
                      <div key={benefit} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <Check className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-card-foreground">{benefit}</span>
                      </div>
                    ))}
                  </div>

                  <Link to="/signup" className="mt-8 block">
                    <Button size="xl" className="w-full gap-2">
                      Get Started
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* What's Included */}
          <section className="py-16 lg:py-24 bg-background">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-12">
                <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                  What's Included
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Everything you need to succeed in your health science studies
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {features.map((feature) => (
                  <div key={feature.title} className="rounded-2xl bg-card p-6 shadow-soft text-center">
                    <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl bg-primary">
                      <feature.icon className="h-7 w-7 text-primary-foreground" />
                    </div>
                    <h3 className="font-display text-lg font-bold text-card-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {feature.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-muted/50">
            <div className="container mx-auto px-4 lg:px-8 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground md:text-3xl">
                Ready to Start Learning?
              </h2>
              <p className="mt-4 text-muted-foreground">
                Join our community of health science learners today
              </p>
              <Link to="/signup" className="mt-6 inline-block">
                <Button size="lg" className="gap-2">
                  Subscribe Now
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Membership;
