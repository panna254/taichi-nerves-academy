import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Play, BookOpen, Users, Award } from "lucide-react";

const HeroSection = () => {
  const stats = [
    { icon: BookOpen, value: "500+", label: "Video Lectures" },
    { icon: Users, value: "10K+", label: "Students" },
    { icon: Award, value: "50+", label: "Topics Covered" },
  ];

  return (
    <section className="relative overflow-hidden bg-gradient-hero py-20 lg:py-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* Floating Elements */}
      <div className="absolute right-10 top-20 h-32 w-32 rounded-full bg-accent/20 blur-3xl animate-float" />
      <div className="absolute bottom-20 left-10 h-40 w-40 rounded-full bg-primary-foreground/10 blur-3xl animate-float animation-delay-200" />

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-4 py-2 text-sm font-medium text-primary-foreground backdrop-blur-sm animate-fade-in">
            <span className="flex h-2 w-2 rounded-full bg-accent" />
            Medical Education Reimagined
          </div>

          {/* Headline */}
          <h1 className="font-display text-4xl font-black leading-tight text-primary-foreground md:text-5xl lg:text-6xl animate-slide-up">
            Master Health Sciences
            <span className="block mt-2">
              with <span className="text-accent">Taichi Nerves</span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-lg text-primary-foreground/80 md:text-xl animate-slide-up animation-delay-100">
            Comprehensive video lectures, detailed notes, podcasts, and quizzes designed to help you excel in your health science studies.
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row animate-slide-up animation-delay-200">
            <Link to="/signup">
              <Button variant="hero" size="xl" className="gap-2">
                <Play className="h-5 w-5" />
                Start Learning Today
              </Button>
            </Link>
            <Link to="/resources/lectures">
              <Button variant="heroOutline" size="xl">
                Browse Resources
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 animate-slide-up animation-delay-300">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/10 backdrop-blur-sm">
                  <stat.icon className="h-6 w-6 text-accent" />
                </div>
                <p className="font-display text-2xl font-bold text-primary-foreground md:text-3xl">
                  {stat.value}
                </p>
                <p className="text-sm text-primary-foreground/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
