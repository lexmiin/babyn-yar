import { useState, useEffect } from 'react'
import { Bars3Icon } from '@heroicons/react/24/solid'

export default function MobileNavToggle() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const body = document.getElementsByTagName('body')[0]
    const nav = document.querySelector('#mobile-nav')
    if (open) {
      nav?.classList.add('block')
      body?.classList.add('overflow-hidden')
      nav?.classList.remove('hidden')
    } else {
      nav?.classList.remove('block')
      nav?.classList.add('hidden')
      body?.classList.remove('overflow-hidden')
    }
  }, [open])

  return (
    <button
      className="inline-flex items-center justify-center md:hidden"
      aria-label="Toggle Mobile Nav"
      onClick={() => setOpen(!open)}
    >
      <Bars3Icon className="h-6 w-6" />
    </button>
  )
}
