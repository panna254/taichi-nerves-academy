import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Clock, ArrowRight, FileText, HelpCircle, BookOpen, ListChecks, ExternalLink } from "lucide-react";
import { findLectureBySlug, getYoutubeEmbedUrl, getYoutubeThumbnail } from "@/data/lectures";

const resourceIconMap = {
  slides: FileText,
  notes: BookOpen,
  quiz: HelpCircle,
  reference: ExternalLink,
  practice: ListChecks,
} as const;

const resourceLabelMap = {
  slides: "Slides",
  notes: "Notes",
  quiz: "Quiz",
  reference: "Reference",
  practice: "Practice",
} as const;

const LectureDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const lecture = slug ? findLectureBySlug(slug) : undefined;

  if (!lecture) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <div className="text-center space-y-4">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <HelpCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-card-foreground">Lecture not found</h1>
              <p className="mt-1 text-muted-foreground">This lecture may have moved or the link is incorrect.</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Link to="/resources/lectures">
                <Button variant="outline">Browse lectures</Button>
              </Link>
              <Link to="/">
                <Button>Back to home</Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const ResourceIcon = (type: keyof typeof resourceIconMap) => resourceIconMap[type];

  return (
    <>
      <Helmet>
        <title>{lecture.title} - Taichi Nerves Lecture</title>
        <meta name="description" content={`${lecture.description} Watch the lecture and download related resources.`} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-10 lg:py-16">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="grid gap-6 lg:grid-cols-5 lg:items-center">
                <div className="lg:col-span-3 space-y-4">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/10 px-3 py-1 text-xs font-semibold text-primary-foreground">
                    Recent Lecture
                  </span>
                  <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
                    {lecture.title}
                  </h1>
                  <p className="text-primary-foreground/80 text-lg max-w-3xl">{lecture.description}</p>
                  <div className="flex flex-wrap items-center gap-3 text-sm text-primary-foreground/80">
                    <div className="inline-flex items-center gap-2 rounded-full bg-black/20 px-3 py-1">
                      <Clock className="h-4 w-4" />
                      {lecture.duration}
                    </div>
                    <span className="rounded-full bg-primary-foreground/10 px-3 py-1 font-semibold text-primary-foreground">
                      {lecture.level}
                    </span>
                    <span className="rounded-full bg-primary/80 px-3 py-1 font-semibold text-primary-foreground">
                      {lecture.date}
                    </span>
                  </div>
                </div>

                <div className="lg:col-span-2 hidden lg:block">
                  <div className="overflow-hidden rounded-2xl border border-primary/30 shadow-glow">
                    <img
                      src={getYoutubeThumbnail(lecture.youtubeId)}
                      alt={lecture.title}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <section className="py-12 lg:py-16 bg-gradient-subtle">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="grid gap-10 lg:grid-cols-3">
                {/* Video and description */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
                    <AspectRatio ratio={16 / 9}>
                      <iframe
                        src={getYoutubeEmbedUrl(lecture.youtubeId)}
                        title={lecture.title}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full rounded-2xl"
                      />
                    </AspectRatio>
                  </div>

                  <div className="rounded-2xl border border-border bg-card p-6 shadow-soft space-y-4">
                    <h2 className="text-xl font-semibold text-card-foreground">What you'll learn</h2>
                    <p className="text-muted-foreground">
                      Dive into the full session without leaving the site. Pause, rewind, and follow along with the downloadable resources so you can move from watching to practicing.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {lecture.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-muted px-3 py-1 text-xs font-semibold text-muted-foreground">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Resources */}
                <div className="space-y-4">
                  <div className="rounded-2xl border border-border bg-card p-6 shadow-soft">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-semibold text-muted-foreground">Resources</p>
                        <h3 className="text-xl font-bold text-card-foreground">Download & practice</h3>
                      </div>
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                    </div>

                    <div className="mt-4 space-y-3">
                      {lecture.resources.map((resource) => {
                        const Icon = ResourceIcon(resource.type);
                        return (
                          <a
                            key={resource.label}
                            href={resource.url}
                            target="_blank"
                            rel="noreferrer"
                            className="flex items-center justify-between rounded-xl border border-border/60 bg-muted/50 px-4 py-3 transition-colors hover:border-primary hover:bg-muted"
                          >
                            <div className="flex items-center gap-3">
                              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                                <Icon className="h-5 w-5 text-primary" />
                              </div>
                              <div>
                                <p className="font-semibold text-card-foreground">{resource.label}</p>
                                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                                  {resourceLabelMap[resource.type]}
                                </p>
                              </div>
                            </div>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </a>
                        );
                      })}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-dashed border-primary/40 bg-primary/5 p-6 shadow-soft">
                    <h4 className="text-lg font-semibold text-card-foreground">Need more on this topic?</h4>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Explore the full library for related lectures, notes, and quizzes tailored to your study plan.
                    </p>
                    <div className="mt-4 flex gap-3">
                      <Link to="/resources/lectures">
                        <Button className="gap-2">
                          Browse lectures
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Link to="/topics">
                        <Button variant="outline">See topics</Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default LectureDetail;

