import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, FileText, Headphones, HelpCircle, Lock, ArrowRight } from "lucide-react";

const ResourcesSection = () => {
  const resources = [
    {
      icon: Video,
      title: "Video Lectures",
      description: "High-quality video content covering all major health science topics, explained in clear, engaging ways.",
      href: "/resources/lectures",
      color: "bg-primary",
      count: "500+ Videos",
    },
    {
      icon: FileText,
      title: "Study Notes",
      description: "Comprehensive notes and study guides that complement our video lectures for deeper understanding.",
      href: "/resources/notes",
      color: "bg-secondary",
      count: "200+ Notes",
    },
    {
      icon: Headphones,
      title: "Podcast",
      description: "Learn on the go with our podcast episodes featuring expert discussions and topic reviews.",
      href: "/resources/podcast",
      color: "bg-primary-light",
      count: "100+ Episodes",
    },
    {
      icon: HelpCircle,
      title: "Quizzes",
      description: "Test your knowledge with interactive quizzes designed to reinforce learning and prepare for exams.",
      href: "/resources/quizzes",
      color: "bg-accent",
      count: "1000+ Questions",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-gradient-subtle">
      <div className="container mx-auto px-4 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <span className="inline-block mb-4 text-sm font-semibold uppercase tracking-wider text-primary">
            Learning Resources
          </span>
          <h2 className="font-display text-3xl font-bold text-foreground md:text-4xl lg:text-5xl">
            Everything You Need to
            <span className="text-primary"> Succeed</span>
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Access our complete library of learning materials with a membership subscription.
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {resources.map((resource, index) => (
            <Link
              key={resource.title}
              to={resource.href}
              className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-soft transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Icon */}
              <div className={`mb-4 inline-flex h-14 w-14 items-center justify-center rounded-xl ${resource.color}`}>
                <resource.icon className="h-7 w-7 text-primary-foreground" />
              </div>

              {/* Content */}
              <h3 className="font-display text-xl font-bold text-card-foreground">
                {resource.title}
              </h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                {resource.description}
              </p>

              {/* Count Badge */}
              <div className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                {resource.count}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </div>

              {/* Lock Indicator */}
              <div className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                <Lock className="h-4 w-4 text-muted-foreground" />
              </div>
            </Link>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-12 text-center">
          <Link to="/membership">
            <Button size="lg" className="gap-2">
              Get Full Access
              <ArrowRight className="h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
