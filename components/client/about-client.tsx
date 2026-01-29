"use client";

export function AboutClient() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 lg:py-24 text-center bg-gray-50 dark:bg-gray-900/20">
        <div className="container px-4 md:px-6">
          <h1 className="text-3xl font-extrabold tracking-tight sm:text-5xl md:text-6xl mb-6 bg-clip-text text-transparent bg-gradient-to-r from-gray-900 via-indigo-800 to-gray-900 dark:from-white dark:via-indigo-200 dark:to-white">
            About the SSDown Team
          </h1>
          <p className="mx-auto max-w-[800px] text-gray-600 md:text-xl dark:text-gray-300">
            Preserving Your Digital Moments, Responsibly.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-16 bg-white dark:bg-gray-950">
        <div className="container px-4 md:px-6 max-w-4xl space-y-16">
          {/* Mission */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Our Mission: Archiving the Digital Age
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              SSDown was created with a simple yet powerful goal: to empower
              users to archive and preserve the digital content that matters to
              them. In an era of "link rot" and fleeting feeds, we believe in
              the value of personal archiving. Whether it&apos;s a cooking
              tutorial, a creative inspiration, or a cherished memory shared by
              a friend, SSDown provides the technical tools to save these
              moments for offline viewing and educational reference.
            </p>
          </div>

          <div className="space-y-4">
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Technical Expertise: Research & Engineering
            </h2>
            <p className="text-muted-foreground leading-relaxed text-lg">
              We are not just a downloader site; we are a team of data engineers
              and archivists researching <strong>video stream protocols</strong>{" "}
              (HLS, DASH) and <strong>metadata preservation</strong>. Our
              backend infrastructure is designed to ensuring high-fidelity
              extraction of digital assets while respecting the technical
              boundaries of source platforms.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Advanced Protocol Handling</h3>
                <p className="text-sm text-muted-foreground">
                  Our core engine parses complex m3u8 playlists and decrypts
                  chunked streams to reassemble complete MP4 files without
                  quality loss.
                </p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="font-bold mb-2">Privacy Engineering</h3>
                <p className="text-sm text-muted-foreground">
                  We implement automated link sanitization to strip tracking
                  parameters (fbclid, igshid) to protect user privacy during the
                  archival process.
                </p>
              </div>
            </div>
          </div>

          {/* Copyright Stance */}
          <div className="space-y-4 border-l-4 border-indigo-500 pl-6">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Respect for Intellectual Property
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              We strictly prohibit and do not condone the use of our service for
              copyright infringement or piracy. SSDown is strictly a technical
              tool.
            </p>
            <ul className="list-disc list-inside space-y-2 text-muted-foreground mt-2">
              <li>
                <strong>No Files Hosted:</strong> We do not host, cache, or
                archive any video content on our servers. All downloads are
                processed directly from the source platform&apos;s CDN to your
                device.
              </li>
              <li>
                <strong>Ownership:</strong> All rights to the videos, music, and
                images downloaded using our service belong entirely to their
                respective copyright owners.
              </li>
            </ul>
          </div>

          {/* Intended Use */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Intended Use: Personal & Educational Only
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              This service is designed and provided solely for{" "}
              <strong>Personal, Private, and Non-Commercial use</strong> (often
              referred to as &quot;Fair Use&quot; or &quot;Time-Shifting&quot;
              in various jurisdictions).
            </p>
            <div className="bg-red-50 dark:bg-red-900/10 p-4 rounded-lg text-sm text-red-800 dark:text-red-200">
              <strong>Strictly Prohibited Actions:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Redistributing or selling downloaded content.</li>
                <li>
                  Re-uploading content to other platforms without the
                  creator&apos;s permission.
                </li>
                <li>Infringing upon the rights of creators or platforms.</li>
              </ul>
            </div>
          </div>

          {/* Responsibility */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              User Responsibility
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              By using SSDown, you acknowledge that you are solely responsible
              for ensuring your actions comply with the Terms of Service of the
              source platforms (such as X, TikTok, Instagram, Facebook) and the
              copyright laws of your jurisdiction. SSDown disclaims all
              liability for any misuse of this service.
            </p>
          </div>

          {/* Contact */}
          <div className="pt-8 border-t">
            <h2 className="text-xl font-bold tracking-tight text-foreground mb-4">
              Contact & Takedowns
            </h2>
            <p className="text-muted-foreground leading-relaxed">
              If you are a copyright owner and believe your content is being
              improperly accessed through our tool, please contact us. While we
              do not host files, we are committed to cooperating with content
              creators to prevent access where technically feasible.
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
