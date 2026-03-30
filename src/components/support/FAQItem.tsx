'use client'

import { useState } from 'react'

interface FAQItemProps {
  question: string
  answer: string
}

export function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className={`border-4 border-black bg-white transition-all ${isOpen ? 'shadow-[4px_4px_0px_0px_#1a1a1a]' : 'hover:shadow-[4px_4px_0px_0px_#1a1a1a]'}`}>
      <button
        type="button"
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-black"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
      >
        <span className="font-headline font-black text-base uppercase tracking-tight">
          {question}
        </span>
        <span className="flex-shrink-0 w-8 h-8 border-4 border-black flex items-center justify-center font-black text-xl leading-none" aria-hidden="true">
          {isOpen ? '−' : '+'}
        </span>
      </button>
      {isOpen && (
        <div className="px-6 pb-6 border-t-4 border-black pt-4">
          <p className="font-body text-sm leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}
