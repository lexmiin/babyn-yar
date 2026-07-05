import { useRef, useState } from 'react'
import CarouselWithThumbs from './CarouselWithThumb'
import Carousel from './Carousel'

interface Props {
  slides: string[]
}
export default function MultiCarousel({ slides }: Props) {
  const slideRef = useRef<HTMLDivElement>(null)
  const [show, setShow] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(0)

  const handleOutsideClick = (e: any) => {
    if (!slideRef) return
    if (e.target.contains(slideRef.current)) {
      setShow(false)
    }
  }

  const handleIndexSelect = (snap: number) => {
    setSelectedIndex(snap)
  }

  const close = () => {
    setShow(false)
  }

  return (
    <div className="w-full max-w-4xl">
      <CarouselWithThumbs
        slides={slides}
        onClick={snap => {
          setShow(true)
          setSelectedIndex(snap)
        }}
      />
      {show && (
        <div
          className="fixed inset-0 z-40 bg-black"
          onClick={handleOutsideClick}
        >
          <Carousel
            ref={slideRef}
            slides={slides}
            onIndexSelect={handleIndexSelect}
            onClose={close}
            selectedIndex={selectedIndex}
          />
        </div>
      )}
    </div>
  )
}
