import React from 'react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'yellow' | 'blue'
  size?: 'sm' | 'md' | 'lg'
  children: React.ReactNode
}

export function Button({ 
  variant = 'primary', 
  size = 'md', 
  className, 
  children, 
  ...props 
}: ButtonProps) {
  const baseStyles = 'font-headline font-black uppercase tracking-tighter transition-all disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2'
  
  const variants = {
    primary: 'bg-primary text-on-primary border-4 border-outline neo-shadow hover:neo-shadow-active active:neo-shadow-active',
    secondary: 'bg-surface text-on-surface border-4 border-outline neo-shadow hover:neo-shadow-active active:neo-shadow-active',
    yellow: 'bg-primary-container text-on-primary-container border-4 border-outline neo-shadow hover:neo-shadow-active active:neo-shadow-active',
    blue: 'bg-tertiary text-on-tertiary border-4 border-outline neo-shadow hover:neo-shadow-active active:neo-shadow-active',
    danger: 'bg-secondary text-on-secondary border-4 border-outline neo-shadow hover:neo-shadow-active active:neo-shadow-active',
    ghost: 'border-4 border-outline hover:bg-primary hover:text-on-primary transition-colors',
  }
  
  const sizes = {
    sm: 'px-4 py-2 text-xs',
    md: 'px-6 py-3 text-sm',
    lg: 'px-10 py-5 text-xl',
  }
  
  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      {...props}
    >
      {children}
    </button>
  )
}
