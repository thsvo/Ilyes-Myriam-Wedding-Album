"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, Settings } from "lucide-react"
import PhotoCarousel from "@/components/photo-carousel"
import { useToast } from "@/components/ui/use-toast"

export default function Home() {
  const [isAdmin, setIsAdmin] = useState(false)
  const [section1Photos, setSection1Photos] = useState([])
  const [section2Photos, setSection2Photos] = useState([])
  const { toast } = useToast()

  // Check if admin mode is enabled
  useEffect(() => {
    const adminMode = localStorage.getItem("weddingAdminMode")
    if (adminMode === "true") {
      setIsAdmin(true)
    }
    
    // Fetch photos from the server
    fetchPhotos()
  }, [])

  // Fetch photos from the server
  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos')
      if (response.ok) {
        const data = await response.json()
        
        // Filter photos by section
        setSection1Photos(data.photos.filter(photo => photo.section === 'section1'))
        setSection2Photos(data.photos.filter(photo => photo.section === 'section2'))
      } else {
        console.error('Error fetching photos:', await response.text())
        toast({
          title: "Error",
          description: "Failed to load photos",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Error fetching photos:', error)
      toast({
        title: "Error",
        description: "Failed to load photos",
        variant: "destructive",
      })
    }
  }

  // Toggle admin mode
  const toggleAdminMode = () => {
    const newAdminMode = !isAdmin
    setIsAdmin(newAdminMode)
    localStorage.setItem("weddingAdminMode", newAdminMode.toString())
  }

  // Function to chunk photos into groups of 3 for the carousel
  const chunkPhotos = (photos, size = 3) => {
    const chunks = []
    for (let i = 0; i < photos.length; i += size) {
      chunks.push(photos.slice(i, i + size))
    }
    return chunks
  }

  // Create photo chunks for each section
  const section1Chunks = chunkPhotos(section1Photos)
  const section2Chunks = chunkPhotos(section2Photos, 2) // 2 photos per row for section 2

  return (
    <div className="min-h-screen bg-white">
      {/* Admin toggle button */}
      <button
        onClick={toggleAdminMode}
        className="fixed bottom-4 right-4 z-50 bg-emerald-800 text-white p-2 rounded-full shadow-lg"
        aria-label="Toggle admin mode"
      >
        <Settings size={20} />
      </button>

      {/* Admin panel */}
      {isAdmin && (
        <div className="fixed top-0 left-0 right-0 bg-emerald-800 text-white p-2 z-40 flex justify-center">
          <Link href="/photoadd" className="text-white hover:text-emerald-200 transition-colors">
            Manage Photos
          </Link>
        </div>
      )}

      {/* Header with floral design */}
      <header className="relative w-full">
        <div className="w-full h-[200px] relative">
          <Image src="/images/header-flowers.png" alt="Floral header" fill className="object-cover" priority />
          <div className="absolute inset-0 flex items-center justify-center">
            <h1 className="text-5xl md:text-7xl font-script text-emerald-800">
              Ilyes <span className="text-4xl md:text-5xl">&</span> Myriam
            </h1>
          </div>
        </div>

        {/* Navigation */}
        <nav className="bg-white border-b border-emerald-100">
          <div className="container mx-auto px-4">
            <ul className="flex flex-wrap justify-center py-4 text-emerald-700 font-serif">
              <li>
                <Link href="#" className="hover:text-emerald-500 transition-colors">
                  Photos
                </Link>
              </li>
            </ul>
          </div>
        </nav>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-2 sm:px-4 py-8 sm:py-12">
        {/* Wedding photos section - now with carousel */}
        <section className="mb-8 sm:mb-16">
          {section1Photos.length > 0 ? (
            <>
              {/* Desktop view */}
              <div className="hidden md:block">
                <PhotoCarousel 
                  photos={section1Photos}
                  autoplay={true}
                  showNavigation={true}
                  slidesPerView={3}
                  className="photo-carousel"
                />
              </div>
              
              {/* Mobile view */}
              <div className="md:hidden">
                <PhotoCarousel 
                  photos={section1Photos}
                  autoplay={true}
                  showNavigation={true}
                  slidesPerView={1}
                  className="photo-carousel px-2"
                />
              </div>
            </>
          ) : (
            <div className="text-center text-emerald-700 italic">No photos available</div>
          )}
        </section>

        {/* Wedding date and location */}
        <section className="text-center mb-16">
          <div className="mb-4">
            <h2 className="text-4xl font-serif tracking-wider text-emerald-800 uppercase mb-4">wedding I|M</h2>
            <h3 className="text-3xl font-script text-emerald-700">13-09-2025</h3>
          </div>
        </section>

        {/* Welcome message */}
        <section className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-5xl font-script text-emerald-800 mb-6">Bienvenue</h2>
          <p className="text-lg text-emerald-700 mb-4 font-serif">
            Bienvenue à toute et à tous, dans ce grand jour nous aimerions tout d&apos;abord vous remercier d&apos;être
            présent, merci pour votre amour et votre soutien{" "}
            <Heart className="inline-block h-5 w-5 text-red-500 fill-red-500" />
          </p>
          <p className="text-lg text-emerald-700 font-serif">
            Vous trouverez ici toutes les photos de cette magnifique soirée
          </p>
        </section>

        {/* Additional photos - now with carousel */}
        <section className="mb-8 sm:mb-16">
          {section2Photos.length > 0 ? (
            <>
              {/* Desktop view */}
              <div className="hidden md:block">
                <PhotoCarousel 
                  photos={section2Photos}
                  autoplay={true}
                  showNavigation={true}
                  slidesPerView={3}
                  className="photo-carousel"
                />
              </div>
              
              {/* Mobile view */}
              <div className="md:hidden">
                <PhotoCarousel 
                  photos={section2Photos}
                  autoplay={true}
                  showNavigation={true}
                  slidesPerView={1}
                  className="photo-carousel px-2"
                />
              </div>
            </>
          ) : (
            <div className="text-center text-emerald-700 italic">No photos available</div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-emerald-50 py-8 text-center text-emerald-700 font-serif">
        <p className="text-sm">© {new Date().getFullYear()} Ilyes & Myriam</p>
      </footer>
    </div>
  )
}
