import { Leaf } from 'lucide-react'

export function TopBar() {
  return (
    <div className="sticky top-0 z-50 bg-white border-b border-emerald-100 px-4 py-4 shadow-sm">
      <div className="flex items-center justify-center gap-2">
        <Leaf className="w-6 h-6 text-emerald-700" />
        <h1 className="text-2xl font-bold text-emerald-900">AMAIZEING</h1>
      </div>
      <p className="text-center text-sm text-emerald-600 mt-1">Corn Leaf Disease Classifier</p>
    </div>
  )
}
