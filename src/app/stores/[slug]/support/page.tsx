'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { StorefrontLayout } from '@/components/layout/StorefrontLayout'
import { ContactForm } from '@/components/support/ContactForm'
import { FAQSection } from '@/components/support/FAQSection'

const FAQ_ITEMS = [
  { question: 'How do I track my order?', answer: "Once your order ships, you'll receive a confirmation email with a tracking number. You can also view your order status by logging into your account." },
  { question: 'What is your return policy?', answer: 'We accept returns within 30 days of delivery. Items must be unused and in original packaging. Contact us to start a return.' },
  { question: 'How long does shipping take?', answer: 'Standard shipping takes 5–10 business days. Expedited shipping (2–3 business days) is available at checkout.' },
  { question: 'Can I change or cancel my order?', answer: 'Orders can be changed or cancelled within 1 hour of placement. Contact us immediately if you need to make a change.' },
  { question: 'What payment methods do you accept?', answer: 'We accept all major credit and debit cards. All transactions are secured with SSL encryption.' },
  { question: 'Do you ship internationally?', answer: 'Yes, we ship to most countries worldwide. International shipping typically takes 10–21 business days.' },
]

interface SupportMessage {
  id: string
  subject: string
  message: string
  status: 'UNREAD' | 'READ' | 'RESOLVED'
  reply: string | null
  repliedAt: string | null
  createdAt: string
}

