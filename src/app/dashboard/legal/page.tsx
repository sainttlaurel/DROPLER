'use client'

import { useState, useEffect } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'
import { toast } from 'sonner'

const DEFAULT_PRIVACY = `# Privacy Policy

Effective Date: January 1, 2024

## 1. Introduction
Welcome to Dropler. We respect your privacy and are committed to protecting your personal data.

## 2. Data We Collect
We may collect, use, store and transfer different kinds of personal data about you:
- **Identity Data** includes first name, last name, username or similar identifier.
- **Contact Data** includes billing address, delivery address, email address and telephone numbers.
- **Technical Data** includes internet protocol (IP) address, your login data, browser type and version.

## 3. How We Use Your Data
We will only use your personal data when the law allows us to. Most commonly, we will use your personal data in the following circumstances:
1. Where we need to perform the contract we are about to enter into or have entered into with you.
2. Where it is necessary for our legitimate interests.

## 4. Contact Us
If you have questions about this Privacy Policy, please contact us through our support page.`

const DEFAULT_TERMS = `# Terms of Service

Effective Date: January 1, 2024

## 1. Acceptance of Terms
By accessing and using this store, you accept and agree to be bound by these Terms of Service.

## 2. Use of Service
You agree to use our service only for lawful purposes and in accordance with these Terms.

## 3. Orders and Payment
- All orders are subject to acceptance and availability
- Prices are subject to change without notice
- Payment must be received before order processing

## 4. Shipping and Delivery
- Shipping times are estimates and not guaranteed
- Risk of loss passes to you upon delivery

## 5. Contact Us
If you have questions about these Terms, please contact us through our support page.`

