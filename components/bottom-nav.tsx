'use client'

import { Home, History, Info } from 'lucide-react'
import { useState } from 'react'

interface BottomNavProps {
  onNavigate: (tab: 'home' | 'history' | 'about') => void
}

export function BottomNav({ onNavigate }: BottomNavProps) {
  const [activeTab, setActiveTab] = useState<'home' | 'history' | 'about'>('home')

  const tabs = [
    { id: 'home' as const, icon: Home, label: 'Scan', color: 'text-emerald-600' },
    { id: 'history' as const, icon: History, label: 'History', color: 'text-gray-400' },
    { id: 'about' as const, icon: Info, label: 'About', color: 'text-gray-400' },
  ]

  const handleTabChange = (tabId: 'home' | 'history' | 'about') => {
    setActiveTab(tabId)
    onNavigate(tabId)
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-emerald-100 shadow-lg">
      <div className="flex justify-around items-center h-20 max-w-2xl mx-auto px-4">
        {tabs.map(({ id, icon: Icon, label, color }) => (
          <button
            key={id}
            onClick={() => handleTabChange(id)}
            className={`flex flex-col items-center gap-1 py-2 px-4 rounded-lg transition-colors ${
              activeTab === id
                ? 'text-emerald-600 bg-emerald-50'
                : 'text-gray-400 hover:text-gray-600'
            }`}
            aria-label={label}
          >
            <Icon className="w-6 h-6" />
            <span className="text-xs font-medium">{label}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}
