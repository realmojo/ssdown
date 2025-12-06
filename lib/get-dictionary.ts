import "server-only"
import type { Locale } from "./i18n-config"

const dictionaries = {
  en: () => import("@/dictionaries/en.json").then((module) => module.default),
  jp: () => import("@/dictionaries/jp.json").then((module) => module.default),
  kr: () => import("@/dictionaries/kr.json").then((module) => module.default),
  pt: () => import("@/dictionaries/pt.json").then((module) => module.default),
  fr: () => import("@/dictionaries/fr.json").then((module) => module.default),
}

export const getDictionary = async (locale: Locale) => dictionaries[locale]()
