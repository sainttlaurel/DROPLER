'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/Input'
import { FAQItem } from './FAQItem'

interface FAQSectionProps {
  items: { question: string; answer: string }[]
}

export function FAQSection({ items }: FAQSectionProps) {
  const [search, setSearch] = useState('')

  const filtered = search.trim()
    ? items.filter(
        (item) =>
          item.question.toLowerCase().includes(search.toLowerCase()) ||
          item.answer.toLowerCase().includes(search.toLowerCase())
      )
    : items

  return (
    <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-8">
      <h2 className="font-headline font-black text-3xl uppercase tracking-tighter mb-2">FAQ</h2>
      <p className="font-body text-sm mb-6 opacity-70">Find quick answers to common questions.</p>

      <div className="mb-6">
        <Input
          placeholder="Search questions..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search FAQ"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="border-4 border-black p-8 text-center">
          <p className="font-headline font-black text-lg uppercase tracking-tight opacity-50">
            No results for &ldquo;{search}&rdquo;
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((item, index) => (
            <FAQItem key={index} question={item.question} answer={item.answer} />
          ))}
        </div>
      )}
    </div>
  )
}
