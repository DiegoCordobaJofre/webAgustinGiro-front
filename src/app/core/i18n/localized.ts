/**
 * Diccionario por idioma. Llaves esperadas: "es", "en", "pt".
 */
export type Localized = { [lang: string]: string };

export type SupportedLang = 'es' | 'en' | 'pt';

export const SUPPORTED_LANGS: readonly SupportedLang[] = ['en', 'es', 'pt'] as const;

/**
 * Idioma canonico/fallback. Si una traduccion no existe en el idioma activo,
 * caemos primero a este. Convencion del proyecto: ingles.
 */
export const FALLBACK_LANG: SupportedLang = 'en';

/**
 * Devuelve el texto en el idioma pedido. Cadena de fallback:
 *   1. idioma pedido
 *   2. FALLBACK_LANG ("en")
 *   3. cualquier idioma con valor en el orden de SUPPORTED_LANGS
 *   4. ""
 */
export function pickLocale(
  value: Localized | string | null | undefined,
  lang: string
): string {
  if (value == null) return '';
  if (typeof value === 'string') return value;
  const normalized = (lang || FALLBACK_LANG).toLowerCase();
  if (value[normalized] && value[normalized].trim()) {
    return value[normalized];
  }
  if (value[FALLBACK_LANG] && value[FALLBACK_LANG].trim()) {
    return value[FALLBACK_LANG];
  }
  for (const candidate of SUPPORTED_LANGS) {
    if (value[candidate] && value[candidate].trim()) {
      return value[candidate];
    }
  }
  return '';
}

/**
 * True si el localized no tiene ningun idioma con valor no vacio.
 */
export function isLocalizedEmpty(value: Localized | null | undefined): boolean {
  if (!value) return true;
  return Object.values(value).every((v) => !v || !v.trim());
}
