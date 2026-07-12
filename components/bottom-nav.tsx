'use client'

import { History, ScanLine } from 'lucide-react'

export type BottomTab = 'home' | 'history'

interface BottomNavProps {
  activeTab: BottomTab
  disableScan?: boolean
  onNavigate: (tab: BottomTab) => void
}

export function BottomNav({ activeTab, disableScan = false, onNavigate }: BottomNavProps) {
  const tabs = [
    { id: 'home' as const, icon: ScanLine, label: 'Scan' },
    { id: 'history' as const, icon: History, label: 'History' },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-emerald-100 bg-white/95 shadow-[0_-10px_30px_rgba(16,185,129,0.12)] backdrop-blur">
      <div className="mx-auto grid h-20 max-w-2xl grid-cols-2 gap-3 px-4 py-3 sm:h-22">
        {tabs.map(({ id, icon: Icon, label }) => {
          const isDisabled = id === 'home' && disableScan

          return (
            <button
              key={id}
              onClick={() => {
                if (!isDisabled) onNavigate(id)
              }}
              disabled={isDisabled}
              className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold transition-all ${
                isDisabled
                  ? 'cursor-not-allowed bg-gray-100 text-gray-400 shadow-none'
                  : activeTab === id
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-200'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
              aria-label={label}
              aria-current={activeTab === id ? 'page' : undefined}
              aria-disabled={isDisabled}
              title={isDisabled ? 'Gunakan tombol Foto Lagi atau Upload Gambar Lagi' : label}
            >
              <Icon className="h-5 w-5 shrink-0" />
              <span className="truncate">{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
