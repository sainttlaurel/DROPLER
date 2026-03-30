'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'
import { toast } from 'sonner'

interface SupportMessage {
  id: string
  name: string
  email: string
  subject: string
  message: string
  status: 'UNREAD' | 'READ' | 'RESOLVED'
  reply?: string | null
  repliedAt?: string | null
  createdAt: string
}

const getStatusBadge = (status: string) => {
  if (status === 'UNREAD') return 'bg-[#0055ff] text-white'
  if (status === 'RESOLVED') return 'bg-green-600 text-white'
  return 'bg-[#1a1a1a] text-white'
}

const getTimeAgo = (date: string) => {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
  return `${Math.floor(seconds / 86400)}d ago`
}

export default function SupportPage() {
  const [messages, setMessages] = useState<SupportMessage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'UNREAD' | 'READ' | 'RESOLVED'>('ALL')
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null)
  const [replyText, setReplyText] = useState('')
  const [isSendingReply, setIsSendingReply] = useState(false)

  useEffect(() => { fetchMessages() }, [])

  const fetchMessages = async () => {
    try {
      const res = await fetch('/api/support')
      const data = await res.json()
      setMessages(data)
    } catch { toast.error('Failed to load support messages') }
    finally { setIsLoading(false) }
  }

  const updateStatus = async (id: string, status: 'READ' | 'RESOLVED') => {
    try {
      const res = await fetch(`/api/support/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (res.ok) {
        setMessages(prev => prev.map(msg => msg.id === id ? { ...msg, status } : msg))
        if (selectedMessage?.id === id) setSelectedMessage(prev => prev ? { ...prev, status } : null)
        toast.success(`Message marked as ${status.toLowerCase()}`)
      }
    } catch { toast.error('Failed to update status') }
  }

  const sendReply = async () => {
    if (!selectedMessage || !replyText.trim()) return
    setIsSendingReply(true)
    try {
      const res = await fetch(`/api/support/${selectedMessage.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reply: replyText, status: 'RESOLVED' }),
      })
      if (res.ok) {
        const updated = await res.json()
        setMessages(prev => prev.map(msg => msg.id === selectedMessage.id ? updated : msg))
        setSelectedMessage(updated)
        setReplyText('')
        toast.success('Reply sent!')
      }
    } catch { toast.error('Failed to send reply') }
    finally { setIsSendingReply(false) }
  }

  const filteredMessages = messages.filter(msg => filter === 'ALL' || msg.status === filter)
  const unreadCount = messages.filter(m => m.status === 'UNREAD').length

  return (
    <DashboardLayout>
      <div className="flex flex-col lg:flex-row gap-0 border-4 border-[#1a1a1a] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] min-h-[80vh]">
        {/* Inbox List */}
        <section className="w-full lg:w-1/3 border-b-4 lg:border-b-0 lg:border-r-4 border-[#1a1a1a] flex flex-col bg-[#f2ede5]">
          {/* Inbox Header */}
          <div className="p-4 border-b-4 border-[#1a1a1a] bg-[#ffcc00] flex justify-between items-center">
            <span className="font-headline font-black text-lg uppercase">INBOX ({messages.length})</span>
            <div className="flex gap-1">
              {(['ALL', 'UNREAD', 'READ', 'RESOLVED'] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-2 py-1 text-[10px] font-headline font-black uppercase border border-[#1a1a1a] transition-colors ${filter === s ? 'bg-[#1a1a1a] text-white' : 'bg-white hover:bg-[#eee9e0]'}`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {/* Message List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Icon name="refresh" size="xl" className="animate-spin" />
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="p-12 text-center">
                <Icon name="mail" className="text-4xl opacity-20 mb-4" />
                <p className="font-headline font-bold uppercase opacity-40">No messages found</p>
              </div>
            ) : (
              filteredMessages.map((msg) => (
                <button
                  key={msg.id}
                  onClick={() => {
                    setSelectedMessage(msg)
                    if (msg.status === 'UNREAD') updateStatus(msg.id, 'READ')
                  }}
                  className={`w-full p-5 border-b-2 border-[#1a1a1a] text-left transition-colors relative ${
                    selectedMessage?.id === msg.id
                      ? 'bg-[#ffcc00] shadow-[inset_4px_4px_0px_0px_rgba(26,26,26,0.1)]'
                      : msg.status === 'UNREAD'
                      ? 'bg-white hover:bg-stone-50'
                      : 'bg-[#f5f0e8] opacity-70 hover:opacity-100'
                  }`}
                >
                  {msg.status === 'UNREAD' && (
                    <div className="absolute right-4 top-4 w-3 h-3 bg-[#e63b2e] border border-[#1a1a1a]"></div>
                  )}
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`font-headline font-black text-[10px] px-2 py-0.5 ${getStatusBadge(msg.status)}`}>{msg.status}</span>
                    <span className="font-body text-[10px] font-bold text-gray-500 uppercase">{getTimeAgo(msg.createdAt)}</span>
                  </div>
                  <h4 className="font-headline font-bold text-base leading-tight mb-1 uppercase">{msg.subject}</h4>
                  <p className="font-body text-sm text-gray-600 line-clamp-2 mb-2">{msg.message}</p>
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 bg-[#eee9e0] border border-[#1a1a1a] flex items-center justify-center text-[10px] font-headline font-black">
                      {msg.name.slice(0, 2).toUpperCase()}
                    </div>
                    <span className="font-headline font-bold text-xs uppercase">{msg.name}</span>
                  </div>
                </button>
              ))
            )}
          </div>
        </section>

        {/* Message Detail */}
        <section className="flex-1 flex flex-col bg-white overflow-hidden">
          {selectedMessage ? (
            <>
              {/* Message Header */}
              <div className="p-6 border-b-4 border-[#1a1a1a] flex justify-between items-start bg-white">
                <div className="flex gap-4">
                  <div className="w-16 h-16 border-4 border-[#1a1a1a] bg-[#ffcc00] flex items-center justify-center font-headline font-black text-2xl shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                    {selectedMessage.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-headline font-black text-2xl uppercase tracking-tighter">{selectedMessage.name}</h3>
                      <span className={`px-2 py-0.5 font-headline font-bold text-xs uppercase border-2 border-[#1a1a1a] ${getStatusBadge(selectedMessage.status)}`}>{selectedMessage.status}</span>
                    </div>
                    <p className="font-body font-bold text-sm">{selectedMessage.email}</p>
                    <p className="font-body text-xs text-gray-500 mt-1 uppercase tracking-wider">{new Date(selectedMessage.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  {selectedMessage.status !== 'RESOLVED' && (
                    <button onClick={() => updateStatus(selectedMessage.id, 'RESOLVED')} className="px-4 py-2 border-2 border-[#1a1a1a] bg-[#1a1a1a] text-white font-headline font-bold uppercase hover:bg-[#0055ff] transition-colors">
                      Resolve
                    </button>
                  )}
                  {selectedMessage.status === 'RESOLVED' && (
                    <button onClick={() => updateStatus(selectedMessage.id, 'READ')} className="px-4 py-2 border-2 border-[#1a1a1a] font-headline font-bold uppercase hover:bg-[#eee9e0] transition-colors">
                      Reopen
                    </button>
                  )}
                </div>
              </div>

              {/* Chat Canvas */}
              <div className="flex-1 overflow-y-auto p-8 space-y-8 bg-[#f5f0e8]/30">
                {/* Subject */}
                <div className="font-headline font-black text-xl uppercase border-b-2 border-[#1a1a1a]/20 pb-4">{selectedMessage.subject}</div>

                {/* Customer Message */}
                <div className="flex flex-col items-start max-w-2xl">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-headline font-black text-xs uppercase">{selectedMessage.name}</span>
                    <span className="font-body text-[10px] text-gray-400">{getTimeAgo(selectedMessage.createdAt)}</span>
                  </div>
                  <div className="bg-white border-2 border-[#1a1a1a] p-4 shadow-[4px_4px_0px_0px_rgba(26,26,26,1)]">
                    <p className="font-body leading-relaxed whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>

                {/* Existing Reply */}
                {selectedMessage.reply && (
                  <div className="flex flex-col items-end max-w-2xl ml-auto">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-body text-[10px] text-gray-400">{selectedMessage.repliedAt ? getTimeAgo(selectedMessage.repliedAt) : ''}</span>
                      <span className="font-headline font-black text-xs uppercase">YOU (ADMIN)</span>
                    </div>
                    <div className="bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] p-4 shadow-[4px_4px_0px_0px_rgba(0,85,255,1)]">
                      <p className="font-body leading-relaxed whitespace-pre-wrap">{selectedMessage.reply}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Reply Editor */}
              {!selectedMessage.reply && (
                <div className="p-6 border-t-4 border-[#1a1a1a] bg-white">
                  <div className="border-2 border-[#1a1a1a] flex flex-col">
                    {/* Toolbar */}
                    <div className="flex items-center gap-1 p-2 bg-stone-50 border-b-2 border-[#1a1a1a]">
                      {['format_bold', 'format_italic', 'link', 'image', 'attach_file'].map((icon) => (
                        <button key={icon} className="p-1 hover:bg-[#ffcc00] transition-colors">
                          <Icon name={icon} size="sm" />
                        </button>
                      ))}
                      <div className="ml-auto flex items-center gap-2">
                        <span className="font-headline font-bold text-[10px] uppercase">Canned Responses</span>
                        <Icon name="expand_more" size="sm" />
                      </div>
                    </div>
                    <textarea
                      value={replyText}
                      onChange={(e) => setReplyText(e.target.value)}
                      placeholder={`Type your reply to ${selectedMessage.name} here...`}
                      rows={4}
                      className="w-full p-4 font-body text-sm focus:ring-0 border-none resize-none focus:outline-none"
                    />
                    <div className="p-4 flex justify-between items-center bg-stone-50 border-t-2 border-[#1a1a1a]">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" className="w-4 h-4 border-2 border-[#1a1a1a] rounded-none focus:ring-0" />
                        <span className="font-headline font-bold text-xs uppercase">Internal Note</span>
                      </label>
                      <div className="flex gap-3">
                        <button className="px-6 py-2 border-2 border-[#1a1a1a] font-headline font-black uppercase hover:bg-[#eee9e0] transition-all flex items-center gap-2">
                          <Icon name="schedule" size="sm" /> Later
                        </button>
                        <button
                          onClick={sendReply}
                          disabled={isSendingReply || !replyText.trim()}
                          className="px-8 py-2 bg-[#ffcc00] border-2 border-[#1a1a1a] font-headline font-black uppercase shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center gap-2 disabled:opacity-50"
                        >
                          {isSendingReply ? 'Sending...' : 'Send Reply'}
                          <Icon name="send" size="sm" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-24 text-center">
              <Icon name="mail" className="text-6xl opacity-20 mb-4" />
              <p className="font-headline font-bold uppercase opacity-40 text-lg">Select a message to view details</p>
            </div>
          )}
        </section>

        {/* Metadata Panel */}
        {selectedMessage && (
          <section className="w-full lg:w-72 bg-[#eee9e0] border-t-4 lg:border-t-0 lg:border-l-4 border-[#1a1a1a] p-6 overflow-y-auto space-y-8">
            <div>
              <h5 className="font-headline font-black text-sm uppercase mb-4 tracking-tighter flex items-center gap-2">
                <Icon name="info" size="sm" /> TICKET INFO
              </h5>
              <div className="space-y-3">
                {[
                  { label: 'Status', value: selectedMessage.status },
                  { label: 'Priority', value: 'MEDIUM' },
                  { label: 'Assigned To', value: 'YOU' },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-white border-2 border-[#1a1a1a] p-3">
                    <p className="text-[10px] font-headline font-bold uppercase text-gray-500 mb-1">{label}</p>
                    <span className="font-headline font-black text-sm">{value}</span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h5 className="font-headline font-black text-sm uppercase mb-4 tracking-tighter flex items-center gap-2">
                <Icon name="category" size="sm" /> TAGS
              </h5>
              <div className="flex flex-wrap gap-2">
                {['Support', 'Customer', 'Inquiry'].map((tag) => (
                  <span key={tag} className="px-2 py-1 border-2 border-[#1a1a1a] bg-white font-headline font-bold text-[10px] uppercase">{tag}</span>
                ))}
                <button className="px-2 py-1 border-2 border-dashed border-[#1a1a1a] font-headline font-bold text-[10px] uppercase">+ Add Tag</button>
              </div>
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  )
}
