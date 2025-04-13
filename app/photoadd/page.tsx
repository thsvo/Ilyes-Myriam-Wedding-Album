"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import { Trash2, Upload, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"

// Types for our photos
interface Photo {
  id: string
  url: string
  name: string
  section: string
}

export default function PhotoAdd() {
  // Add client-side only state initialization
  const [mounted, setMounted] = useState(false)
  const [section1Photos, setSection1Photos] = useState<Photo[]>([])
  const [section2Photos, setSection2Photos] = useState<Photo[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const { toast } = useToast()

  // Separate useEffect for mounting
  useEffect(() => {
    setMounted(true)
  }, [])

  // Move data fetching to a separate useEffect
  useEffect(() => {
    if (mounted) {
      fetchPhotos()
    }
  }, [mounted])

  const fetchPhotos = async () => {
    try {
      const response = await fetch('/api/photos')
      if (response.ok) {
        const data = await response.json()
        
        // Filter photos by section
        setSection1Photos(data.photos.filter((photo: Photo) => photo.section === 'section1'))
        setSection2Photos(data.photos.filter((photo: Photo) => photo.section === 'section2'))
      } else {
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

  // Consolidated upload handler for both sections
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, section: 'section1' | 'section2') => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true)
      
      try {
        const uploadedPhotos = [];
        const imgbbApiKey = '1bc43ebd0cb93474188f1d032f718b87';
        
        // Process each file one by one
        for (let i = 0; i < e.target.files.length; i++) {
          const file = e.target.files[i];
          const formData = new FormData();
          formData.append('image', file);
          formData.append('key', imgbbApiKey);
          
          // Upload to ImgBB
          const imgbbResponse = await fetch('https://api.imgbb.com/1/upload', {
            method: 'POST',
            body: formData,
          });
          
          if (!imgbbResponse.ok) {
            throw new Error(`ImgBB upload failed for ${file.name}: ${imgbbResponse.statusText}`);
          }
          
          const imgbbData = await imgbbResponse.json();
          
          if (!imgbbData.success) {
            throw new Error(`ImgBB upload error for ${file.name}: ${imgbbData.error?.message || 'Unknown error'}`);
          }
          
          // Create photo data with ImgBB URL
          const photoData = {
            id: imgbbData.data.id,
            url: imgbbData.data.url,
            name: file.name,
            section: section,
            // Store additional ImgBB data if needed
            display_url: imgbbData.data.display_url,
            delete_url: imgbbData.data.delete_url,
            thumbnail: imgbbData.data.thumb?.url
          };
          
          uploadedPhotos.push(photoData);
          
          // Save to your database
          await fetch('/api/photos', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(photoData),
          });
        }
        
        toast({
          title: "Success",
          description: `${e.target.files.length} photos uploaded successfully`,
        });
        await fetchPhotos(); // Refresh the photos list
      } catch (error: any) {
        console.error('Error uploading files:', error);
        toast({
          title: "Error",
          description: error.message || "Failed to upload photos",
          variant: "destructive",
        });
      } finally {
        setIsUploading(false);
        e.target.value = '';
      }
    }
  };

  // Consolidated remove handler for both sections
  const removePhoto = async (id: string, section: 'section1' | 'section2') => {
    try {
      const response = await fetch(`/api/photos/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ section }) // Include section in the request body
      })

      if (response.ok) {
        // Update the local state
        if (section === 'section1') {
          setSection1Photos(prev => prev.filter(photo => photo.id !== id))
        } else {
          setSection2Photos(prev => prev.filter(photo => photo.id !== id))
        }
        
        toast({
          title: "Success",
          description: "Photo deleted successfully",
        })
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Delete failed')
      }
    } catch (error: any) {
      console.error('Error deleting photo:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to delete photo",
        variant: "destructive",
      })
    }
  }

  // Modify the return statement to handle hydration
  if (!mounted) {
    return null // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="bg-emerald-800 text-white p-4">
        <div className="container mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-script">Ilyes & Myriam - Photo Management</h1>
          <Link href="/" className="flex items-center text-white hover:text-emerald-200">
            <ArrowLeft className="mr-2" size={16} />
            Return to Homepage
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="section1" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="section1">First Section Photos</TabsTrigger>
            <TabsTrigger value="section2">Second Section Photos</TabsTrigger>
          </TabsList>

          <TabsContent value="section1" className="space-y-6">
            <div className="bg-emerald-50 p-6 rounded-lg">
              <h2 className="text-2xl font-serif text-emerald-800 mb-4">Upload Photos for First Section</h2>
              <p className="text-emerald-700 mb-4">These photos will appear in the top gallery on the homepage.</p>

              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="section1-photos">Upload Photos</Label>
                  <Input
                    id="section1-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoUpload(e, 'section1')}
                    className="cursor-pointer"
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-serif text-emerald-800">Current Photos ({section1Photos.length})</h3>

              {section1Photos.length === 0 ? (
                <p className="text-emerald-600 italic">No photos uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {section1Photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-emerald-50 rounded-lg overflow-hidden">
                        <Image
                          src={photo.url}
                          alt={photo.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removePhoto(photo.id, 'section1')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete photo"
                      >
                        <Trash2 size={16} />
                      </button>
                      <p className="text-sm text-emerald-700 truncate mt-1">{photo.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="section2" className="space-y-6">
            <div className="bg-emerald-50 p-6 rounded-lg">
              <h2 className="text-2xl font-serif text-emerald-800 mb-4">Upload Photos for Second Section</h2>
              <p className="text-emerald-700 mb-4">These photos will appear in the bottom gallery on the homepage.</p>

              <div className="space-y-4">
                <div className="grid w-full max-w-sm items-center gap-1.5">
                  <Label htmlFor="section2-photos">Upload Photos</Label>
                  <Input
                    id="section2-photos"
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => handlePhotoUpload(e, 'section2')}
                    className="cursor-pointer"
                    disabled={isUploading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-xl font-serif text-emerald-800">Current Photos ({section2Photos.length})</h3>

              {section2Photos.length === 0 ? (
                <p className="text-emerald-600 italic">No photos uploaded yet.</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {section2Photos.map((photo) => (
                    <div key={photo.id} className="relative group">
                      <div className="aspect-square bg-emerald-50 rounded-lg overflow-hidden">
                        <Image
                          src={photo.url}
                          alt={photo.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <button
                        onClick={() => removePhoto(photo.id, 'section2')}
                        className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        aria-label="Delete photo"
                      >
                        <Trash2 size={16} />
                      </button>
                      <p className="text-sm text-emerald-700 truncate mt-1">{photo.name}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
