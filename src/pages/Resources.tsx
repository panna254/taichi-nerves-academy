import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Video, FileText, Headphones, HelpCircle, Lock, Play, Clock, ArrowRight } from "lucide-react";

const resourceTypes = {
  lectures: {
    title: "Video Lectures",
    description: "High-quality video content covering all major health science topics",
    icon: Video,
  },
  notes: {
    title: "Study Notes",
    description: "Comprehensive notes and study guides for deeper understanding",
    icon: FileText,
  },
  podcast: {
    title: "Podcast",
    description: "Learn on the go with expert discussions and topic reviews",
    icon: Headphones,
  },
  quizzes: {
    title: "Quizzes",
    description: "Test your knowledge with interactive quizzes",
    icon: HelpCircle,
  },
};

// Mock data - will be replaced with real data from backend
const mockContent = [
  { id: 1, title: "Introduction to Anatomy", duration: "45 min", locked: true },
  { id: 2, title: "The Nervous System Overview", duration: "38 min", locked: true },
  { id: 3, title: "Cardiovascular System Basics", duration: "52 min", locked: true },
  { id: 4, title: "Understanding the Respiratory System", duration: "41 min", locked: true },
  { id: 5, title: "Digestive System Functions", duration: "35 min", locked: true },
  { id: 6, title: "Musculoskeletal System", duration: "48 min", locked: true },
];

const quizExamples = [
  {
    id: 1,
    question: "What is the significance of the Philadelphia chromosome in chronic myelogenous leukemia?",
    options: [
      "It results from the deletion of chromosome 13q.",
      "It is characterized by the overexpression of VEGF.",
      "It involves the exchange of segments between chromosomes 9 and 22.",
      "It is associated with the reactivation of telomerase.",
    ],
  },
  {
    id: 2,
    question: "Which cranial nerve controls most extraocular muscles?",
    options: [
      "CN II (Optic nerve)",
      "CN III (Oculomotor nerve)",
      "CN V (Trigeminal nerve)",
      "CN VIII (Vestibulocochlear nerve)",
    ],
  },
];

const Resources = () => {
  const { type } = useParams<{ type: string }>();
  const resourceType = resourceTypes[type as keyof typeof resourceTypes] || resourceTypes.lectures;
  const Icon = resourceType.icon;
  const isQuizzesPage = type === "quizzes";
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});

  return (
    <>
      <Helmet>
        <title>{resourceType.title} - Taichi Nerves</title>
        <meta name="description" content={`Access ${resourceType.title.toLowerCase()} on Taichi Nerves. ${resourceType.description}`} />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-12 lg:py-20">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-accent">
                  <Icon className="h-8 w-8 text-accent-foreground" />
                </div>
                <div>
                  <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                    {resourceType.title}
                  </h1>
                  <p className="mt-1 text-primary-foreground/80">
                    {resourceType.description}
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Content Grid */}
          <section className="py-12 lg:py-16 bg-gradient-subtle">
            <div className="container mx-auto px-4 lg:px-8">
              {/* Subscription Banner */}
              <div className="mb-8 rounded-2xl bg-card p-6 shadow-soft border border-primary/20">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                      <Lock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-card-foreground">
                        Subscribe to Access All Content
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Unlock all {resourceType.title.toLowerCase()} with a membership
                      </p>
                    </div>
                  </div>
                  <Link to="/signup">
                    <Button variant="cta" className="gap-2">
                      Get Access
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Content List */}
              <div className="grid gap-4">
                {isQuizzesPage
                  ? quizExamples.map((quiz, index) => (
                      <div
                        key={quiz.id}
                        className="group relative overflow-hidden rounded-xl bg-card p-5 shadow-soft transition-all hover:shadow-elevated"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex items-start gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                              <HelpCircle className="h-5 w-5 text-primary" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                {quiz.question}
                              </h3>
                              <div className="space-y-2 text-sm text-muted-foreground">
                                {quiz.options.map((option) => (
                                  <label key={option} className="flex cursor-pointer items-start gap-2">
                                    <input
                                      type="radio"
                                      name={`quiz-${quiz.id}`}
                                      value={option}
                                      checked={selectedAnswers[quiz.id] === option}
                                      onChange={() =>
                                        setSelectedAnswers((prev) => ({
                                          ...prev,
                                          [quiz.id]: option,
                                        }))
                                      }
                                      className="mt-1 h-4 w-4 shrink-0 accent-primary"
                                    />
                                    <span>{option}</span>
                                  </label>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))
                  : mockContent.map((item, index) => (
                      <div
                        key={item.id}
                        className="group relative overflow-hidden rounded-xl bg-card p-5 shadow-soft transition-all hover:shadow-elevated"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                              {item.locked ? (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Play className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                                {item.title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {item.duration}
                              </div>
                            </div>
                          </div>

                          {item.locked ? (
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                              <Lock className="h-4 w-4 text-muted-foreground" />
                            </div>
                          ) : (
                            <Button size="sm" variant="ghost" className="gap-2">
                              <Play className="h-4 w-4" />
                              Play
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
              </div>

              {/* More Content Coming */}
              <div className="mt-8 text-center">
                <p className="text-muted-foreground">
                  More content coming soon. Subscribe to get access when it's available.
                </p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Resources;
