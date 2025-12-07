import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { i18n } from "@/lib/i18n-config";

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }));
}

export default function TermsPage() {
  return (
    <div className="container py-12 md:py-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Terms of Service</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Acceptance of Terms</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              By accessing and using SSDown, you accept and agree to be bound by
              the terms and provision of this agreement.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Use License</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p className="mb-4">
              Permission is granted to use our service for personal, non-commercial transitory viewing only.
              You must not:
            </p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Use the materials for any commercial purpose</li>
              <li>Attempt to reverse engineer any software contained on SSDown</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Use the service to download copyrighted content without permission</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Disclaimer</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              The materials on SSDown are provided "as is". SSDown makes no
              warranties, expressed or implied, and hereby disclaims and negates
              all other warranties, including without limitation, implied
              warranties or conditions of merchantability, fitness for a
              particular purpose, or non-infringement of intellectual property
              or other violation of rights.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Limitations</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              In no event shall SSDown or its suppliers be liable for any
              damages (including, without limitation, damages for loss of data
              or profit, or due to business interruption) arising out of the use
              or inability to use the materials on SSDown.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
