import { languages, type Language } from '@babyn-yar/i18n'
import { getRelativeLocaleUrl, pathHasLocale } from 'astro:i18n'

export function createLocalizedPath(locale: Language) {
  return (path: string) => getRelativeLocaleUrl(locale, path)
}

export function getLocalizedPaths(pathname: string): Record<Language, string> {
  const segments = pathname.split('/')
  const path = pathHasLocale(segments[1] ?? '')
    ? `/${segments.slice(2).join('/')}`
    : pathname

  return Object.fromEntries(
    (Object.keys(languages) as Language[]).map(locale => [
      locale,
      getRelativeLocaleUrl(locale, path)
    ])
  ) as Record<Language, string>
}
