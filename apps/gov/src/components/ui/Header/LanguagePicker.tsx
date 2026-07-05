import { defaultLang, languages } from 'i18n'
import { useTranslatedPath } from 'i18n'

interface LanguagePickerProps {
  lang: keyof typeof languages
  translationId?: number
}

export default function LanguagePicker({
  lang,
  translationId
}: LanguagePickerProps) {
  const translatePath = useTranslatedPath(lang)

  return (
    <label className="relative w-fit text-center text-lg uppercase md:w-32">
      <select
        className="mx-1 flex-1 appearance-none rounded bg-white px-0.5 md:mx-4 md:px-1"
        value={lang}
        onChange={e => {
          const newLang = e.currentTarget.value
          const isDefault = newLang == defaultLang
          let path = isDefault
            ? window.location.pathname.slice(lang.length + 1) // length of lang + /
            : window.location.pathname
          if (translationId) {
            const segments = path.split('/')
            segments[segments.length - 1] = translationId.toString()
            path = segments.join('/')
          }
          window.location.pathname = translatePath(path, newLang)
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
