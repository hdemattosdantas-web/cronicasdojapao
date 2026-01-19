'use client'

import React from 'react'

interface CustomButtonProps {
  onClick: () => void
  children: React.ReactNode
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

export default function CustomButton({ 
  onClick, 
  children, 
  className = '', 
  type = 'button',
  disabled = false 
}: CustomButtonProps) {
  return (
    <button
      onClick={onClick}
      type={type}
      disabled={disabled}
      className={`japan-button ${className}`}
      style={{
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.6 : 1,
        pointerEvents: 'auto'
      }}
    >
      {children}
    </button>
  )
}
