'use client'

import { useState, useRef } from 'react'
import { Camera, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CameraCardProps {
  onImageSelect: (file: File) => void
  isAnalyzing: boolean
}

export function CameraCard({ onImageSelect, isAnalyzing }: CameraCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      onImageSelect(file)
    }
  }

  return (
    <div className="px-4 py-8">
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 border-2 border-emerald-200">
        <div className="flex flex-col items-center gap-6">
          <div className="bg-emerald-100 rounded-full p-6">
            <Camera className="w-12 h-12 text-emerald-700" />
          </div>

          <h2 className="text-xl font-semibold text-emerald-900 text-center">
            Analyze Your Corn Leaf
          </h2>

          <p className="text-center text-sm text-emerald-700 leading-relaxed">
            Take a photo of the corn leaf or upload from gallery to get instant disease diagnosis
          </p>

          <div className="flex flex-col w-full gap-3">
            <Button
              size="lg"
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-6 text-base rounded-lg"
              onClick={() => cameraInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              <Camera className="w-5 h-5 mr-2" />
              Take Photo
            </Button>

            <Button
              size="lg"
              variant="outline"
              className="w-full border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 font-semibold py-6 text-base rounded-lg"
              onClick={() => fileInputRef.current?.click()}
              disabled={isAnalyzing}
            >
              <Upload className="w-5 h-5 mr-2" />
              Upload from Gallery
            </Button>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
      </div>
    </div>
  )
}
