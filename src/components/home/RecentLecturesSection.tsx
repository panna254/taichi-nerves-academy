import { Link } from "react-router-dom";
import { ArrowRight, Clock, Play } from "lucide-react";
import { recentLectures, getYoutubeThumbnail } from "@/data/lectures";

const RecentLecturesSection = () => {
  return (
    <section className="py-20 lg:py-28 bg-background">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              <span className="h-2 w-2 rounded-full bg-primary" />
              Recent Lectures
            </div>
            <div className="space-y-2">
              <h2 className="font-display text-3xl font-black leading-tight text-foreground md:text-4xl lg:text-5xl">
                Fresh from the <span className="text-primary">Classroom</span>
              </h2>
              <div className="h-1 w-16 rounded-full bg-primary/40" />
            </div>
            <p className="max-w-2xl text-lg text-muted-foreground">
              Catch up on the latest sessions. Watch directly on Taichi Nerves and grab the notes, quizzes, and references that come with each lecture.
            </p>
          </div>

          <Link to="/resources/lectures" className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80">
            View all lectures
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {recentLectures.map((lecture, index) => (
            <Link
              key={lecture.slug}
              to={`/lectures/${lecture.slug}`}
              className="group relative overflow-hidden rounded-2xl border border-border/60 bg-card shadow-soft transition-all duration-300 hover:-translate-y-1 hover:shadow-elevated"
              style={{ animationDelay: `${index * 60}ms` }}
            >
              <div className="relative">
                <img
                  src={getYoutubeThumbnail(lecture.youtubeId)}
                  alt={lecture.title}
                  className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-[1.03] md:h-64"
                  loading="lazy"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

                <div className="absolute left-3 top-3 inline-flex items-center gap-2 rounded-full bg-black/70 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
                  <Clock className="h-4 w-4" />
                  {lecture.duration}
                </div>

                <div className="absolute bottom-3 right-3 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1 text-xs font-semibold text-card-foreground backdrop-blur-sm">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                    <Play className="h-3 w-3" />
                  </div>
                  Watch now
                </div>
              </div>

              <div className="space-y-3 p-5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                  <span>{lecture.date}</span>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] text-primary">{lecture.level}</span>
                </div>

                <div>
                  <h3 className="font-display text-base font-semibold text-card-foreground transition-colors group-hover:text-primary md:text-lg">
                    {lecture.title}
                  </h3>
                  <p className="mt-1 text-xs text-muted-foreground md:text-sm">
                    {lecture.description}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  {lecture.tags.map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full bg-muted px-2 py-1 text-[11px] font-medium text-muted-foreground"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center gap-2 text-xs font-semibold text-primary">
                  Continue to lecture
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RecentLecturesSection;

