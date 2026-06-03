'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AlertCircle, CheckCircle2 } from 'lucide-react'
import { Card } from '@/components/ui/card'

// 1. UPDATE PROPS AGAR MENERIMA DATA ASLI DARI PAGE.TSX
interface ResultsCardProps {
  image: File | null
  show: boolean
  disease?: string
  confidence?: string
  treatment?: string
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

export function ResultsCard({ image, show, disease = '', confidence = '0%', treatment = '' }: ResultsCardProps) {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [animateIn, setAnimateIn] = useState(false)

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

  if (!show || !image) return null

  return (
    <div
      className={`px-4 py-6 transition-all duration-500 ${
        animateIn ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
    >
      <Card className="overflow-hidden border-emerald-200 shadow-lg">
        {/* Image Preview */}
        {imageUrl && (
          <div className="relative w-full h-56 bg-gray-100">
            <Image
              src={imageUrl}
              alt="Pratinjau Daun Jagung"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* Results Content */}
        <div className="p-6 space-y-6 bg-white">
          {/* 2. TAMPILKAN PERSENTASE AKURASI MODEL ASLI */}
          <div className="flex items-center justify-center">
            <div className="bg-emerald-100 px-4 py-2 rounded-full flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span className="font-semibold text-emerald-700">
                Akurasi: {confidence}
              </span>
            </div>
          </div>

          {/* 3. TAMPILKAN NAMA PENYAKIT ASLI */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-500">Hasil Diagnosis</p>
            <h3 className="text-3xl font-bold text-gray-900 text-balance">
              {name}
            </h3>
            {latinName && (
              <p className="text-sm italic text-gray-600">
                {latinName}
              </p>
            )}
          </div>

          {/* 4. TAMPILKAN REKOMENDASI PENANGANAN ASLI */}
          <div className="space-y-3 border-t border-gray-200 pt-4">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-emerald-600" />
              <h4 className="font-semibold text-gray-900">Saran Tindakan Petani</h4>
            </div>
            
            <div className="flex gap-3 text-sm text-gray-700 leading-relaxed bg-emerald-50/50 p-3 rounded-lg border border-emerald-100">
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-medium mt-0.5">
                !
              </span>
              <span>{treatment || 'Tidak ada rekomendasi spesifik.'}</span>
            </div>
          </div>

          {/* Additional Info / Disclaimer Ilmiah untuk Skripsi */}
          <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
            <p className="text-xs text-teal-800 leading-relaxed">
              <strong>Tips Lapangan:</strong> Lakukan pemantauan area sawah secara berkala. Deteksi dini sangat membantu mempertahankan hasil tonase panen jagung Anda.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
}