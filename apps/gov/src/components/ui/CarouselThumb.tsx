interface Props {
  selected: boolean
  imgSrc: string
  onClick: () => void
}

export default function CarouselThumb(props: Props) {
  const { selected, imgSrc, onClick } = props

  return (
    <div className="aspect-video min-w-0 flex-[0_0_16%] overflow-hidden pl-2">
      <button
        onClick={onClick}
        className={`${selected ? 'opacity-100' : 'opacity-40'
          } transition-opacity duration-150`}
        type="button"
      >
        <img
          className="block aspect-video h-[100px] w-full object-cover"
          src={imgSrc}
          alt="Your alt text"
        />
      </button>
    </div>
  )
}
