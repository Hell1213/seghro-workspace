'use client'

import Image from 'next/image'

interface SeghroLogoProps {
  className?: string
  iconSize?: number
  showText?: boolean
  textClass?: string
  white?: boolean
}

export function SeghroLogo({ className = '', iconSize = 32, showText = true, textClass = '', white = false }: SeghroLogoProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div
        className={`relative flex items-center justify-center rounded-lg ${white ? 'bg-white/20 backdrop-blur-sm' : 'bg-[#dc2626] shadow-md shadow-red-500/20'}`}
        style={{ width: iconSize, height: iconSize }}
      >
        <Image
          src={white ? '/logo-white.svg' : '/logo.svg'}
          alt="Seghro"
          width={iconSize}
          height={iconSize}
          className="p-0.5"
          priority
        />
        {!white && (
          <span className="absolute inset-0 rounded-lg bg-[#dc2626] animate-ping opacity-20" />
        )}
      </div>
      {showText && (
        <span className={`font-bold tracking-tight ${textClass || (white ? 'text-white' : 'text-gray-900 dark:text-gray-100')}`}>
          Seghro
        </span>
      )}
    </div>
  )
}
