"use client";

interface SiteFooterProps {
  dict: any;
}

export function SiteFooter({ dict }: SiteFooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t bg-gray-50/50 dark:bg-gray-950/50 backdrop-blur-xl">
      <div className="container px-4 md:px-6 py-12 md:py-16">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <a target="_self" href="/" className="inline-block">
              <span className="font-bold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-cyan-500 dark:from-indigo-400 dark:to-cyan-300">
                SSDown
              </span>
            </a>
            <p className="text-sm text-muted-foreground leading-relaxed max-w-xs">
              Free online tools for image editing, PDF management, video conversion, and more. Fast, free, and secure.
            </p>
          </div>

          {/* Tools Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              Tools
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  target="_self"
                  href="/tools/image"
                  className="hover:text-primary transition-colors"
                >
                  Image Tools
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/tools/video-audio"
                  className="hover:text-primary transition-colors"
                >
                  Video &amp; Audio
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/tools/social-text"
                  className="hover:text-primary transition-colors"
                >
                  Social &amp; Text
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/tools/utility"
                  className="hover:text-primary transition-colors"
                >
                  Utility
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/tools"
                  className="hover:text-primary transition-colors"
                >
                  All Tools
                </a>
              </li>
            </ul>
          </div>

          {/* Company Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              Company
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  target="_self"
                  href="/about"
                  className="hover:text-primary transition-colors"
                >
                  {dict?.about?.nav || dict?.nav?.about || "About Us"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/contact"
                  className="hover:text-primary transition-colors"
                >
                  {dict?.contact?.nav || dict?.nav?.contact || "Contact"}
                </a>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="space-y-4">
            <h3 className="font-semibold text-foreground tracking-tight">
              Legal
            </h3>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li>
                <a
                  target="_self"
                  href="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  {dict?.privacy || "Privacy Policy"}
                </a>
              </li>
              <li>
                <a
                  target="_self"
                  href="/terms"
                  className="hover:text-primary transition-colors"
                >
                  {dict?.terms || "Terms of Service"}
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <p>© {currentYear} SSDown. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
