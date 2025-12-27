import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Heart, BookOpen, Users, Globe, ArrowRight } from "lucide-react";

const Donate = () => {
  const impactAreas = [
    {
      icon: BookOpen,
      title: "Expand Content Library",
      description: "Help us create more video lectures, notes, and quizzes covering new topics.",
    },
    {
      icon: Users,
      title: "Support Students",
      description: "Enable scholarships for students who cannot afford the subscription.",
    },
    {
      icon: Globe,
      title: "Reach More Learners",
      description: "Help us expand our platform to reach health science students everywhere.",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Donate - Taichi Nerves</title>
        <meta name="description" content="Support Taichi Nerves' mission to make health science education accessible. Your donation helps us create more learning resources." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-secondary">
                  <Heart className="h-8 w-8 text-secondary-foreground" />
                </div>
                <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
                  Support Our Mission
                </h1>
                <p className="mt-6 text-lg text-primary-foreground/80">
                  Your contribution helps us make quality health science education accessible to more students.
                </p>
                <Link to="/contact" className="mt-8 inline-block">
                  <Button variant="hero" size="xl" className="gap-2">
                    <Heart className="h-5 w-5" />
                    Make a Donation
                  </Button>
                </Link>
              </div>
            </div>
          </section>

          {/* Impact Section */}
          <section className="py-16 lg:py-24 bg-gradient-subtle">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-2xl text-center mb-12">
                <h2 className="font-display text-3xl font-bold text-foreground">
                  Your Impact
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  See how your donation makes a difference
                </p>
              </div>

              <div className="grid gap-8 md:grid-cols-3">
                {impactAreas.map((area) => (
                  <div key={area.title} className="text-center p-6 rounded-2xl bg-card shadow-soft">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
                      <area.icon className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-bold text-card-foreground">
                      {area.title}
                    </h3>
                    <p className="mt-2 text-muted-foreground">
                      {area.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-muted/50">
            <div className="container mx-auto px-4 lg:px-8 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Ready to Make a Difference?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Contact us to learn more about how you can support our mission
              </p>
              <Link to="/contact" className="mt-6 inline-block">
                <Button className="gap-2">
                  Get in Touch
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

export default Donate;
