import useEmblaCarousel from 'embla-carousel-react'
import { forwardRef, useCallback, useEffect } from 'react'
import { ChevronRight, ChevronLeft, XIcon } from 'lucide-react'

interface Props {
  slides: string[]
  onIndexSelect: (snap: number) => void
  onClose: () => void
  selectedIndex: number
}

const Carousel = forwardRef<HTMLDivElement, Props>(function Carousel(
  props,
  ref
) {
  const { selectedIndex, slides, onClose, onIndexSelect } = props
  const [emblaRef, emblaApi] = useEmblaCarousel()

  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  )
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  )

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    onIndexSelect(emblaApi.selectedScrollSnap())
  }, [emblaApi, onIndexSelect])

  useEffect(() => {
    if (!emblaApi) return
    emblaApi.on('select', onSelect)
    emblaApi.scrollTo(selectedIndex)
  }, [emblaApi, onIndexSelect, onSelect, selectedIndex])

  return (
    <div className="relative h-full">
      <div className="relative m-auto flex h-full max-w-[83%] items-center justify-center py-4 md:py-6 lg:py-10">
        <div
          ref={emblaRef}
          className="m-auto flex h-full items-center overflow-hidden"
        >
          <div className="flex touch-pan-y">
            {slides.map((image, i) => (
              <div
                key={image}
                ref={i === selectedIndex ? ref : undefined}
                className="m-auto flex min-w-0 flex-[0_0_100%] flex-col items-center"
              >
                <img
                  className="h-auto w-auto max-w-full cursor-grab object-cover active:cursor-grabbing"
                  src={image}
                  alt=""
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      <button
        onClick={scrollPrev}
        className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black p-3 text-white hover:opacity-75"
      >
        <ChevronLeft size={16} />
      </button>
      <button
        onClick={scrollNext}
        className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black p-3 text-white hover:opacity-75"
      >
        <ChevronRight size={16} />
      </button>
      <button
        onClick={onClose}
        className="absolute right-2 top-12 -translate-y-1/2 rounded-full bg-black p-3 text-white hover:opacity-75"
      >
        <XIcon size={16} />
      </button>
    </div>
  )
})

export default Carousel
