import { CheckCircle2, Zap, Clock, Shield, Download, Smartphone } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Zap,
      title: "Learn at Your Pace",
      description: "Self-paced learning with lifetime access to all content once subscribed.",
    },
    {
      icon: CheckCircle2,
      title: "Expert-Created Content",
      description: "All materials created by qualified health science professionals and educators.",
    },
    {
      icon: Clock,
      title: "Regular Updates",
      description: "New content added regularly to keep you up-to-date with the latest in health sciences.",
    },
    {
      icon: Download,
      title: "Downloadable Notes",
      description: "Download study notes and resources for offline studying anytime, anywhere.",
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Access all content on any device - desktop, tablet, or mobile phone.",
    },
    {
      icon: Shield,
      title: "Secure Platform",
      description: "Your learning progress and data are protected with enterprise-grade security.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          {/* Left Content */}
          <div>
            <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
              Why Choose Us
            </span>
            <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl">
              A Better Way to
              <span className="text-primary"> Learn Health Sciences</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground">
              We've designed our platform with students in mind, focusing on clarity, accessibility, and comprehensive coverage of health science topics.
            </p>

            {/* Features List */}
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {features.map((feature, index) => (
                <div
                  key={feature.title}
                  className="flex gap-3 p-4 rounded-xl bg-muted/50 transition-colors hover:bg-muted"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-card-foreground">{feature.title}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Visual */}
          <div className="relative">
            <div className="aspect-square rounded-3xl bg-gradient-hero p-8 shadow-glow">
              <div className="h-full w-full rounded-2xl bg-card/10 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center">
                <div className="text-center p-8">
                  <div className="inline-flex h-20 w-20 items-center justify-center rounded-2xl bg-accent mb-6">
                    <Zap className="h-10 w-10 text-accent-foreground" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-primary-foreground">
                    Start Your Journey
                  </h3>
                  <p className="mt-2 text-primary-foreground/80">
                    Join thousands of students mastering health sciences
                  </p>
                </div>
              </div>
            </div>
            
            {/* Floating Cards */}
            <div className="absolute -left-4 top-1/4 rounded-xl bg-card p-4 shadow-elevated animate-float">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <CheckCircle2 className="h-5 w-5 text-secondary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Quiz Completed</p>
                  <p className="text-xs text-muted-foreground">Score: 95%</p>
                </div>
              </div>
            </div>
            
            <div className="absolute -right-4 bottom-1/4 rounded-xl bg-card p-4 shadow-elevated animate-float animation-delay-300">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                  <Clock className="h-5 w-5 text-primary-foreground" />
                </div>
                <div>
                  <p className="font-semibold text-sm">12 Hours</p>
                  <p className="text-xs text-muted-foreground">This Week</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
