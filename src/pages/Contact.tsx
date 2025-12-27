import { useState } from "react";
import { Helmet } from "react-helmet-async";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Mail, Phone, MapPin, Send, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Contact = () => {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Contact form submission will be implemented with backend
    toast({
      title: "Message sent!",
      description: "We'll get back to you as soon as possible.",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const contactInfo = [
    {
      icon: Mail,
      title: "Email",
      value: "hello@taichinerves.com",
      href: "mailto:hello@taichinerves.com",
    },
    {
      icon: Phone,
      title: "Phone",
      value: "+254 700 000 000",
      href: "tel:+254700000000",
    },
    {
      icon: MapPin,
      title: "Location",
      value: "Nairobi, Kenya",
      href: "#",
    },
  ];

  return (
    <>
      <Helmet>
        <title>Contact Us - Taichi Nerves</title>
        <meta name="description" content="Get in touch with Taichi Nerves. We're here to help with any questions about our health science learning platform." />
      </Helmet>

      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">
          {/* Hero */}
          <section className="bg-gradient-hero py-12 lg:py-20">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="mx-auto max-w-2xl text-center">
                <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-accent">
                  <MessageSquare className="h-7 w-7 text-accent-foreground" />
                </div>
                <h1 className="font-display text-3xl font-bold text-primary-foreground md:text-4xl">
                  Get in Touch
                </h1>
                <p className="mt-4 text-lg text-primary-foreground/80">
                  Have questions? We'd love to hear from you.
                </p>
              </div>
            </div>
          </section>

          {/* Contact Section */}
          <section className="py-12 lg:py-20 bg-gradient-subtle">
            <div className="container mx-auto px-4 lg:px-8">
              <div className="grid gap-12 lg:grid-cols-2">
                {/* Contact Info */}
                <div>
                  <h2 className="font-display text-2xl font-bold text-foreground">
                    Contact Information
                  </h2>
                  <p className="mt-4 text-muted-foreground">
                    Reach out to us through any of these channels. We typically respond within 24 hours.
                  </p>

                  <div className="mt-8 space-y-6">
                    {contactInfo.map((item) => (
                      <a
                        key={item.title}
                        href={item.href}
                        className="flex items-start gap-4 rounded-xl bg-card p-4 shadow-soft transition-colors hover:bg-muted"
                      >
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                          <item.icon className="h-6 w-6 text-primary" />
                        </div>
                        <div>
                          <p className="font-semibold text-card-foreground">{item.title}</p>
                          <p className="text-muted-foreground">{item.value}</p>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

                {/* Contact Form */}
                <div className="rounded-2xl bg-card p-8 shadow-soft">
                  <h2 className="font-display text-2xl font-bold text-card-foreground">
                    Send us a Message
                  </h2>
                  
                  <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                    <div className="grid gap-5 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          placeholder="Your name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="Your email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          required
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        placeholder="Your message..."
                        rows={5}
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        required
                      />
                    </div>

                    <Button type="submit" size="lg" className="w-full gap-2">
                      <Send className="h-5 w-5" />
                      Send Message
                    </Button>
                  </form>
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

export default Contact;
