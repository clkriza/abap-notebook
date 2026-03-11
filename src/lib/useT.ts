import { useAppStore } from "@/store/useAppStore";
import { translations, type TranslationKey } from "./i18n";

/** Returns a bound translation function for the current language. */
export function useT() {
  const lang = useAppStore((s) => s.lang);
  return (key: TranslationKey): string =>
    translations[lang][key] ?? translations.en[key] ?? key;
}
