'use client'

import { Icon } from './Icon'
import { Button } from './Button'

interface DeleteConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: string
}

export function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: DeleteConfirmModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary/60 z-50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white border-4 border-primary neo-shadow-lg max-w-md w-full animate-in fade-in zoom-in duration-200">
          {/* Header */}
          <div className="p-6 border-b-4 border-primary bg-secondary text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Icon name="warning" size="lg" />
              <h3 className="font-headline font-black uppercase text-xl tracking-tight">
                {title}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 border-2 border-white flex items-center justify-center hover:bg-white hover:text-secondary transition-all active:scale-95"
            >
              <Icon name="close" size="sm" />
            </button>
          </div>

          {/* Content */}
          <div className="p-8">
            <p className="text-lg leading-relaxed mb-6">{message}</p>
            <div className="flex gap-4">
              <Button
                variant="danger"
                size="md"
                onClick={onConfirm}
                className="flex-1"
              >
                <Icon name="delete" size="sm" />
                Delete
              </Button>
              <Button
                variant="ghost"
                size="md"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
