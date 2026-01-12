'use client'

import React from 'react'

interface BubbleProps {
  children: React.ReactNode
  className?: string
  opacity?: number
  padding?: 'sm' | 'md' | 'lg' | 'xl'
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | 'full'
}

export default function Bubble({ 
  children, 
  className = '', 
  opacity = 0.7,
  padding = 'md',
  rounded = 'lg'
}: BubbleProps) {
  
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5',
    xl: 'p-5'
  }
  
  const roundedClasses = {
    sm: 'rounded-3',
    md: 'rounded-4',
    lg: 'rounded-4',
    xl: 'rounded-5',
    full: 'rounded-pill'
  }
  
  return (
    <div 
      className={`
        ${paddingClasses[padding]} 
        ${roundedClasses[rounded]} 
        shadow-lg 
        ${className}
      `}
      style={{ 
        backgroundColor: `rgba(255, 255, 255, ${opacity})`,
        backdropFilter: 'blur(5px)',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
      }}
    >
      {children}
    </div>
  )
}