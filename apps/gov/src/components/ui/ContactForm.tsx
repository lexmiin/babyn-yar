import { useTranslations } from 'i18n'
import type { ComponentProps, ReactNode } from 'react'
import { EnvelopeIcon, MapPinIcon } from '@heroicons/react/24/outline'
import { languages } from 'i18n'

interface ContactFormProps {
  lang: keyof typeof languages
  email: string
}

export default function ContactForm({ lang, email }: ContactFormProps) {
  const t = useTranslations(lang)

  return (
    <div className="not-prose mx-auto w-full">
      <form className="grid grid-cols-1 gap-x-4 gap-y-4 md:grid-cols-2 md:gap-y-8">
        <InfoSection
          icon={<MapPinIcon className="h-6 w-6 text-emerald-900" />}
          className="order-1 md:order-none"
        >
          {t('contact.address')}
        </InfoSection>
        <div className="flex w-full gap-4">
          <FormInput
            name="surname"
            label={t('contact.form.surname')}
            autoComplete="off"
            required
          />
          <FormInput
            name="name"
            label={t('contact.form.name')}
            autoComplete="off"
            required
          />
        </div>
        <InfoSection
          icon={<MapPinIcon className="2-6 h-6 text-emerald-900" />}
          className="order-2 md:order-none"
        >
          {t('contact.office')}
        </InfoSection>
        <FormInput
          name="email"
          label={t('contact.form.email')}
          type="email"
          autoComplete="off"
          autoCorrect="off"
          required
        />
        <InfoSection
          icon={<EnvelopeIcon className="2-6 h-6 text-emerald-900" />}
          className="order-3 md:order-none"
        >
          <a href={`mailto:${email}`}>{email}</a>
        </InfoSection>
        <label className="block w-full text-base">
          {t('contact.form.message')}
          <textarea
            className="block min-h-[120px] w-full border border-black/70"
            autoComplete="off"
            required
          ></textarea>
        </label>
        <div></div>
        <div className="text-right">
          <button className="w-fit bg-black px-6 py-3 text-base text-white">
            {t('contact.form.button')}
          </button>
        </div>
      </form>
    </div>
  )
}

function FormInput({
  name,
  label,
  ...props
}: { name: string; label: string } & ComponentProps<'input'>) {
  return (
    <label className="block w-full text-base">
      {label}
      <input
        name={name}
        className="block w-full flex-1 border border-black/70 px-3 py-2"
        {...props}
      />
    </label>
  )
}

function InfoSection({
  className,
  icon,
  children
}: {
  className: string
  icon: ReactNode
  children: ReactNode
}) {
  return (
    <div className={`flex items-start ${className}`}>
      <span className="pt-0.5">{icon}</span>
      <p className="!m-0 px-4 text-base">{children}</p>
    </div>
  )
}
