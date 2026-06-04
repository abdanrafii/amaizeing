'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/top-bar'
import { CameraCard } from '@/components/camera-card'
import { ResultsCard } from '@/components/results-card'
import { BottomNav } from '@/components/bottom-nav'
import * as tf from '@tensorflow/tfjs'
// Import icon loader untuk animasi loading overlay
import { Loader2 } from 'lucide-react'

// Tipe data untuk menampung hasil prediksi
interface PredictionResult {
  disease: string;
  confidence: string;
  treatment: string;
}

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  // State untuk model dan hasil prediksi
  const [model, setModel] = useState<tf.GraphModel | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)

  // STATE BARU: Untuk melacak status loading model AI di awal
  const [isModelLoading, setIsModelLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Menghubungkan ke AI Engine...")

  // LOAD MODEL SAAT WEBSITES PERTAMA KALI DIBUKA
  useEffect(() => {
    async function loadModel() {
      try {
        console.log("Memuat model AI offline dari public/local_model...")
        setLoadingMessage("Sedang mengunduh model deteksi jagung (mohon tunggu)...")
        
        // MENCOBA KEMBALI DENGAN loadLayersModel 
        // Jika masih error, ganti teks di bawah menjadi: tf.loadGraphModel
        const loadedModel = await tf.loadGraphModel('/local_model/model.json')
        
        setModel(loadedModel)
        setIsModelLoading(false) // Sukses! Sembunyikan layar loading overlay
        console.log("🔥 BOOM! Model AI Offline Siap Digunakan!")
      } catch (error) {
        console.error("Gagal memuat model AI:", error)
        setLoadingMessage("Gagal memuat model AI. Pastikan file model.json Anda valid atau coba refresh halaman.")
      }
    }
    loadModel()
  }, [])

  // FUNGSI UTAMA PROSES DETEKSI OFFLINE
  const handleImageSelect = async (file: File) => {
    setSelectedFile(file)
    setShowResults(false)
    setIsAnalyzing(true)

    if (!model) {
      alert("Model AI belum siap di memori HP, tunggu beberapa detik lagi ya!")
      setIsAnalyzing(false)
      return
    }

    try {
      const imageUrl = URL.createObjectURL(file)
      const img = new Image()
      img.src = imageUrl

      img.onload = async () => {
        // Preprocessing Gambar
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([224, 224])
          .toFloat()
          .div(tf.scalar(255.0))
          .expandDims()

        // EKSEKUSI PREDIKSI
        const output = model.predict(tensor) as tf.Tensor
        const predictions = await output.data()

        // Daftar label penyakit
        const classes = [
          'Bercak Daun (Gray Leaf Spot)', 
          'Karat Daun (Common Rust)', 
          'Hawar Daun (Northern Leaf Blight)', 
          'Sehat (Healthy)'
        ]

        // Data rekomendasi penanganan buat petani
        const treatments: Record<string, string> = {
          'Bercak Daun (Gray Leaf Spot)': 'Gunakan fungisida berbahan aktif triazol. Lakukan rotasi tanaman untuk musim berikutnya.',
          'Karat Daun (Common Rust)': 'Semprotkan fungisida jika infeksi parah. Pastikan jarak tanam tidak terlalu rapat.',
          'Hawar Daun (Northern Leaf Blight)': 'Gunakan varietas benih unggul yang tahan hawar. Bersihkan sisa tanaman setelah panen.',
          'Sehat (Healthy)': 'Tanaman jagung Anda sehat! Pertahankan pola pemupukan dan pengairan secara berkala.'
        }

        const maxIdx = predictions.indexOf(Math.max(...predictions))
        const diseaseResult = classes[maxIdx]
        const confidenceResult = (predictions[maxIdx] * 100).toFixed(2) + '%'
        const treatmentResult = treatments[diseaseResult]

        setPrediction({
          disease: diseaseResult,
          confidence: confidenceResult,
          treatment: treatmentResult
        })

        setIsAnalyzing(false)
        setShowResults(true)
        
        tensor.dispose()
        output.dispose()
      }
    } catch (err) {
      console.error("Error saat klasifikasi gambar:", err)
      setIsAnalyzing(false)
    }
  }

  const handleNavigate = (tab: 'home' | 'history' | 'about') => {
    if (tab === 'home') {
      setSelectedFile(null)
      setShowResults(false)
      setPrediction(null)
    }
  }

  return (
    <main className="bg-white min-h-screen pb-24 relative">
      
      {/* FULL-SCREEN LOADING OVERLAY: Memblokir interaksi user sebelum model siap */}
      {isModelLoading && (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-md transition-all duration-500">
          <div className="flex flex-col items-center gap-4 p-6 text-center max-w-sm">
            <Loader2 className="h-12 w-12 animate-spin text-emerald-600" />
            <div className="space-y-2">
              <h3 className="text-xl font-semibold tracking-tight text-neutral-800">Menyiapkan Aplikasi</h3>
              <p className="text-sm text-neutral-500 animate-pulse">
                {loadingMessage}
              </p>
            </div>
          </div>
        </div>
      )}

      <TopBar />

      <div className="max-w-2xl mx-auto">
        {!showResults && <CameraCard onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />}

        {showResults && prediction && (
          <ResultsCard 
            image={selectedFile} 
            show={showResults} 
            disease={prediction.disease}
            confidence={prediction.confidence}
            treatment={prediction.treatment}
          />
        )}

        {isAnalyzing && (
          <div className="px-4 py-8">
            <div className="flex justify-center items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
            <p className="text-center text-emerald-600 mt-4 font-medium">
              Sedang mendeteksi daun jagung (Offline)...
            </p>
          </div>
        )}
      </div>

      <BottomNav onNavigate={handleNavigate} />
    </main>
  )
}