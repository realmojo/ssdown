"use client";

import {
  Mail,
  Send,
  Clock,
  Shield,
  MessageSquare,
  FileWarning,
  HelpCircle,
  Briefcase,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export const ContactClient = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 text-center bg-gray-50 dark:bg-gray-900/20">
        <div className="container px-4 md:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white">
            Contact Us
          </h1>
          <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl dark:text-gray-300">
            Have questions, feedback, or need help? We're here for you. Reach
            out to us and we'll respond as soon as possible.
          </p>
        </div>
      </section>

      {/* Email Contact Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="md:col-span-3">
            <Card className="border shadow-lg max-w-2xl mx-auto text-center">
              <CardHeader>
                <CardTitle className="text-2xl">Get in Touch</CardTitle>
                <CardDescription className="text-lg mt-2">
                  For support, copyright, or business inquiries, please email us
                  directly.
                </CardDescription>
              </CardHeader>
              <CardContent className="py-12 space-y-8">
                <div className="flex justify-center">
                  <div className="bg-indigo-100 dark:bg-indigo-900/30 p-8 rounded-full">
                    <Mail className="h-12 w-12 text-indigo-600 dark:text-indigo-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-muted-foreground">
                    Official Support Email
                  </p>
                  <a
                    href="mailto:support@ssdown.app"
                    className="text-3xl font-bold hover:text-indigo-600 transition-colors block"
                  >
                    support@ssdown.app
                  </a>
                </div>

                <div className="pt-4">
                  <Button
                    size="lg"
                    className="bg-indigo-600 hover:bg-indigo-700 text-lg px-8 py-6 h-auto"
                    asChild
                  >
                    <a href="mailto:support@ssdown.app">
                      <Send className="mr-2 h-5 w-5" />
                      Send an Email
                    </a>
                  </Button>
                </div>

                <p className="text-sm text-muted-foreground pt-8">
                  We aim to respond to all inquiries within 24 business hours.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Categories */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/20 border-y">
        <div className="container px-4 md:px-6 max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">
            How Can We Help?
          </h2>
          <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
            We handle different types of inquiries to ensure you get the most
            relevant and timely support. Here's what you can contact us about.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: HelpCircle,
                title: "General Support",
                desc: "Having trouble using our tools? Experiencing errors or unexpected behavior? Send us the details and we'll help you resolve it quickly.",
                color: "text-blue-500",
                bg: "bg-blue-100 dark:bg-blue-900/30",
              },
              {
                icon: FileWarning,
                title: "Copyright & DMCA",
                desc: "If you believe your copyrighted content is being accessed improperly through our service, please contact us with the relevant details for prompt resolution.",
                color: "text-red-500",
                bg: "bg-red-100 dark:bg-red-900/30",
              },
              {
                icon: Briefcase,
                title: "Business Inquiries",
                desc: "Interested in partnerships, advertising opportunities, or integrating with SSDown? We're open to collaborations that align with our mission.",
                color: "text-green-500",
                bg: "bg-green-100 dark:bg-green-900/30",
              },
              {
                icon: MessageSquare,
                title: "Feedback & Suggestions",
                desc: "Your feedback shapes our product. Tell us what features you'd like to see, what works well, or where we can improve the user experience.",
                color: "text-purple-500",
                bg: "bg-purple-100 dark:bg-purple-900/30",
              },
              {
                icon: Shield,
                title: "Privacy Concerns",
                desc: "We take your privacy seriously. If you have questions about how we handle data, cookies, or third-party services, we're happy to clarify.",
                color: "text-orange-500",
                bg: "bg-orange-100 dark:bg-orange-900/30",
              },
              {
                icon: Clock,
                title: "Response Time",
                desc: "We typically respond within 24 business hours. For urgent copyright matters, we prioritize faster resolution to ensure compliance.",
                color: "text-cyan-500",
                bg: "bg-cyan-100 dark:bg-cyan-900/30",
              },
            ].map((item, idx) => (
              <Card
                key={idx}
                className="border-0 shadow-sm bg-white dark:bg-gray-900"
              >
                <CardContent className="p-6">
                  <div
                    className={`inline-flex items-center justify-center w-12 h-12 rounded-full ${item.bg} mb-4`}
                  >
                    <item.icon className={`h-6 w-6 ${item.color}`} />
                  </div>
                  <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {item.desc}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold tracking-tight mb-4 text-center">
            Frequently Asked Questions
          </h2>
          <p className="text-muted-foreground text-center mb-12">
            Before reaching out, you might find your answer here.
          </p>

          <Accordion type="single" collapsible className="w-full">
            <AccordionItem value="faq-1">
              <AccordionTrigger className="text-left">
                How long does it take to get a response?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We aim to respond to all emails within 24 business hours.
                During weekends and holidays, response times may be slightly
                longer. For urgent copyright-related matters, we prioritize
                faster resolution.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-2">
              <AccordionTrigger className="text-left">
                How do I report a copyright violation?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Send an email to support@ssdown.app with the subject line
                "DMCA / Copyright Notice". Include the URL of the content in
                question, proof of ownership, and your contact information.
                We will review and act on your request promptly in accordance
                with applicable laws.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-3">
              <AccordionTrigger className="text-left">
                Is SSDown free to use?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes, SSDown is completely free. We sustain our service through
                non-intrusive advertising. There are no hidden fees,
                subscriptions, or premium tiers. All features are available
                to every user at no cost.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-4">
              <AccordionTrigger className="text-left">
                Does SSDown store my personal data?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                No. SSDown does not require any login or registration. We do
                not collect, store, or share any personal information. We use
                minimal cookies for site functionality and analytics only.
                Please refer to our Privacy Policy for full details.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="faq-5">
              <AccordionTrigger className="text-left">
                Can I request a new feature or platform support?
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Absolutely! We actively welcome feature requests and
                suggestions from our users. Send us an email describing the
                feature you'd like to see, and we'll consider it for future
                updates. Community feedback is one of the primary drivers of
                our development roadmap.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      {/* About SSDown Brief */}
      <section className="py-16 bg-gray-50 dark:bg-gray-900/20 border-t">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold tracking-tight mb-6 text-center">
            About SSDown
          </h2>
          <div className="prose prose-slate dark:prose-invert max-w-none text-muted-foreground text-center space-y-4">
            <p>
              SSDown is a free online platform that provides video content
              management tools for personal use. We support downloading videos
              from major social media platforms including X (Twitter), TikTok,
              Instagram, Facebook, Dailymotion, and 9GAG, as well as YouTube
              utility tools for thumbnails and metadata previewing.
            </p>
            <p>
              Our mission is to help users manage their digital content
              responsibly while respecting copyright laws and platform terms of
              service. We do not host, store, or distribute any media files on
              our servers.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
