import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { BookOpen, ArrowRight, Clock, Video } from "lucide-react";

// Mock topics - will be replaced with real data from backend
const topics = [
  {
    id: 1,
    title: "Human Anatomy",
    description: "Study the structure of the human body and its parts",
    lessonCount: 24,
    duration: "8 hours",
  },
  {
    id: 2,
    title: "Physiology",
    description: "Understand how the body's systems function together",
    lessonCount: 18,
    duration: "6 hours",
  },
  {
    id: 3,
    title: "Pharmacology",
    description: "Learn about drugs and their effects on the body",
    lessonCount: 15,
    duration: "5 hours",
  },
  {
    id: 4,
    title: "Pathology",
    description: "Study the causes and effects of diseases",
    lessonCount: 20,
    duration: "7 hours",
  },
  {
    id: 5,
    title: "Microbiology",
    description: "Explore microorganisms and their role in health",
    lessonCount: 12,
    duration: "4 hours",
  },
  {
    id: 6,
    title: "Biochemistry",
    description: "Chemical processes within living organisms",
    lessonCount: 16,
    duration: "5.5 hours",
  },
];

const Topics = () => {
  return (
    <>
      <Helmet>
        <title>Topics - Taichi Nerves</title>
        <meta name="description" content="Browse all health science topics on Taichi Nerves. From anatomy to pharmacology, find comprehensive learning resources." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-12 lg:py-20">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
                  Ueke Zote
                </h1>
                <p className="mt-4 text-lg text-primary-foreground/80">
                  Explore all health science topics covered in our comprehensive curriculum
                </p>
              </div>
            </div>
          </section>

          {/* Topics Grid */}
          <section className="py-12 lg:py-16 bg-gradient-subtle">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic, index) => (
                  <div
                    key={topic.id}
                    className="group rounded-2xl bg-card p-6 shadow-soft transition-all hover:shadow-elevated hover:-translate-y-1"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary mb-4">
                      <BookOpen className="h-7 w-7 text-primary-foreground" />
                    </div>
                    
                    <h3 className="font-display text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                      {topic.title}
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {topic.description}
                    </p>

                    <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Video className="h-4 w-4" />
                        {topic.lessonCount} lessons
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {topic.duration}
                      </div>
                    </div>

                    <Link to="/membership" className="mt-4 block">
                      <Button variant="outline" className="w-full gap-2">
                        View Topic
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA */}
          <section className="py-12 bg-muted/50">
            <div className="container mx-auto px-4 lg:px-8 text-center">
              <h2 className="font-display text-2xl font-bold text-foreground">
                More topics coming soon
              </h2>
              <p className="mt-2 text-muted-foreground">
                Subscribe to get notified when new topics are added
              </p>
              <Link to="/signup" className="mt-6 inline-block">
                <Button className="gap-2">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
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

export default Topics;
