"use client";

import { useState } from "react";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface ContactClientProps {
  dict: any;
}

export function ContactClient({ dict }: ContactClientProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      setIsSuccess(true);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err: any) {
      console.error("Error submitting form:", err);
      setError(err?.message || "Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 text-center bg-gray-50 dark:bg-gray-900/20">
        <div className="container px-4 md:px-6">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white">
            {dict?.contact?.title || "Contact Us"}
          </h1>
          <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl dark:text-gray-300">
            {dict?.contact?.subtitle || "We'd love to hear from you"}
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            
            {/* Contact Info (Left Side) */}
            <div className="md:col-span-1 space-y-6">
              <Card className="border-0 shadow-lg bg-indigo-600 text-white h-full">
                <CardContent className="p-8 flex flex-col items-start gap-6 h-full">
                  <div className="p-3 rounded-full bg-white/10">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-bold text-lg">{dict?.contact?.email_us || "Email Us Directly"}</h3>
                    <p className="text-indigo-100 text-sm leading-relaxed">
                      {dict?.contact?.email_desc || "Prefer email? Send it to support@ssdown.app"}
                    </p>
                  </div>
                   <div className="mt-auto pt-8">
                      <a href="mailto:support@ssdown.app" className="text-sm font-semibold hover:underline underline-offset-4">
                        support@ssdown.app
                      </a>
                   </div>
                </CardContent>
              </Card>
            </div>

            {/* Contact Form (Right Side) */}
            <div className="md:col-span-2">
              <Card className="border shadow-lg">
                <CardHeader>
                  <CardTitle>{dict?.contact?.form_title || "Send us a message"}</CardTitle>
                  <CardDescription>
                     We usually respond within 24 hours.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSuccess ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-4 animate-in fade-in zoom-in duration-300">
                      <div className="p-4 rounded-full bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400">
                        <CheckCircle2 className="h-8 w-8" />
                      </div>
                      <h3 className="text-xl font-bold">{dict?.contact?.success_title || "Message Sent!"}</h3>
                      <p className="text-muted-foreground">{dict?.contact?.success_desc || "We'll get back to you as soon as possible."}</p>
                      <Button variant="outline" onClick={() => setIsSuccess(false)} className="mt-4">
                        Send another message
                      </Button>
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {error && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertTitle>Error</AlertTitle>
                          <AlertDescription>{error}</AlertDescription>
                        </Alert>
                      )}
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">{dict?.contact?.name || "Name"}</Label>
                          <Input
                            id="name"
                            required
                            placeholder="John Doe"
                            value={formData.name}
                            onChange={handleChange}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">{dict?.contact?.email || "Email"}</Label>
                          <Input
                            id="email"
                            type="email"
                            required
                            placeholder="john@example.com"
                            value={formData.email}
                            onChange={handleChange}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="subject">{dict?.contact?.subject || "Subject"}</Label>
                        <Input
                          id="subject"
                          required
                          placeholder="How can we help?"
                          value={formData.subject}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">{dict?.contact?.message || "Message"}</Label>
                        <Textarea
                          id="message"
                          required
                          placeholder="Type your message here..."
                          className="min-h-[150px]"
                          value={formData.message}
                          onChange={handleChange}
                        />
                      </div>
                      <Button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700" disabled={isSubmitting}>
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            {dict?.contact?.sending || "Sending..."}
                          </>
                        ) : (
                          <>
                            <Send className="mr-2 h-4 w-4" />
                            {dict?.contact?.send || "Send Message"}
                          </>
                        )}
                      </Button>
                    </form>
                  )}
                </CardContent>
              </Card>
            </div>

          </div>
        </div>
      </section>
    </div>
  );
}
