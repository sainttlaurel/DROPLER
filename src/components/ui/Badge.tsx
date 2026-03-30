import React from 'react'
import { cn } from '@/lib/utils'

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
  children: React.ReactNode
}

export function Badge({ variant = 'default', className, children, ...props }: BadgeProps) {
  const variants = {
    default: 'bg-outline-variant text-on-surface border-2 border-outline',
    success: 'bg-[#10b981] text-white border-2 border-outline',
    warning: 'bg-primary-container text-on-primary-container border-2 border-outline',
    danger: 'bg-secondary text-on-secondary border-2 border-outline',
    info: 'bg-tertiary text-on-tertiary border-2 border-outline',
  }
  
  return (
    <span
      className={cn(
        'inline-flex items-center px-3 py-1 font-label font-black text-xs uppercase tracking-wider',
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  )
}
