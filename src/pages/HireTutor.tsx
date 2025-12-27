import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { GraduationCap, Users, Clock, CheckCircle, ArrowRight, Star } from "lucide-react";

const HireTutor = () => {
  const benefits = [
    "One-on-one personalized sessions",
    "Flexible scheduling",
    "Expert health science tutors",
    "Focus on your weak areas",
    "Exam preparation support",
    "Progress tracking",
  ];

  const tutors = [
    {
      name: "Dr. Sarah Johnson",
      specialty: "Anatomy & Physiology",
      rating: 4.9,
      sessions: 200,
    },
    {
      name: "Prof. Michael Okonkwo",
      specialty: "Pharmacology",
      rating: 4.8,
      sessions: 180,
    },
    {
      name: "Dr. Emily Chen",
      specialty: "Biochemistry",
      rating: 4.9,
      sessions: 150,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Hire a Tutor - Taichi Nerves</title>
        <meta name="description" content="Get personalized health science tutoring from expert tutors. One-on-one sessions tailored to your learning needs." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-16 lg:py-24">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-3xl text-center">
                <div className="mb-6 inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                  <GraduationCap className="h-8 w-8 text-accent-foreground" />
                </div>
                <h1 className="font-display text-4xl font-bold text-primary-foreground md:text-5xl">
                  Learn from Expert Tutors
                </h1>
                <p className="mt-6 text-lg text-primary-foreground/80">
                  Get personalized one-on-one tutoring sessions from qualified health science educators.
                </p>
              </div>
            </div>
          </section>

          {/* Benefits */}
          <section className="py-16 lg:py-24 bg-gradient-subtle">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2 items-center">
                <div>
                  <h2 className="font-display text-3xl font-bold text-foreground">
                    Why Hire a Tutor?
                  </h2>
                  <p className="mt-4 text-lg text-muted-foreground">
                    Sometimes you need personalized attention to truly master complex health science topics.
                  </p>

                  <ul className="mt-8 space-y-4">
                    {benefits.map((benefit) => (
                      <li key={benefit} className="flex items-center gap-3">
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                          <CheckCircle className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-foreground">{benefit}</span>
                      </li>
                    ))}
                  </ul>

                  <Link to="/contact" className="mt-8 inline-block">
                    <Button size="lg" className="gap-2">
                      Request a Tutor
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </Link>
                </div>

                {/* Tutors Preview */}
                <div className="space-y-4">
                  {tutors.map((tutor) => (
                    <div key={tutor.name} className="rounded-xl bg-card p-5 shadow-soft">
                      <div className="flex items-center gap-4">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                          <GraduationCap className="h-7 w-7 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold text-card-foreground">{tutor.name}</h3>
                          <p className="text-sm text-muted-foreground">{tutor.specialty}</p>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-1 text-accent">
                            <Star className="h-4 w-4 fill-current" />
                            <span className="font-semibold">{tutor.rating}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{tutor.sessions}+ sessions</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4 lg:px-8">
              <h2 className="font-display text-2xl font-bold text-foreground text-center mb-12">
                How It Works
              </h2>
              
              <div className="grid gap-8 md:grid-cols-3">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                    1
                  </div>
                  <h3 className="font-semibold text-foreground">Contact Us</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Tell us about your learning needs and preferred schedule
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                    2
                  </div>
                  <h3 className="font-semibold text-foreground">Get Matched</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We'll match you with the perfect tutor for your needs
                  </p>
                </div>
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xl">
                    3
                  </div>
                  <h3 className="font-semibold text-foreground">Start Learning</h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Begin your personalized tutoring sessions
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-16 bg-muted/50">
            <div className="container mx-auto px-4 lg:px-8 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground">
                Ready to Get Started?
              </h2>
              <p className="mt-2 text-muted-foreground">
                Contact us to find your perfect tutor match
              </p>
              <Link to="/contact" className="mt-6 inline-block">
                <Button className="gap-2">
                  Request a Tutor
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

export default HireTutor;
