import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/home/HeroSection";
import ResourcesSection from "@/components/home/ResourcesSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import CTASection from "@/components/home/CTASection";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Taichi Nerves - Master Health Sciences Education</title>
        <meta 
          name="description" 
          content="Comprehensive medical education platform with video lectures, notes, podcasts, and quizzes. Join thousands of students mastering health sciences with Taichi Nerves." 
        />
        <meta name="keywords" content="medical education, health sciences, video lectures, study notes, medical quizzes, online learning" />
      </Helmet>
      
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          <HeroSection />
          <ResourcesSection />
          <FeaturesSection />
          <CTASection />
        </main>
        <Footer />
      </div>
    </>
  );
};

export default Index;
