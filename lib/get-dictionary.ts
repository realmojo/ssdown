import "server-only";
import kr from "@/dictionaries/kr.json";

type Dictionary = typeof kr;

/**
 * The site is Korean-only, so there is a single dictionary and no locale
 * negotiation. Kept async so existing `await getDictionary()` call sites and
 * any future lazy-loading stay source-compatible.
 */
export const getDictionary = async (): Promise<Dictionary> => kr;
