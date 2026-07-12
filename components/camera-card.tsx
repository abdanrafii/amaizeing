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
      event.target.value = ''
    }
  }

  return (
    <section className="px-4 py-6 sm:py-10">
      <div className="overflow-hidden rounded-3xl border border-emerald-200 bg-white shadow-xl shadow-emerald-100/70">
        <div className="grid gap-0 md:grid-cols-[0.95fr_1.05fr]">
          <div className="relative min-h-44 bg-[radial-gradient(circle_at_30%_20%,rgba(251,191,36,0.22),transparent_34%),linear-gradient(135deg,#047857,#14b8a6)] p-6 text-white sm:p-8">
            <div className="absolute bottom-0 right-0 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
            <div className="relative flex h-full flex-col justify-between gap-8">
              <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-white/18 ring-1 ring-white/30">
                <Camera className="h-8 w-8" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium text-emerald-50">Deteksi daun jagung</p>
                <h2 className="max-w-xs text-2xl font-bold leading-tight sm:text-3xl">
                  Cek kondisi tanaman dari satu foto.
                </h2>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center gap-6 p-6 sm:p-8">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-gray-950">Mulai analisis</h3>
              <p className="text-sm leading-6 text-gray-600">
                Ambil foto daun secara langsung atau pilih gambar dari galeri untuk mendapatkan diagnosis dan saran penanganan.
              </p>
            </div>

            <div className="grid w-full gap-3 sm:grid-cols-2">
              <Button
                size="lg"
                className="h-14 w-full rounded-xl bg-emerald-600 text-base font-semibold text-white shadow-lg shadow-emerald-100 hover:bg-emerald-700"
                onClick={() => cameraInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                <Camera className="mr-2 h-5 w-5" />
                Ambil Foto
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="h-14 w-full rounded-xl border-2 border-emerald-600 text-base font-semibold text-emerald-700 hover:bg-emerald-50"
                onClick={() => fileInputRef.current?.click()}
                disabled={isAnalyzing}
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload
              </Button>
            </div>

            <p className="rounded-2xl bg-emerald-50 px-4 py-3 text-xs leading-5 text-emerald-800">
              Gunakan foto yang terang dan fokus pada area daun agar hasil klasifikasi lebih mudah dibaca.
            </p>

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
    </section>
  )
}
