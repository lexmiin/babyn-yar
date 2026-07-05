import { useState, useEffect, useCallback } from 'react'
import useEmblaCarousel from 'embla-carousel-react'
import CarouselThumb from './CarouselThumb'

interface Props {
  slides: string[]
  onClick: (snap: number) => void
}

export default function CarouselWithThumbs({ slides, onClick }: Props) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [emblaMainRef, emblaMainApi] = useEmblaCarousel()
  const [emblaThumbsRef, emblaThumbsApi] = useEmblaCarousel({
    containScroll: 'keepSnaps',
    dragFree: true
  })

  const onThumbClick = useCallback(
    (index: number) => {
      if (!emblaMainApi || !emblaThumbsApi) return
      emblaMainApi.scrollTo(index)
    },
    [emblaMainApi, emblaThumbsApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaMainApi || !emblaThumbsApi) return
    setSelectedIndex(emblaMainApi.selectedScrollSnap())
    emblaThumbsApi.scrollTo(emblaMainApi.selectedScrollSnap())
  }, [emblaMainApi, emblaThumbsApi])

  useEffect(() => {
    if (!emblaMainApi) return
    onSelect()
    emblaMainApi.on('select', onSelect)
    emblaMainApi.on('reInit', onSelect)
  }, [emblaMainApi, onSelect])

  return (
    <div className="w-full max-w-4xl">
      <div className="overflow-hidden" ref={emblaMainRef}>
        <div className="flex touch-pan-y">
          {slides.map(image => (
            <div key={image} className="relative flex-[0_0_100%]">
              <button onClick={() => onClick(selectedIndex)} className="w-full">
                <img
                  className="block h-[600px] w-full object-cover"
                  src={image}
                  alt="Image"
                />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-1">
        <div className="h-[100px] overflow-hidden" ref={emblaThumbsRef}>
          <div className="-ml-2 flex">
            {slides.map((image, index) => (
              <CarouselThumb
                onClick={() => onThumbClick(index)}
                selected={index === selectedIndex}
                imgSrc={image}
                key={index}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
