"use client";

export function AboutClient() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 text-center bg-gray-50 dark:bg-gray-900/20">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white">
            About SSDown
          </h1>
          <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl dark:text-gray-300">
            Free Online Tools for Everyone.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl space-y-16">
          {/* Mission */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Our Mission
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              SSDown is a free online tools platform built to simplify everyday
              digital tasks. We provide a growing collection of browser-based
              tools for image editing, PDF management, video and audio
              conversion, file format transformation, and more — all without
              requiring any software installation.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              What We Offer
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              Our platform provides a comprehensive suite of tools designed to
              help users handle common digital tasks quickly and efficiently.
              All tools run directly in your browser for maximum privacy and
              convenience.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Image Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Compress, convert, resize, crop, and edit images. Remove
                  backgrounds, generate favicons, extract color palettes, and
                  more.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">PDF Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Merge, split, rotate, crop, protect, and edit PDF files.
                  Convert between PDF and image formats with ease.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Video & Audio Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Convert video formats, extract audio, create GIFs, trim
                  videos, and extract frames — all processed locally in your
                  browser.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">File & Data Tools</h3>
                <p className="text-sm text-muted-foreground">
                  Convert between JSON, XML, CSV, and Excel formats. Split
                  large files and transform data structures effortlessly.
                </p>
              </div>
            </div>
          </div>

          {/* Privacy */}
          <div className="space-y-4 border-l-4 border-indigo-500 pl-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Privacy First
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We take your privacy seriously. Most of our tools process files
              entirely in your browser — your data never leaves your device.
              We do not store, share, or analyze your uploaded files.
            </p>
          </div>

          {/* Terms */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Terms of Use
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              SSDown tools are provided free of charge for personal and
              commercial use. Users are responsible for ensuring their use of
              our tools complies with applicable laws and regulations.
            </p>
          </div>

          {/* Contact */}
          <div className="pt-8 border-t">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
              Contact Us
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              Have questions, feedback, or suggestions? We would love to hear
              from you. Reach out to our support team anytime.
            </p>
            <a
              href="mailto:support@ssdown.app"
              className="mt-4 inline-flex h-10 items-center justify-center rounded-md bg-primary px-8 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
            >
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
