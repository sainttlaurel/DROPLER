'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { toast } from 'sonner'
import { Button } from '@/components/ui/Button'
import { Input, Textarea } from '@/components/ui/Input'
import { supportMessageSchema, type SupportMessageData } from '@/lib/validations/support'

interface ContactFormProps {
  storeId: string
  onSuccess?: (email: string) => void
}

export function ContactForm({ storeId, onSuccess }: ContactFormProps) {
  const [submitted, setSubmitted] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<SupportMessageData>({
    resolver: zodResolver(supportMessageSchema),
  })

  const onSubmit = async (data: SupportMessageData) => {
    try {
      const res = await fetch('/api/support/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ storeId, ...data }),
      })

      if (!res.ok) throw new Error('Submission failed')

      setSubmitted(true)
      reset()
      toast.success("Message sent! We'll get back to you within 24 hours.")
      onSuccess?.(data.email)
    } catch {
      toast.error('Failed to send message. Please try again.')
    }
  }

  if (submitted) {
    return (
      <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-8 text-center">
        <div className="text-5xl mb-4">✓</div>
        <h3 className="font-headline font-black text-2xl uppercase tracking-tighter mb-2">Message Sent!</h3>
        <p className="font-body mb-6">We typically respond within 24 hours.</p>
        <Button variant="secondary" size="md" onClick={() => setSubmitted(false)}>
          Send Another Message
        </Button>
      </div>
    )
  }

  return (
    <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-8">
      <h2 className="font-headline font-black text-3xl uppercase tracking-tighter mb-2">Contact Us</h2>
      <p className="font-body text-sm mb-6 opacity-70">We typically respond within 24 hours.</p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <Input label="Name" placeholder="Your name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" type="email" placeholder="your@email.com" error={errors.email?.message} {...register('email')} />
        </div>
        <Input label="Subject" placeholder="What's this about?" error={errors.subject?.message} {...register('subject')} />
        <Textarea
          label="Message"
          placeholder="Describe your issue or question..."
          className="min-h-[160px]"
          error={errors.message?.message}
          {...register('message')}
        />
        <Button type="submit" variant="yellow" size="md" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </Button>
      </form>
    </div>
  )
}
