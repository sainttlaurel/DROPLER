import React from 'react'
import { cn } from '@/lib/utils'

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string
  filled?: boolean
  size?: 'sm' | 'md' | 'lg' | 'xl'
}

export function Icon({ name, filled = false, size = 'md', className, ...props }: IconProps) {
  const sizes = {
    sm: 'text-base',
    md: 'text-2xl',
    lg: 'text-4xl',
    xl: 'text-6xl',
  }
  
  return (
    <span
      className={cn('material-symbols-outlined', sizes[size], className)}
      style={{ fontVariationSettings: filled ? "'FILL' 1" : "'FILL' 0" }}
      {...props}
    >
      {name}
    </span>
  )
}
