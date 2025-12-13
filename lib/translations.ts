// lib/translations.ts
import translationsJson from "./translations.json";

type Language = "en" | "mr";

export function getTranslations(language: Language) {
  return function t(key: string) {
    // Split the key by dots (e.g., "dashboard.welcome" → ["dashboard", "welcome"])
    const parts = key.split(".");
    let ref: any = translationsJson;

    // Navigate through the nested object
    for (const part of parts) {
      if (ref[part] === undefined) {
        return key; // Return the key itself if path not found
      }
      ref = ref[part];
    }

    // Return the translation for the selected language
    return ref[language] ?? key;
  };
}

// Optional: Export a standalone function if needed elsewhere
export function t(key: string, lang: Language) {
  const parts = key.split(".");
  let ref: any = translationsJson;

  for (const part of parts) {
    if (ref[part] === undefined) return key;
    ref = ref[part];
  }

  return ref[lang] ?? key;
}
