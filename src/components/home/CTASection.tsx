import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";

const CTASection = () => {
  return (
    <section className="py-20 lg:py-28 bg-gradient-hero relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute right-0 top-0 h-96 w-96 rounded-full bg-accent blur-3xl" />
        <div className="absolute bottom-0 left-0 h-96 w-96 rounded-full bg-primary-foreground blur-3xl" />
      </div>

      <div className="container relative mx-auto px-4 lg:px-8">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-bold text-accent-foreground">
            <Sparkles className="h-4 w-4" />
            Limited Time Offer
          </div>

          <h2 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl lg:text-5xl">
            Ready to Excel in
            <span className="block">Health Sciences?</span>
          </h2>
          
          <p className="mx-auto mt-6 max-w-xl text-lg text-primary-foreground/80">
            Join our community of dedicated learners and get instant access to all our premium learning resources.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link to="/signup">
              <Button variant="hero" size="xl" className="gap-2 min-w-[200px]">
                Get Started Now
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/contact">
              <Button variant="heroOutline" size="xl" className="min-w-[200px]">
                Contact Us
              </Button>
            </Link>
          </div>

          <p className="mt-6 text-sm text-primary-foreground/60">
            Subscribe today and start your learning journey
          </p>
        </div>
      </div>
    </section>
  );
};

export default CTASection;
