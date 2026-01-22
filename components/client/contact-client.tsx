"use client";

import { useState } from "react";
import { Mail, Send, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
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
          {/* Simple Email Contact (Center) */}
          <div className="md:col-span-3">
            <Card className="border shadow-lg max-w-2xl mx-auto text-center">
              <CardHeader>
                <CardTitle className="text-2xl">
                  {dict?.contact?.form_title || "Get in Touch"}
                </CardTitle>
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
    </div>
  );
}
