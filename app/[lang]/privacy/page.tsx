import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

import { i18n, type Locale } from "@/lib/i18n-config"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default function PrivacyPage({ params }: { params: { lang: Locale } }) {
  return (
    <div className="container py-12 md:py-24 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">Privacy Policy</h1>
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. Information We Collect</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              We do not collect any personal information. We only process the URLs you submit to provide the download service. 
              These URLs are processed temporarily and are not stored permanently on our servers.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. Cookies</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              We use essential cookies to ensure the website functions properly. We may use third-party analytics tools 
              to understand how our website is used website usage, but this data is anonymized.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. Third-Party Links</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              Our website may contain links to external sites (like X (Twitter) or TikTok). We are not responsible for the 
              privacy practices or content of these external sites.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. Terms of Service</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground">
            <p>
              By using our service, you agree not to download copyrighted material without permission. This tool is intended for personal use only.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