const statusColor: Record<string, string> = {
  UNREAD:   'bg-[#0055ff] text-white',
  READ:     'bg-[#1a1a1a] text-white',
  RESOLVED: 'bg-green-600 text-white',
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000)
  if (s < 60) return 'just now'
  if (s < 3600) return `${Math.floor(s / 60)}m ago`
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`
  return `${Math.floor(s / 86400)}d ago`
}

export default function SupportPage() {
  const params = useParams()
  const slug = params.slug as string

  const [storeId, setStoreId] = useState<string | null>(null)
  const [tab, setTab] = useState<'new' | 'inbox'>('new')
  const [email, setEmail] = useState('')
  const [emailInput, setEmailInput] = useState('')
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [loadingMessages, setLoadingMessages] = useState(false)
  const [selected, setSelected] = useState<SupportMessage | null>(null)

  useEffect(() => {
    fetch(`/api/stores/${slug}`)
      .then(r => r.ok ? r.json() : null)
      .then(data => data && setStoreId(data.id ?? null))
      .catch(() => {})

    // Restore email from localStorage
    const saved = localStorage.getItem(`support_email_${slug}`)
    if (saved) { setEmail(saved); setEmailInput(saved) }
  }, [slug])

  useEffect(() => {
    if (tab === 'inbox' && email) fetchMessages(email)
  }, [tab, email])

  const fetchMessages = async (e: string) => {
    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/stores/${slug}/support?email=${encodeURIComponent(e)}`)
      if (res.ok) setMessages(await res.json())
    } catch {}
    finally { setLoadingMessages(false) }
  }

  const handleLookup = () => {
    if (!emailInput.trim()) return
    setEmail(emailInput.trim())
    localStorage.setItem(`support_email_${slug}`, emailInput.trim())
    fetchMessages(emailInput.trim())
  }

  const handleFormSuccess = (submittedEmail: string) => {
    setEmail(submittedEmail)
    setEmailInput(submittedEmail)
    localStorage.setItem(`support_email_${slug}`, submittedEmail)
    setTab('inbox')
    fetchMessages(submittedEmail)
  }

  return (
    <StorefrontLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <header className="mb-10">
          <h1 className="font-headline font-black uppercase tracking-tighter text-5xl sm:text-7xl leading-none mb-4">Support</h1>
          <p className="font-body text-lg opacity-70 max-w-xl">Have a question or need help? Browse our FAQ or send us a message.</p>
        </header>

        {/* Tabs */}
        <div className="flex gap-0 mb-8 border-4 border-[#1a1a1a] w-fit shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
          <button
            onClick={() => setTab('new')}
            className={`px-6 py-3 font-headline font-black uppercase text-sm transition-colors ${tab === 'new' ? 'bg-[#ffcc00] text-[#1a1a1a]' : 'bg-white hover:bg-[#f5f0e8]'}`}
          >
            New Message
          </button>
          <button
            onClick={() => setTab('inbox')}
            className={`px-6 py-3 font-headline font-black uppercase text-sm border-l-4 border-[#1a1a1a] transition-colors ${tab === 'inbox' ? 'bg-[#ffcc00] text-[#1a1a1a]' : 'bg-white hover:bg-[#f5f0e8]'}`}
          >
            My Messages {messages.length > 0 && `(${messages.length})`}
          </button>
        </div>

        {tab === 'new' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 space-y-6">
              {storeId ? (
                <ContactForm storeId={storeId} onSuccess={handleFormSuccess} />
              ) : (
                <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-8">
                  <div className="flex items-center gap-3 py-8">
                    <div className="w-8 h-8 border-4 border-black border-t-transparent rounded-full animate-spin flex-shrink-0" />
                    <p className="font-body text-sm opacity-70">Loading contact form…</p>
                  </div>
                </div>
              )}
              <div className="border-4 border-black bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-8">
                <h2 className="font-headline font-black text-2xl uppercase tracking-tighter mb-6 border-b-4 border-black pb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 border-4 border-black bg-[#ffcc00] flex items-center justify-center flex-shrink-0 font-black text-lg">@</div>
                    <div>
                      <p className="font-headline font-black text-xs uppercase opacity-60 mb-1">Email</p>
                      <a href="mailto:support@store.com" className="font-headline font-bold text-base hover:underline decoration-4 underline-offset-2">support@store.com</a>
                    </div>
                  </div>
                  <div className="border-4 border-black bg-[#ffcc00] p-4">
                    <p className="font-headline font-black text-sm uppercase tracking-tight">⚡ Response time: within 24 hours</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <FAQSection items={FAQ_ITEMS} />
            </div>
          </div>
        )}

        {tab === 'inbox' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left: message list */}
            <div className="lg:col-span-4">
              {/* Email lookup */}
              <div className="border-4 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_#1a1a1a] p-5 mb-4">
                <p className="font-headline font-black uppercase text-xs mb-3">Enter your email to view messages</p>
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={e => setEmailInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleLookup()}
                    placeholder="your@email.com"
                    className="flex-1 border-2 border-[#1a1a1a] px-3 py-2 font-body text-sm focus:outline-none focus:bg-[#fffbe6]"
                  />
                  <button
                    onClick={handleLookup}
                    className="px-4 py-2 bg-[#ffcc00] border-2 border-[#1a1a1a] font-headline font-black uppercase text-xs shadow-[2px_2px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                  >
                    Look Up
                  </button>
                </div>
              </div>

              {loadingMessages ? (
                <div className="border-4 border-[#1a1a1a] bg-white p-8 text-center">
                  <div className="w-8 h-8 border-4 border-[#1a1a1a] border-t-transparent rounded-full animate-spin mx-auto" />
                </div>
              ) : messages.length === 0 && email ? (
                <div className="border-4 border-[#1a1a1a] bg-white p-8 text-center">
                  <p className="font-headline font-bold uppercase opacity-40 text-sm">No messages found for this email.</p>
                </div>
              ) : (
                <div className="border-4 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_#1a1a1a] overflow-hidden">
                  {messages.map((msg, i) => (
                    <button
                      key={msg.id}
                      onClick={() => setSelected(msg)}
                      className={`w-full p-4 text-left border-b-2 border-[#1a1a1a]/10 last:border-0 transition-colors ${selected?.id === msg.id ? 'bg-[#ffcc00]' : 'hover:bg-[#f5f0e8]'}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-[10px] font-headline font-black px-2 py-0.5 ${statusColor[msg.status] ?? 'bg-gray-300 text-black'}`}>{msg.status}</span>
                        <span className="text-[10px] font-body opacity-50">{timeAgo(msg.createdAt)}</span>
                      </div>
                      <p className="font-headline font-bold uppercase text-sm leading-tight truncate">{msg.subject}</p>
                      {msg.reply && (
                        <p className="text-[10px] font-body opacity-60 mt-1 truncate">↩ Reply received</p>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Right: conversation */}
            <div className="lg:col-span-8">
              {selected ? (
                <div className="border-4 border-[#1a1a1a] bg-white shadow-[4px_4px_0px_0px_#1a1a1a] overflow-hidden">
                  {/* Header */}
                  <div className="bg-[#1a1a1a] text-white px-6 py-4 flex items-center justify-between">
                    <h3 className="font-headline font-black uppercase text-lg tracking-tighter">{selected.subject}</h3>
                    <span className={`text-[10px] font-headline font-black px-2 py-1 border border-white ${statusColor[selected.status] ?? ''}`}>{selected.status}</span>
                  </div>

                  <div className="p-6 space-y-6">
                    {/* Customer message */}
                    <div>
                      <p className="font-headline font-black uppercase text-xs opacity-50 mb-2">Your message · {timeAgo(selected.createdAt)}</p>
                      <div className="border-2 border-[#1a1a1a] p-4 bg-[#f5f0e8]">
                        <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                      </div>
                    </div>

                    {/* Reply */}
                    {selected.reply ? (
                      <div>
                        <p className="font-headline font-black uppercase text-xs opacity-50 mb-2">
                          Store reply · {selected.repliedAt ? timeAgo(selected.repliedAt) : ''}
                        </p>
                        <div className="border-2 border-[#1a1a1a] p-4 bg-[#ffcc00]">
                          <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">{selected.reply}</p>
                        </div>
                      </div>
                    ) : (
                      <div className="border-2 border-dashed border-[#1a1a1a]/30 p-6 text-center">
                        <p className="font-headline font-bold uppercase text-sm opacity-40">Awaiting reply from the store</p>
                        <p className="font-body text-xs opacity-30 mt-1">We typically respond within 24 hours</p>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="border-4 border-dashed border-[#1a1a1a]/20 p-16 text-center">
                  <p className="font-headline font-bold uppercase opacity-30">Select a message to view the conversation</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </StorefrontLayout>
  )
}
