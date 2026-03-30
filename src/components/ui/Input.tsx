import React from 'react'
import { cn } from '@/lib/utils'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, type = 'text', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-label font-bold uppercase text-xs tracking-widest mb-2">
            {label}
          </label>
        )}
        <input
          type={type}
          className={cn(
            'w-full px-4 py-3 bg-surface border-b-4 border-outline font-body font-medium',
            'focus:outline-none focus:border-primary-container focus:bg-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'placeholder:text-on-surface-variant placeholder:opacity-60',
            error && 'border-secondary',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 text-xs font-bold text-secondary uppercase tracking-wider">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block font-label font-bold uppercase text-xs tracking-widest mb-2">
            {label}
          </label>
        )}
        <textarea
          className={cn(
            'w-full px-4 py-3 bg-surface border-4 border-outline font-body font-medium min-h-[120px]',
            'focus:outline-none focus:border-primary-container focus:bg-white',
            'disabled:opacity-50 disabled:cursor-not-allowed',
            'placeholder:text-on-surface-variant placeholder:opacity-60',
            error && 'border-secondary',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-2 text-xs font-bold text-secondary uppercase tracking-wider">
            {error}
          </p>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
