"use client";

export function AboutClient() {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 lg:py-32 text-center bg-slate-50 dark:bg-slate-900/40">
        <div className="container px-4 md:px-6">
          <div className="inline-block px-3 py-1 mb-6 text-sm font-semibold tracking-wider text-indigo-600 uppercase bg-indigo-100 rounded-full dark:bg-indigo-900/30 dark:text-indigo-400">
            Our Mission
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl mb-8 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-700 to-slate-900 dark:from-white dark:via-indigo-300 dark:to-white">
            Simple Tools, <br className="hidden md:block" /> Powerful Results.
          </h1>
          <p className="mx-auto max-w-[900px] text-slate-600 md:text-2xl dark:text-slate-400 leading-relaxed">
            SSDown is dedicated to making digital tasks easy, accessible, and free for everyone, everywhere. No installs, no fees, no compromises.
          </p>
        </div>
        
        {/* Decorative background elements */}
        <div className="absolute top-0 left-0 -z-10 h-full w-full overflow-hidden pointer-events-none opacity-20 dark:opacity-10">
          <div className="absolute -top-[10%] -left-[10%] h-[40%] w-[40%] rounded-full bg-gradient-to-br from-indigo-400 to-purple-400 blur-3xl opacity-50" />
          <div className="absolute top-[20%] right-[10%] h-[30%] w-[30%] rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 blur-3xl opacity-50" />
        </div>
      </section>

      {/* Main Content */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container px-4 md:px-6 max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20">
            
            {/* Sidebar/Quick Info */}
            <div className="lg:col-span-4 space-y-10">
              <div className="p-8 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
                <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">SSDown at a Glance</h3>
                <ul className="space-y-4 text-slate-600 dark:text-slate-400">
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                    <span><strong>100+</strong> Professional tools</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                    <span><strong>100%</strong> Browser-based processing</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                    <span><strong>Privacy</strong> First architecture</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="mt-1 h-2 w-2 rounded-full bg-indigo-500 shrink-0" />
                    <span><strong>Global</strong> Accessibility (EN/KR)</span>
                  </li>
                </ul>
              </div>

              <div className="p-8 rounded-2xl bg-indigo-600 text-white shadow-xl shadow-indigo-500/20">
                <h3 className="text-xl font-bold mb-4">Support Our Journey</h3>
                <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                  We built SSDown to be free forever. If you find our tools useful, spreading the word is the best way to support us.
                </p>
                <div className="flex flex-wrap gap-2">
                  <button className="px-4 py-2 bg-white text-indigo-600 rounded-lg text-sm font-bold hover:bg-indigo-50 transition-colors">
                    Share SSDown
                  </button>
                </div>
              </div>
            </div>

            {/* Main Narrative */}
            <div className="lg:col-span-8 space-y-16">
              
              {/* Our Story */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                  The SSDown Story
                </h2>
                <div className="space-y-4 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  <p>
                    SSDown began in 2023 with a simple observation: the internet is full of "free" tools that aren't actually free. Most required accounts, buried downloads behind pop-up ads, or worse, compromised user privacy by processing files on mysterious servers.
                  </p>
                  <p>
                    Our small team of developers and designers set out to build a platform where users could perform high-quality image editing, PDF management, and video conversion without the friction. We spent months optimizing algorithms to run efficiently inside the browser, ensuring that for 99% of our tools, your data never has to leave your device.
                  </p>
                  <p>
                    Today, SSDown serves thousands of users worldwide, providing a one-stop-shop for digital utility. Whether you're a student fixing a PDF at 2 AM or a professional photographer compressing a batch of images, we're here to help.
                  </p>
                </div>
              </div>

              {/* Our Commitment */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                  Why We're Different
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Client-Side First</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      We prioritize "Edge Computing" — doing the heavy lifting in your browser. This means faster speeds and unmatched privacy.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Performance Focused</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Built with Next.js and optimized for speed. Our tools are lightweight, responsive, and available instantly.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Community Driven</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Our product roadmap is shaped by user feedback. Need a specific tool? We're likely already working on it.
                    </p>
                  </div>
                  <div className="space-y-3">
                    <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04 inter m-7.714 2.138a16.483 16.483 0 00-1.204 5.422c0 5.762 3.397 10.742 8.322 13.114a8.313 8.313 0 008.322-13.114 16.484 16.484 0 00-1.204-5.422L12 5.894z" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Security Always</h3>
                    <p className="text-slate-600 dark:text-slate-400">
                      Your files are yours. We use standard encryption and best practices to ensure your browsing experience is safe.
                    </p>
                  </div>
                </div>
              </div>

              {/* Founders / Team (Generic but personal) */}
              <div className="space-y-6">
                <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4">
                  Meet the Team
                </h2>
                <div className="space-y-4 text-slate-600 dark:text-slate-400 text-lg leading-relaxed">
                  <p>
                    SSDown is maintained by a global team of developers, designers, and security enthusiasts. We are united by the belief that high-quality software utilities should be a public good, not a paid privilege.
                  </p>
                  <p>
                    Our core engineering team focuses on WebAssembly and browser APIs to push the boundaries of what's possible in a web application. Our content team works tirelessly to create in-depth guides that help you navigate the complex world of digital media and online safety.
                  </p>
                </div>
              </div>

              {/* Final CTA */}
              <div className="pt-12 border-t border-slate-100 dark:border-slate-800 text-center sm:text-left">
                <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-6">
                  Ready to optimize your workflow?
                </h2>
                <div className="flex flex-col sm:flex-row gap-4">
                  <a
                    href="/tools"
                    className="inline-flex h-12 items-center justify-center rounded-xl bg-indigo-600 px-8 text-base font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-700 hover:scale-105 active:scale-95"
                  >
                    Explore All Tools
                  </a>
                  <a
                    href="/contact"
                    className="inline-flex h-12 items-center justify-center rounded-xl border-2 border-slate-200 dark:border-slate-800 bg-transparent px-8 text-base font-bold text-slate-900 dark:text-white transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
                  >
                    Get in Touch
                  </a>
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
