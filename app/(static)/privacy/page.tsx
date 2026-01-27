
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/privacy`;

  return {
    title: "Privacy Policy - SSDown",
    description:
      "Learn about SSDown's privacy policy, Google AdSense data usage, and how we handle your data when you use our video downloader service.",
    openGraph: {
      title: "Privacy Policy - SSDown",
      description:
        "Learn about SSDown's privacy policy, Google AdSense data usage, and how we handle your data when you use our video downloader service.",
      url: canonical,
      siteName: "SSDown",
      locale: "en_US",
      type: "website",
    },
    alternates: {
      canonical: canonical,
    },
  };
}

export default async function PrivacyPage() {
  return (
    <div className="container py-12 md:py-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      <p className="text-sm text-muted-foreground mb-8">
        Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
      </p>

      <div className="space-y-6">
        
        {/* Section 1: Information We Collect */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              1. Information We Collect
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground space-y-4">
            <p>
              <strong>Personal Information:</strong> We do NOT collect any
              personally identifiable information (PII) such as your name, email
              address, or phone number. You can use our service completely anonymously.
            </p>
            <p>
              <strong>Usage Data (Log Files):</strong> Standard server logs are used
              for technical debugging and traffic analysis. This includes your IP
              address, browser type, referring pages, and timestamp. These logs are
              strictly for administrative use and are never linked to any personal
              profile.
            </p>
            <p>
              <strong>Submitted Content ("No Logs" Policy):</strong> We process the
              video URLs you submit solely to generate a download link. We do
              <strong> NOT</strong> keep a history of which videos you downloaded.
              Once the download link is generated and you leave the page, the
              connection between your IP and that specific video is not retained in
              any user-facing history database.
            </p>
          </div>
        </div>

        {/* Section 2: Cookies & Third Party Ads (AdSense) */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm bg-yellow-50/50 dark:bg-yellow-900/10 border-yellow-200 dark:border-yellow-800">
           <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight text-foreground">
              2. Google AdSense & Third-Party Cookies
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground space-y-4">
            <p>
              This site uses <strong>Google AdSense</strong> to serve ads. Google,
              as a third-party vendor, uses cookies to serve ads on our site.
            </p>
            <ul className="list-disc list-inside ml-2 space-y-2">
              <li>
                 <strong>DoubleClick DART Cookie:</strong> Google&apos;s use of the
                DART cookie enables it to serve ads to our users based on their
                visit to our site and other sites on the Internet.
              </li>
              <li>
                <strong>Opt-Out:</strong> Users may opt-out of the use of the DART
                cookie by visiting the Google Ad and Content Network privacy policy
                at{" "}
                <a
                  href="https://policies.google.com/technologies/ads"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  https://policies.google.com/technologies/ads
                </a>
              </li>
            </ul>
             <p className="text-sm mt-2">
              We have no access to or control over these cookies that are used by
              third-party advertisers. You should consult the respective privacy
              policies of these third-party ad servers for more detailed
              information on their practices.
            </p>
          </div>
        </div>

         {/* Section 3: General Cookies */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              3. Our Use of Cookies
            </h2>
          </div>
           <div className="p-6 pt-0 text-muted-foreground space-y-4">
            <p>
              We use standard cookies to improve user experience (e.g., remembering
              your theme preference - Dark/Light mode). These cookies are entirely
              safe and do not contain sensitive personal data.
            </p>
             <p>
              <strong>Analytics:</strong> We may use tools like Google Analytics
              to understand aggregate traffic patterns (e.g., "how many users
              visited from France?"). This data is anonymized and IP addresses are
              often masked before storage.
            </p>
          </div>
        </div>

         {/* Section 4: Data Security */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
           <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              4. Data Security
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground">
            <p>
              The security of your data is important to us, but remember that no
              method of transmission over the Internet is 100% secure. While we
              strive to use commercially acceptable means to protect your
              connections (SSL/HTTPS), we cannot guarantee absolute security.
            </p>
          </div>
        </div>

        {/* Section 5: Children's Privacy */}
         <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
           <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              5. Children's Privacy
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground">
            <p>
              Our Service does not address anyone under the age of 13. We do not
              knowingly collect personally identifiable information from anyone
              under the age of 13. If you are a parent or guardian and you are
              aware that your Children has provided us with Personal Data, please
              contact us.
            </p>
          </div>
        </div>

         {/* Section 6: Changes */}
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
           <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              6. Changes to This Policy
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground">
            <p>
              We may update our Privacy Policy from time to time. Changes are
              effective immediately after they are posted on this page. We
              encourage you to review this Privacy Policy periodically.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}