export default function LegalPagesEditor() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [activeTab, setActiveTab] = useState<'privacy' | 'terms'>('privacy')
  const [storeSlug, setStoreSlug] = useState('')
  const [formData, setFormData] = useState({ privacyPolicy: DEFAULT_PRIVACY, termsOfService: DEFAULT_TERMS })

  useEffect(() => { fetchLegalPages() }, [])

  const fetchLegalPages = async () => {
    try {
      const res = await fetch('/api/legal')
      const data = await res.json()
      if (data.privacyPolicy || data.termsOfService) {
        setFormData({
          privacyPolicy: data.privacyPolicy || DEFAULT_PRIVACY,
          termsOfService: data.termsOfService || DEFAULT_TERMS,
        })
      }
      if (data.storeSlug) setStoreSlug(data.storeSlug)
    } catch (error) {
      console.error('Failed to fetch legal pages:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const res = await fetch('/api/legal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      if (res.ok) {
        toast.success('Legal pages updated successfully!')
      } else {
        toast.error('Failed to update legal pages')
      }
    } catch { toast.error('Something went wrong') }
    finally { setIsSaving(false) }
  }

  const handlePreview = () => {
    const page = activeTab === 'privacy' ? 'privacy' : 'terms'
    if (storeSlug) window.open(`/store/${storeSlug}/${page}`, '_blank')
  }

  const currentContent = activeTab === 'privacy' ? formData.privacyPolicy : formData.termsOfService
  const setCurrentContent = (val: string) => setFormData({ ...formData, [activeTab === 'privacy' ? 'privacyPolicy' : 'termsOfService']: val })

  // Simple markdown to HTML preview
  const renderPreview = (md: string) => {
    return md
      .replace(/^# (.+)$/gm, '<h1 class="font-headline font-black text-3xl border-b-4 border-[#1a1a1a] pb-4 mb-6 mt-8">$1</h1>')
      .replace(/^## (.+)$/gm, '<h2 class="font-headline font-bold text-xl mt-6 mb-3">$1</h2>')
      .replace(/^### (.+)$/gm, '<h3 class="font-headline font-bold text-lg mt-4 mb-2">$1</h3>')
      .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.+?)\*/g, '<em>$1</em>')
      .replace(/^- (.+)$/gm, '<li class="flex gap-3 mb-2"><span class="font-black">■</span><span>$1</span></li>')
      .replace(/^\d+\. (.+)$/gm, '<li class="mb-2 ml-4">$1</li>')
      .replace(/\n\n/g, '</p><p class="mb-4 leading-relaxed">')
      .replace(/^(?!<[h|l])/gm, '')
  }

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Icon name="refresh" size="xl" className="animate-spin" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Header + Tabs */}
      <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
        <div className="space-y-2">
          <h1 className="text-6xl font-headline font-black uppercase tracking-tighter leading-none">Policy Manager</h1>
          <p className="text-[#4a4a4a] font-medium">Platform compliance and legal disclosure editor.</p>
        </div>
        <div className="flex border-4 border-[#1a1a1a] bg-[#f2ede5] p-1">
          <button
            onClick={() => setActiveTab('privacy')}
            className={`px-8 py-3 font-headline font-bold uppercase transition-colors ${activeTab === 'privacy' ? 'bg-[#ffcc00] text-[#1a1a1a] border-2 border-[#1a1a1a]' : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'}`}
          >
            Privacy Policy
          </button>
          <button
            onClick={() => setActiveTab('terms')}
            className={`px-8 py-3 font-headline font-bold uppercase transition-colors ${activeTab === 'terms' ? 'bg-[#ffcc00] text-[#1a1a1a] border-2 border-[#1a1a1a]' : 'text-[#1a1a1a]/60 hover:text-[#1a1a1a]'}`}
          >
            Terms of Service
          </button>
        </div>
      </div>

      {/* Editor + Preview Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-0">
        {/* Left: Markdown Editor */}
        <div className="flex flex-col border-4 border-[#1a1a1a] bg-white shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
          {/* Toolbar */}
          <div className="bg-[#e2ddd4] border-b-4 border-[#1a1a1a] p-4 flex flex-wrap gap-2">
            {[
              { icon: 'format_bold', title: 'Bold' },
              { icon: 'format_italic', title: 'Italic' },
              { icon: 'link', title: 'Link' },
              { icon: 'image', title: 'Image' },
              { icon: 'title', title: 'Heading' },
              { icon: 'format_list_bulleted', title: 'List' },
            ].map(({ icon, title }) => (
              <button key={icon} title={title} className="p-2 border-2 border-[#1a1a1a] bg-white hover:bg-[#ffcc00] transition-all">
                <Icon name={icon} size="sm" />
              </button>
            ))}
            <div className="flex-grow"></div>
            <div className="flex items-center gap-2 px-3 font-headline font-bold text-xs">
              <span className="w-2 h-2 bg-[#e63b2e] rounded-full"></span>
              AUTOSAVE ENABLED
            </div>
          </div>
          {/* Text Area */}
          <textarea
            value={currentContent}
            onChange={(e) => setCurrentContent(e.target.value)}
            className="flex-grow p-8 font-mono text-sm leading-relaxed focus:outline-none resize-none bg-white min-h-[500px]"
            placeholder="Start typing your legal document here using Markdown..."
          />
        </div>

        {/* Right: Live Preview */}
        <div className="flex flex-col border-4 border-[#1a1a1a] bg-[#f2ede5] shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
          <div className="bg-[#1a1a1a] text-white p-4 font-headline font-bold uppercase tracking-widest flex items-center gap-2">
            <Icon name="visibility" size="sm" />
            Live Preview (Desktop View)
          </div>
          <div className="flex-grow p-10 overflow-y-auto bg-white min-h-[500px]">
            <div
              className="prose prose-stone max-w-none"
              dangerouslySetInnerHTML={{ __html: renderPreview(currentContent) }}
            />
          </div>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex flex-col md:flex-row justify-between items-center bg-[#1a1a1a] p-6 gap-6 mt-0 border-4 border-[#1a1a1a] border-t-0">
        <div className="flex items-center gap-6 text-[#f5f0e8]">
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Last Edited</span>
            <span className="font-headline font-bold">{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase()}</span>
          </div>
          <div className="h-10 w-px bg-white/20"></div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-bold tracking-widest opacity-60">Author</span>
            <span className="font-headline font-bold">SYSTEM_ADMIN</span>
          </div>
          {storeSlug && (
            <button onClick={handlePreview} className="flex items-center gap-2 text-[#ffcc00] font-headline font-bold uppercase text-sm hover:underline">
              <Icon name="open_in_new" size="sm" /> Preview Live
            </button>
          )}
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setCurrentContent(activeTab === 'privacy' ? DEFAULT_PRIVACY : DEFAULT_TERMS)}
            className="bg-transparent border-2 border-[#f5f0e8] text-[#f5f0e8] px-10 py-4 font-headline font-bold uppercase hover:bg-[#f5f0e8] hover:text-[#1a1a1a] transition-all"
          >
            Discard
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-[#ffcc00] border-2 border-[#1a1a1a] text-[#1a1a1a] px-16 py-4 font-headline font-bold uppercase hover:translate-x-1 hover:translate-y-1 shadow-[4px_4px_0px_0px_rgba(245,240,232,1)] transition-all disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </DashboardLayout>
  )
}
