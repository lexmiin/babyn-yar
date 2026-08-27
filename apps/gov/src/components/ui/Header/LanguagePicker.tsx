import { languages, type Language } from '@babyn-yar/i18n'

interface LanguagePickerProps {
  lang: Language
  paths: Record<Language, string>
}

export default function LanguagePicker({ lang, paths }: LanguagePickerProps) {
  return (
    <label className="relative w-fit text-center text-lg uppercase md:w-32">
      <select
        className="mx-1 flex-1 appearance-none rounded bg-white px-0.5 md:mx-4 md:px-1"
        value={lang}
        onChange={e => {
          const newLang = e.currentTarget.value as Language
          window.location.assign(
            `${paths[newLang]}${window.location.search}${window.location.hash}`
          )
        }}
      >
        {Object.entries(languages).map(([code, name]) => (
          <option key={name} value={code} className="normal-case">
            {name}&nbsp;&nbsp;
          </option>
        ))}
      </select>
    </label>
  )
}
