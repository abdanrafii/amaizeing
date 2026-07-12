'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Camera, CheckCircle2, Upload } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// 1. UPDATE PROPS AGAR MENERIMA DATA ASLI DARI PAGE.TSX
interface ResultsCardProps {
  image: File | null
  show: boolean
  disease?: string
  confidence?: string
  onImageSelect?: (file: File) => void
}

// Fungsi pembantu untuk memisahkan Nama Umum dan Nama Latin dari teks prediksi kita
function parseDiseaseName(fullString: string) {
  if (!fullString) return { name: 'Memproses...', latinName: '' }
  
  const regExp = /\(([^)]+)\)/;
  const matches = regExp.exec(fullString);
  
  if (matches && matches[1]) {
    const name = fullString.replace(regExp, '').trim();
    return { name: name, latinName: matches[1] };
  }
  
  return { name: fullString, latinName: '' };
}

export function ResultsCard({ image, show, disease = '', confidence = '0%', onImageSelect }: ResultsCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [animateIn, setAnimateIn] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)

  // Memecah nama penyakit (Misal: "Karat Daun (Common Rust)" -> name: "Karat Daun", latinName: "Common Rust")
  const { name, latinName } = parseDiseaseName(disease);

  useEffect(() => {
    if (image) {
      const url = URL.createObjectURL(image)
      setImageUrl(url)
      setTimeout(() => setAnimateIn(true), 100)
      return () => URL.revokeObjectURL(url)
    }
  }, [image])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImageSelect) {
      setAnimateIn(false)
      onImageSelect(file)
      event.target.value = ''
    }
  }

  if (!show || !image) return null

  return (
    <div
      className={`px-4 py-6 transition-all duration-500 sm:py-8 ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <Card className="overflow-hidden rounded-3xl border-emerald-200 shadow-xl shadow-emerald-100/70">
        {/* Image Preview */}
        {imageUrl && (
          <div className="relative h-64 w-full bg-gray-100 sm:h-80">
            <Image
              src={imageUrl}
              alt="Pratinjau Daun Jagung"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Results Content */}
        <div className="space-y-6 bg-white p-5 sm:p-7">
          {/* 2. TAMPILKAN PERSENTASE AKURASI MODEL ASLI */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="font-semibold text-emerald-700">
                Confidence: {confidence}
              </span>
            </div>
            {/* <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Hasil terbaru
            </span> */}
          </div>

          {/* 3. TAMPILKAN NAMA PENYAKIT ASLI */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Hasil Diagnosis</p>
            <h3 className="text-2xl font-bold text-gray-950 text-balance sm:text-3xl">
              {name}
            </h3>
            {latinName && (
              <p className="text-sm italic text-gray-600">
                {latinName}
              </p>
            )}
          </div>

          {/* Additional Info / Disclaimer Ilmiah untuk Skripsi */}
          <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4">
            <p className="text-xs text-teal-800 leading-relaxed">
              <strong>Tips Lapangan:</strong> Lakukan pemantauan area sawah secara berkala. Deteksi dini sangat membantu mempertahankan hasil tonase panen jagung Anda.
            </p>
          </div>

          {onImageSelect && (
            <div className="grid gap-3 border-t border-gray-200 pt-5 sm:grid-cols-2">
              <Button
                size="lg"
                className="h-13 rounded-xl bg-emerald-600 font-semibold text-white hover:bg-emerald-700"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="mr-2 h-5 w-5" />
                Foto Lagi
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 rounded-xl border-2 border-emerald-600 font-semibold text-emerald-700 hover:bg-emerald-50"
                onClick={() => fileInputRef.current?.click()}
              >
                <Upload className="mr-2 h-5 w-5" />
                Upload Gambar Lagi
              </Button>

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
          )}
        </div>
      </Card>
    </div>
  )
}
