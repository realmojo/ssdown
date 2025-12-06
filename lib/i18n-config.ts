export const i18n = {
  defaultLocale: "en",
  locales: ["en", "jp", "kr", "pt", "fr"],
} as const

export type Locale = (typeof i18n.locales)[number]
