import { createContext, useContext } from 'react'
import { useTranslations, type Language } from '@babyn-yar/i18n'

export const HistoryMapLanguageContext = createContext<Language>('uk')

export function useHistoryMapTranslations() {
  return useTranslations(useContext(HistoryMapLanguageContext))
}
