'use client'

import { useState, useEffect } from 'react'
import { TopBar } from '@/components/top-bar'
import { CameraCard } from '@/components/camera-card'
import { ResultsCard } from '@/components/results-card'
import { BottomNav, type BottomTab } from '@/components/bottom-nav'
import * as tf from '@tensorflow/tfjs'
import { CalendarClock, History, Leaf, Loader2, Sprout } from 'lucide-react'

interface PredictionResult {
  disease: string;
  confidence: string;
}

interface HistoryItem extends PredictionResult {
  id: string;
  fileName: string;
  createdAt: string;
}

function parseDiseaseName(fullString: string) {
  const regExp = /\(([^)]+)\)/;
  const matches = regExp.exec(fullString);

  if (matches && matches[1]) {
    return {
      name: fullString.replace(regExp, '').trim(),
      latinName: matches[1],
    };
  }

  return { name: fullString, latinName: '' };
}

export default function Page() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showResults, setShowResults] = useState(false)
  
  const [model, setModel] = useState<tf.GraphModel | null>(null)
  const [prediction, setPrediction] = useState<PredictionResult | null>(null)
  const [activeTab, setActiveTab] = useState<BottomTab>('home')
  const [history, setHistory] = useState<HistoryItem[]>([])

  const [isModelLoading, setIsModelLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Menghubungkan ke AI Engine...")

  // 1. LOAD MODEL (Tetap GraphModel sesuai format file Anda)
  useEffect(() => {
    async function loadModel() {
      try {
        console.log("Memuat model AI offline dari public/local_model...")
        setLoadingMessage("Sedang mengunduh model deteksi jagung (mohon tunggu)...")
        
        const loadedModel = await tf.loadGraphModel('/local_model/model.json')
        
        setModel(loadedModel)
        setIsModelLoading(false)
        console.log("🔥 BOOM! Model AI Offline Siap Digunakan!")
      } catch (error) {
        console.error("Gagal memuat model AI:", error)
        setLoadingMessage("Gagal memuat model AI. Pastikan file model.json Anda valid atau coba refresh halaman.")
      }
    }
    loadModel()
  }, [])

  // 2. FUNGSI UTAMA PROSES DETEKSI OFFLINE
  const handleImageSelect = async (file: File) => {
    setActiveTab('home')
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
        // --- PREPROCESSING GAMBAR (100% KLONING LOGIKA PYTHON LO) ---
        const tensor = tf.browser.fromPixels(img)
          .resizeBilinear([224, 224]) // Ganti ke Bilinear agar fitur karat/bercak tidak rusak
          .toFloat()
          .div(tf.scalar(255.0))      // Murni dibagi 255.0 sesuai fungsi parse_image lo
          .expandDims()

        // --- EKSEKUSI PREDIKSI ---
        const output = model.predict(tensor) as tf.Tensor
        
        console.log("--- DEBUG PREDIKSI TERBARU ---")
        const predictions = await output.data()
        console.log("Angka Probabilitas Mentah Array:", Array.from(predictions))
        console.log("------------------------------")

        // Daftar label penyakit berdasarkan urutan alfabetis folder dataset Python lo:
        // Index 0: Blight, Index 1: Common_Rust, Index 2: Gray_Leaf_Spot, Index 3: Healthy
        const classes = [
          'Hawar Daun (Northern Leaf Blight)', // Indeks 0
          'Karat Daun (Common Rust)',          // Indeks 1
          'Bercak Daun (Gray Leaf Spot)',      // Indeks 2
          'Sehat (Healthy)'                    // Indeks 3
        ]

        // Mencari indeks tertinggi (ArgMax manual yang aman)
        let maxIdx = 0;
        let maxVal = predictions[0];
        for (let i = 1; i < predictions.length; i++) {
          if (predictions[i] > maxVal) {
            maxVal = predictions[i];
            maxIdx = i;
          }
        }

        const diseaseResult = classes[maxIdx]
        const confidenceResult = (maxVal * 100).toFixed(2) + '%'

        const nextPrediction = {
          disease: diseaseResult,
          confidence: confidenceResult
        }

        setPrediction(nextPrediction)
        setHistory((currentHistory) => [
          {
            ...nextPrediction,
            id: `${Date.now()}-${file.name}`,
            fileName: file.name,
            createdAt: new Date().toLocaleString('id-ID', {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            }),
          },
          ...currentHistory,
        ].slice(0, 10))

        setIsAnalyzing(false)
        setShowResults(true)
        
        // Hapus tensor dari memori untuk mencegah memory leak
        tensor.dispose()
        output.dispose()
      }
    } catch (err) {
      console.error("Error saat klasifikasi gambar:", err)
      setIsAnalyzing(false)
    }
  }

  const handleNavigate = (tab: BottomTab) => {
    if (tab === 'home' && activeTab === 'home' && selectedFile) {
      return
    }

    setActiveTab(tab)
  }

  return (
    <main className="relative min-h-screen bg-[linear-gradient(180deg,#f0fdf4_0%,#ffffff_38%,#f8fafc_100%)] pb-28">
      
      {/* FULL-SCREEN LOADING OVERLAY */}
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

      <div className="mx-auto max-w-5xl">
        {activeTab === 'home' && (
          <>
            {!showResults && <CameraCard onImageSelect={handleImageSelect} isAnalyzing={isAnalyzing} />}

            {showResults && prediction && (
              <ResultsCard
                image={selectedFile}
                show={showResults}
                disease={prediction.disease}
                confidence={prediction.confidence}
                onImageSelect={handleImageSelect}
              />
            )}

            {isAnalyzing && (
              <div className="px-4 py-8">
                <div className="mx-auto max-w-md rounded-3xl border border-emerald-100 bg-white/85 p-6 text-center shadow-lg shadow-emerald-100/60 backdrop-blur">
                  <div className="flex items-center justify-center gap-2">
                    <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-600" style={{ animationDelay: '0ms' }} />
                    <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-600" style={{ animationDelay: '150ms' }} />
                    <div className="h-2.5 w-2.5 animate-bounce rounded-full bg-emerald-600" style={{ animationDelay: '300ms' }} />
                  </div>
                  <p className="mt-4 font-semibold text-emerald-700">
                    Sedang mendeteksi daun jagung (Offline)...
                  </p>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <section className="px-4 py-6 sm:py-10">
            <div className="mb-5 flex items-end justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-emerald-700">Riwayat analisis</p>
                <h2 className="mt-1 text-2xl font-bold text-gray-950 sm:text-3xl">History Deteksi</h2>
              </div>
              <div className="hidden h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 sm:flex">
                <History className="h-6 w-6 text-emerald-700" />
              </div>
            </div>

            {history.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-emerald-300 bg-white/85 p-8 text-center shadow-sm">
                <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100">
                  <Sprout className="h-7 w-7 text-emerald-700" />
                </div>
                <h3 className="text-lg font-bold text-gray-950">Belum ada history</h3>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-gray-600">
                  Hasil diagnosis akan otomatis tersimpan di sini setelah Anda mengambil foto atau upload gambar daun jagung.
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {history.map((item) => {
                  const { name, latinName } = parseDiseaseName(item.disease)

                  return (
                    <article
                      key={item.id}
                      className="rounded-3xl border border-emerald-100 bg-white p-5 shadow-lg shadow-emerald-100/50"
                    >
                      <div className="mb-4 flex items-start justify-between gap-3">
                        <div className="flex min-w-0 items-start gap-3">
                          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
                            <Leaf className="h-6 w-6 text-emerald-700" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="truncate text-lg font-bold text-gray-950">{name}</h3>
                            {latinName && <p className="truncate text-sm italic text-gray-500">{latinName}</p>}
                          </div>
                        </div>
                        <span className="shrink-0 rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">
                          {item.confidence}
                        </span>
                      </div>

                      <div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-xs text-gray-500">
                        <span className="max-w-56 truncate">{item.fileName}</span>
                        <span className="inline-flex items-center gap-1.5 font-medium">
                          <CalendarClock className="h-4 w-4" />
                          {item.createdAt}
                        </span>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
        )}
      </div>

      <BottomNav
        activeTab={activeTab}
        disableScan={activeTab === 'home' && !!selectedFile}
        onNavigate={handleNavigate}
      />
    </main>
  )
}
