import { useState } from 'react'
import Image from 'next/image'
import { Swiper, SwiperSlide } from 'swiper/react'
import { Navigation, Autoplay } from 'swiper/modules'
import 'swiper/css'
import 'swiper/css/navigation'

interface Photo {
  id: string
  url: string
  name: string
}

interface PhotoCarouselProps {
  photos: Photo[]
  autoplay?: boolean
  showNavigation?: boolean
  slidesPerView?: number
  className?: string
}

export default function PhotoCarousel({
  photos,
  autoplay = false,
  showNavigation = false,
  slidesPerView = 3,
  className = '',
}: PhotoCarouselProps) {
  const [imagesLoaded, setImagesLoaded] = useState<{[key: string]: boolean}>({})

  const handleImageLoad = (id: string) => {
    setImagesLoaded(prev => ({ ...prev, [id]: true }))
  }

  return (
    <Swiper
      modules={[Navigation, Autoplay]}
      spaceBetween={20}
      slidesPerView={slidesPerView}
      navigation={showNavigation}
      autoplay={autoplay ? { delay: 3000, disableOnInteraction: false } : false}
      className={className}
      breakpoints={{
        320: {
          slidesPerView: 1,
          spaceBetween: 10
        },
        640: {
          slidesPerView: 2,
          spaceBetween: 15
        },
        1024: {
          slidesPerView: slidesPerView,
          spaceBetween: 20
        }
      }}
    >
      {photos.map((photo) => (
        <SwiperSlide key={photo.id}>
          <div className="aspect-square relative bg-emerald-50 rounded-lg overflow-hidden">
            <Image
              src={photo.url}
              alt={photo.name}
              fill
              className={`object-cover transition-opacity duration-300 ${
                imagesLoaded[photo.id] ? 'opacity-100' : 'opacity-0'
              }`}
              onLoad={() => handleImageLoad(photo.id)}
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={true}
            />
            {!imagesLoaded[photo.id] && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  )
}
