import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Lock, ArrowRight } from "lucide-react";

const ResourcesSection = () => {
  const fallbackImage = "/placeholder.svg";

  const resources = [
    {
      image: "https://picsum.photos/seed/video-lectures/900/675",
      title: "Video Lectures",
      description: "High-quality video content covering all major health science topics, explained in clear, engaging ways.",
      href: "/resources/lectures",
      count: "500+ Videos",
    },
    {
      image: "https://picsum.photos/seed/study-notes/900/675",
      title: "Study Notes",
      description: "Comprehensive notes and study guides that complement our video lectures for deeper understanding.",
      href: "/resources/notes",
      count: "200+ Notes",
    },
    {
      image: "https://picsum.photos/seed/podcast/900/675",
      title: "Podcast",
      description: "Learn on the go with our podcast episodes featuring expert discussions and topic reviews.",
      href: "/resources/podcast",
      count: "100+ Episodes",
    },
    {
      image: "https://picsum.photos/seed/quizzes/900/675",
      title: "Quizzes",
      description: "Test your knowledge with interactive quizzes designed to reinforce learning and prepare for exams.",
      href: "/resources/quizzes",
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
              className="group relative overflow-hidden rounded-2xl bg-card shadow-soft transition-all duration-300 hover:shadow-elevated hover:-translate-y-1"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="relative aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={resource.image}
                  alt={resource.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                  loading="lazy"
                  decoding="async"
                  onError={(e) => {
                    e.currentTarget.src = fallbackImage;
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
                <div className="absolute left-4 bottom-4 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-card-foreground backdrop-blur-sm">
                  {resource.count}
                </div>
              </div>

              <div className="p-6 space-y-2">
                <h3 className="font-display text-xl font-bold text-card-foreground">
                  {resource.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {resource.description}
                </p>

                <div className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  {resource.count}
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>

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
