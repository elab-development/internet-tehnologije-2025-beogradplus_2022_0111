'use client'
import React, { useEffect, useState } from 'react'

type MessageToastProps = {
  poruka: string
  duration?: number
  onClose?: () => void
}

export default function MessageToast({ poruka, duration = 2500, onClose }: MessageToastProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!poruka) return
    setVisible(true)
    const t1 = setTimeout(() => setVisible(false), duration)
    const t2 = setTimeout(() => { if (onClose) onClose() }, duration + 300)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [poruka, duration, onClose])

  if (!poruka) return null

  return (
    <div aria-live="polite" className="fixed inset-x-0 top-4 flex justify-center pointer-events-none z-[9999]">
      <div className={`pointer-events-auto transform transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'} mt-4`}>
        <div className="bg-white text-gray-800 px-8 py-3 rounded-2xl shadow-lg max-w-xl text-lg font-bold text-center leading-tight">
          {poruka}
        </div>
      </div>
    </div>
  )
}
