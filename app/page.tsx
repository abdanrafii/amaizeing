'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/top-bar'
import { CameraCard } from '@/components/camera-card'
import { ResultsCard } from '@/components/results-card'
import { BottomNav } from '@/components/bottom-nav'
// 1. IMPORT TENSORFLOW.JS
import * as tf from '@tensorflow/tfjs'

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
  
  // State baru untuk menyimpan hasil prediksi AI yang asli
  const [model, setModel] = useState<tf.LayersModel | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)

  // 2. LOAD MODEL SECARA OFFLINE PAS WEBSITE PERTAMA KALI DIBUKA
  useEffect(() => {
    async function loadModel() {
      try {
        console.log("Memuat model AI offline dari public/local_model...")
        // Memanggil file JSON yang kamu taruh di folder public/local_model tadi
        const loadedModel = await tf.loadGraphModel('/local_model/model.json')
        setModel(loadedModel)
        console.log("🔥 BOOM! Model AI Offline Siap Digunakan!")
      } catch (error) {
        console.error("Gagal memuat model AI:", error)
      }
    }
    loadModel()
  }, [])

  // 3. FUNGSI UTAMA PROSES DETEKSI OFFLINE
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
      // Ubah file gambar menjadi objek HTMLImageElement agar bisa dibaca TensorFlow.js
      const imageUrl = URL.createObjectURL(file)
      const img = new Image()
      img.src = imageUrl

      img.onload = async () => {
        // Preprocessing Gambar (Ubah ukuran ke 224x224, normalisasi 0-1, expand dimensi batch)
        const tensor = tf.browser.fromPixels(img)
          .resizeNearestNeighbor([224, 224]) // Sesuaikan dengan input modelmu
          .toFloat()
          .div(tf.scalar(255.0))
          .expandDims()

        // EKSEKUSI PREDIKSI (100% OFFLINE DI HP PETANI)
        const output = model.predict(tensor) as tf.Tensor
        const predictions = await output.data()

        // Daftar label penyakit (Sesuaikan urutan kelasnya dengan pas kamu training)
        const classes = [
          'Bercak Daun (Gray Leaf Spot)', 
          'Karat Daun (Common Rust)', 
          'Hawar Daun (Northern Leaf Blight)', 
          'Sehat (Healthy)'
        ]

        // Data rekomendasi penanganan buat petani (Nilai plus skripsi!)
        const treatments: Record<string, string> = {
          'Bercak Daun (Gray Leaf Spot)': 'Gunakan fungisida berbahan aktif triazol. Lakukan rotasi tanaman untuk musim berikutnya.',
          'Karat Daun (Common Rust)': 'Semprotkan fungisida jika infeksi parah. Pastikan jarak tanam tidak terlalu rapat.',
          'Hawar Daun (Northern Leaf Blight)': 'Gunakan varietas benih unggul yang tahan hawar. Bersihkan sisa tanaman setelah panen.',
          'Sehat (Healthy)': 'Tanaman jagung Anda sehat! Pertahankan pola pemupukan dan pengairan secara berkala.'
        }

        // Cari index dengan nilai probabilitas tertinggi
        const maxIdx = predictions.indexOf(Math.max(...predictions))
        const diseaseResult = classes[maxIdx]
        const confidenceResult = (predictions[maxIdx] * 100).toFixed(2) + '%'
        const treatmentResult = treatments[diseaseResult]

        // Simpan hasil aslinya ke dalam state
        setPrediction({
          disease: diseaseResult,
          confidence: confidenceResult,
          treatment: treatmentResult
        })

        // Matikan loading dan tampilkan hasilnya
        setIsAnalyzing(false)
        setShowResults(true)
        
        // Bersihkan memori tensor biar HP petani gak lemot
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
    <main className="bg-white min-h-screen pb-24">
      <TopBar />

      <div className="max-w-2xl mx-auto">
        {!showResults && <CameraCard onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />}

        {/* 4. OPER DATA HASIL PREDIKSI ASLI KE RESULTS CARD */}
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