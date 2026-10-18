import { createContext, useContext } from 'react'
import { useTranslations, type Language } from '@babyn-yar/i18n'

export const HistoryMapLanguageContext = createContext<Language | null>(null)

export function useHistoryMapTranslations() {
  const lang = useContext(HistoryMapLanguageContext)
  if (!lang) throw new Error('History map requires HistoryMapLanguageContext')
  return useTranslations(lang)
}
