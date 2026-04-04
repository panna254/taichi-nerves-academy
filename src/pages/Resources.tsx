import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { supabase } from "@/lib/supabase";
import { useRealtimeContent } from "@/hooks/useRealtimeContent";
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

// Real data fetching functions
const Resources = () => {
  const { type } = useParams<{ type: string }>();
  const resourceType = resourceTypes[type as keyof typeof resourceTypes] || resourceTypes.lectures;
  const Icon = resourceType.icon;
  const isQuizzesPage = type === "quizzes";
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string>>({});
  const [resources, setResources] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get table name based on resource type
  const getTableName = () => {
    switch (type) {
      case 'lectures':
        return 'content';
      case 'notes':
        return 'content';
      case 'podcast':
        return 'content';
      case 'quizzes':
        return 'content';
      default:
        return 'content';
    }
  };

  // Fetch resources from database
  const fetchResources = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from(getTableName())
        .select(`
          *,
          topics(name, slug)
        `)
        .eq('status', 'published')
        .eq('content_type', type?.slice(0, -1) || 'video') // Remove 's' from plural
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      setError('Failed to load resources');
    } finally {
      setLoading(false);
    }
  };

  // Always fetch fresh data when component mounts or tab changes
  useEffect(() => {
    fetchResources();
  }, [type]);

  // Setup realtime updates
  useRealtimeContent(type?.slice(0, -1) || 'video', fetchResources);

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
                {loading ? (
                  // Loading skeleton
                  [...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="animate-pulse rounded-xl bg-card p-5 shadow-soft"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 shrink-0 rounded-xl bg-muted"></div>
                          <div className="space-y-2">
                            <div className="h-6 w-64 rounded bg-muted"></div>
                            <div className="h-4 w-32 rounded bg-muted"></div>
                          </div>
                        </div>
                        <div className="h-8 w-20 rounded bg-muted"></div>
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <div className="col-span-full">
                    <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
                      <h3 className="text-lg font-semibold text-red-800">Error Loading Resources</h3>
                      <p className="mt-2 text-red-600">{error}</p>
                      <Button onClick={fetchResources} className="mt-4">
                        Try Again
                      </Button>
                    </div>
                  </div>
                ) : resources.length === 0 ? (
                  <div className="col-span-full text-center py-12">
                    <div className="rounded-xl border border-muted bg-muted/20 p-8">
                      <div className="mx-auto h-16 w-16 items-center justify-center rounded-2xl bg-muted flex mb-4">
                        <Icon className="h-8 w-8 text-muted-foreground" />
                      </div>
                      <h3 className="text-lg font-semibold text-card-foreground mb-2">
                        No {resourceType.title} Available
                      </h3>
                      <p className="text-muted-foreground">
                        {resourceType.title} will appear here once they're published by administrators.
                      </p>
                    </div>
                  </div>
                ) : isQuizzesPage ? (
                  // Render quizzes
                  resources.map((quiz, index) => (
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
                              {quiz.title}
                            </h3>
                            {quiz.summary && (
                              <p className="text-sm text-muted-foreground">{quiz.summary}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  // Render other content types
                  resources.map((item, index) => (
                    <div
                      key={item.id}
                      className="group relative overflow-hidden rounded-xl bg-card p-5 shadow-soft transition-all hover:shadow-elevated"
                      style={{ animationDelay: `${index * 50}ms` }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted">
                            <Play className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-card-foreground group-hover:text-primary transition-colors">
                              {item.title}
                            </h3>
                            {item.topics && item.topics.length > 0 && (
                              <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                                <span>{item.topics[0].name}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <Button size="sm" variant="ghost" className="gap-2">
                          <Play className="h-4 w-4" />
                          Play
                        </Button>
                      </div>
                    </div>
                  ))
                )}
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
