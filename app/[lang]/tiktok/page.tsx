import { i18n, type Locale } from "@/lib/i18n-config"
import { getDictionary } from "@/lib/get-dictionary"
import { TikTokClient } from "@/components/client/tiktok-client"

export async function generateStaticParams() {
  return i18n.locales.map((locale) => ({ lang: locale }))
}

export default async function TikTokPage(props: { params: Promise<{ lang: Locale }> }) {
  const params = await props.params;
  const dict = await getDictionary(params.lang)
  
  return <TikTokClient dict={dict} />
}
