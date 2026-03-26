import { Link, useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import AuthAwareCTA from "@/components/common/AuthAwareCTA";
import { Check, Sparkles, Video, FileText, Headphones, HelpCircle, ArrowRight } from "lucide-react";

const Membership = () => {
  const navigate = useNavigate();
  
  const subscriptionPlans = [
    {
      id: "12m",
      name: "1 Year",
      price: 149,
      billing: "Billed once yearly",
      popular: true,
      duration: "12 months"
    },
    {
      id: "6m",
      name: "6 Months",
      price: 87,
      billing: "Billed every 6 months",
      popular: false,
      duration: "6 months"
    },
    {
      id: "3m",
      name: "3 Months",
      price: 40,
      billing: "Billed every 3 months",
      popular: false,
      duration: "3 months"
    },
  ];

  const handleSubscribe = (plan: typeof subscriptionPlans[0]) => {
    navigate('/checkout', { 
      state: { 
        id: plan.id,
        name: plan.name,
        price: plan.price,
        duration: plan.duration,
        billing: plan.billing
      } 
    });
  };

  const features = [
    {
      icon: Video,
      title: "Taichi Nerves Video Content Every Week",
      description: "Weekly premium video lessons designed to keep your learning consistent",
    },
    {
      icon: FileText,
      title: "Premium Notes for Each Lecture",
      description: "High-quality notes to reinforce every topic and improve retention",
    },
    {
      icon: Headphones,
      title: "New Podcast Episodes Every Week",
      description: "Stay updated with weekly podcast sessions and expert insights",
    },
    {
      icon: HelpCircle,
      title: "Quizzes for Each Lecture",
      description: "Practice each lesson with focused quizzes and instant feedback",
    },
  ];

  const includedItems = [
    "Taichi Nerves video content every week",
    "Premium Notes for Each Lecture",
    "Quizzes for each Lecture",
    "New Podcast episodes every week",
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
                  Choose a subscription plan that fits your study timeline and get full premium access.
                </p>
              </div>
            </div>
          </section>

          {/* Pricing */}
          <section className="py-16 lg:py-24 bg-gradient-subtle">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-3xl text-center mb-10">
                <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
                  Subscription Plans
                </h2>
                <p className="mt-4 text-lg text-muted-foreground">
                  Pick your preferred duration and subscribe instantly.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                {subscriptionPlans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`rounded-3xl bg-card p-8 shadow-soft border-2 ${
                      plan.popular ? "border-primary/40 shadow-elevated" : "border-border"
                    }`}
                  >
                    <div className="text-center">
                      {plan.popular && (
                        <div className="mb-4 inline-flex rounded-full bg-primary px-3 py-1 text-xs font-bold text-primary-foreground">
                          Best Value
                        </div>
                      )}
                      <h3 className="font-display text-2xl font-bold text-card-foreground">{plan.name}</h3>
                      <p className="mt-2 text-4xl font-bold text-primary">${plan.price}</p>
                      <p className="mt-2 text-sm text-muted-foreground">{plan.billing}</p>
                    </div>

                    <div className="mt-8 grid gap-3">
                      {includedItems.map((item) => (
                        <div key={item} className="flex items-center gap-3">
                          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10">
                            <Check className="h-4 w-4 text-primary" />
                          </div>
                          <span className="text-card-foreground text-sm">{item}</span>
                        </div>
                      ))}
                    </div>

                    <Button 
                      variant="cta" 
                      size="xl" 
                      className="w-full gap-2"
                      onClick={() => handleSubscribe(plan)}
                    >
                      Subscribe
                      <ArrowRight className="h-5 w-5" />
                    </Button>
                  </div>
                ))}
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
              <Button 
                variant="cta" 
                size="lg"
                onClick={() => handleSubscribe(subscriptionPlans[0])} // Default to 1 year plan
                className="gap-2"
              >
                Subscribe Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Membership;
