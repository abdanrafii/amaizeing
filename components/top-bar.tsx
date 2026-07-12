import { Leaf } from 'lucide-react'

export function TopBar() {
  return (
    <header className="sticky top-0 z-50 border-b border-emerald-100 bg-white/90 px-4 py-4 shadow-sm backdrop-blur">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-emerald-100">
            <Leaf className="h-6 w-6 text-emerald-700" />
          </div>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-black tracking-wide text-emerald-950 sm:text-2xl">AMAIZEING</h1>
            <p className="truncate text-xs font-medium text-emerald-700 sm:text-sm">Corn Leaf Disease Classifier</p>
          </div>
        </div>
        {/* <span className="hidden rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-800 sm:inline-flex">
          Offline AI
        </span> */}
      </div>
    </header>
  )
}
