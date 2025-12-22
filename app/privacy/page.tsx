export const runtime = "edge";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = "https://ssdown.app";
  const canonical = `${baseUrl}/privacy`;

  return {
    title: "Privacy Policy - SSDown",
    description:
      "Learn about SSDown's privacy policy and how we handle your data when you use our video downloader service.",
    openGraph: {
      title: "Privacy Policy - SSDown",
      description:
        "Learn about SSDown's privacy policy and how we handle your data when you use our video downloader service.",
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

      <div className="space-y-6">
        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              1. Information We Collect
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground space-y-4">
            <p>
              <strong>Personal Information:</strong> We do not collect any
              personally identifiable information (PII) such as your name, email
              address, or phone number.
            </p>
            <p>
              <strong>Usage Data:</strong> We may collect non-personal
              information about how you access and use the Service. This usage
              data may include information such as your computer's Internet
              Protocol address (e.g. IP address), browser type, browser version,
              the pages of our Service that you visit, the time and date of your
              visit, the time spent on those pages, unique device identifiers
              and other diagnostic data.
            </p>
            <p>
              <strong>Submitted Content:</strong> We process the URLs you submit
              to provide the video download service. These URLs and the
              associated video content are processed temporarily for the purpose
              of generating download links and are not permanently stored on our
              servers.
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              2. Cookies and Analytics
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground space-y-4">
            <p>
              We use cookies and similar tracking technologies to track the
              activity on our Service and hold certain information.
            </p>
            <p>
              <strong>Google Analytics & Naver Analytics:</strong> We use these
              third-party web analytics services to measure and analyze the
              usage of our website. These tools collect information such as how
              often users visit this site, what pages they visit when they do
              so, and what other sites they used prior to coming to this site.
              We use the information we get from these tools only to improve
              this site.
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              3. Use of Data
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground">
            <p>SSDown uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside mt-2 ml-2 space-y-1">
              <li>To provide and maintain the Service</li>
              <li>To provide customer care and support</li>
              <li>
                To provide analysis or valuable information so that we can
                improve the Service
              </li>
              <li>To monitor the usage of the Service</li>
              <li>To detect, prevent and address technical issues</li>
            </ul>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              4. Third-Party Links and Services
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground">
            <p>
              Our Service may contain links to other sites that are not operated
              by us (e.g., X/Twitter, TikTok, Instagram). If you click on a
              third party link, you will be directed to that third party's site.
              We strongly advise you to review the Privacy Policy of every site
              you visit. We have no control over and assume no responsibility
              for the content, privacy policies or practices of any third party
              sites or services.
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              5. Data Security
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground">
            <p>
              The security of your data is important to us, but remember that no
              method of transmission over the Internet, or method of electronic
              storage is 100% secure. While we strive to use commercially
              acceptable means to protect your data, we cannot guarantee its
              absolute security.
            </p>
          </div>
        </div>

        <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
          <div className="flex flex-col space-y-1.5 p-6">
            <h2 className="text-2xl font-semibold leading-none tracking-tight">
              6. Changes to This Privacy Policy
            </h2>
          </div>
          <div className="p-6 pt-0 text-muted-foreground">
            <p>
              We may update our Privacy Policy from time to time. We will notify
              you of any changes by posting the new Privacy Policy on this page.
              You are advised to review this Privacy Policy periodically for any
              changes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
