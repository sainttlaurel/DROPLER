'use client'

import { useState, useEffect } from 'react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Icon } from '@/components/ui/Icon'
import Link from 'next/link'

type Section = 'hero' | 'trust' | 'seo' | 'stats' | 'ui'

export default function AppearancePage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeSection, setActiveSection] = useState<Section>('hero')
  const [storeSlug, setStoreSlug] = useState<string | null>(null)

  // Hero Section
  const [heroHeadline, setHeroHeadline] = useState('')
  const [heroSubheadline, setHeroSubheadline] = useState('')
  const [heroDescription, setHeroDescription] = useState('')
  const [heroCta1Text, setHeroCta1Text] = useState('')
  const [heroCta2Text, setHeroCta2Text] = useState('')
  const [announcementText, setAnnouncementText] = useState('')
  const [announcementEnabled, setAnnouncementEnabled] = useState(true)

  // Trust Badges
  const [trustBadge1Title, setTrustBadge1Title] = useState('')
  const [trustBadge1Desc, setTrustBadge1Desc] = useState('')
  const [trustBadge2Title, setTrustBadge2Title] = useState('')
  const [trustBadge2Desc, setTrustBadge2Desc] = useState('')
  const [trustBadge3Title, setTrustBadge3Title] = useState('')
  const [trustBadge3Desc, setTrustBadge3Desc] = useState('')

  // SEO
  const [metaTitle, setMetaTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [ogImageUrl, setOgImageUrl] = useState('')

  // Stats
  const [stat1Label, setStat1Label] = useState('')
  const [stat1Value, setStat1Value] = useState('')
  const [stat2Label, setStat2Label] = useState('')
  const [stat2Value, setStat2Value] = useState('')

  // UI
  const [searchPlaceholder, setSearchPlaceholder] = useState('Search products...')

  useEffect(() => {
    fetchAppearance()
    fetch('/api/settings')
      .then(r => r.json())
      .then(d => { if (d?.store?.slug) setStoreSlug(d.store.slug) })
      .catch(() => {})
  }, [])

  const fetchAppearance = async () => {
    try {
      const res = await fetch('/api/appearance')
      const data = await res.json()
      if (data.theme) {
        const t = data.theme
        setHeroHeadline(t.heroHeadline || '')
        setHeroSubheadline(t.heroSubheadline || '')
        setHeroDescription(t.heroDescription || '')
        setHeroCta1Text(t.heroCta1Text || '')
        setHeroCta2Text(t.heroCta2Text || '')
        setAnnouncementText(t.announcementText || '')
        setAnnouncementEnabled(t.announcementEnabled ?? true)
        setTrustBadge1Title(t.trustBadge1Title || '')
        setTrustBadge1Desc(t.trustBadge1Desc || '')
        setTrustBadge2Title(t.trustBadge2Title || '')
        setTrustBadge2Desc(t.trustBadge2Desc || '')
        setTrustBadge3Title(t.trustBadge3Title || '')
        setTrustBadge3Desc(t.trustBadge3Desc || '')
        setSearchPlaceholder(t.searchPlaceholder || 'Search products...')
        setMetaTitle(t.metaTitle || '')
        setMetaDescription(t.metaDescription || '')
        setOgImageUrl(t.ogImageUrl || '')
        setStat1Label(t.stat1Label || '')
        setStat1Value(t.stat1Value || '')
        setStat2Label(t.stat2Label || '')
        setStat2Value(t.stat2Value || '')
      }
    } catch { toast.error('Failed to load appearance settings') }
    finally { setLoading(false) }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const res = await fetch('/api/appearance', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          heroHeadline, heroSubheadline, heroDescription, heroCta1Text, heroCta2Text,
          announcementText, announcementEnabled,
          trustBadge1Title, trustBadge1Desc, trustBadge2Title, trustBadge2Desc, trustBadge3Title, trustBadge3Desc,
          searchPlaceholder, metaTitle, metaDescription,
          ...(ogImageUrl ? { ogImageUrl } : {}),
          stat1Label, stat1Value, stat2Label, stat2Value,
        }),
      })
      if (res.ok) {
        toast.success('Appearance saved and published!')
      } else {
        const error = await res.json()
        toast.error(error.details?.[0]?.message || 'Failed to save settings')
      }
    } catch { toast.error('Failed to save settings') }
    finally { setSaving(false) }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <Icon name="refresh" size="xl" className="animate-spin text-[#1a1a1a] mb-4" />
            <p className="font-headline font-bold uppercase text-lg">Loading Editor...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const inputClass = "w-full bg-white border-2 border-[#1a1a1a] p-3 font-body text-sm focus:bg-[#fffbe6] focus:outline-none transition-colors"
  const labelClass = "block font-headline font-bold uppercase text-xs mb-1 tracking-tight"

  const navItems: { id: Section; label: string; icon: string }[] = [
    { id: 'hero', label: 'Hero', icon: 'web' },
    { id: 'trust', label: 'Trust Badges', icon: 'verified' },
    { id: 'stats', label: 'Stats Bar', icon: 'bar_chart' },
    { id: 'seo', label: 'SEO', icon: 'search' },
    { id: 'ui', label: 'UI', icon: 'tune' },
  ]

  return (
    <DashboardLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4 border-b-8 border-[#1a1a1a] pb-6">
        <div>
          <h1 className="text-7xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-2 font-headline">
            Appearance
          </h1>
          <p className="font-bold text-xl border-l-8 border-[#ffcc00] pl-4 uppercase">
            Customize your storefront content.
          </p>
        </div>
        <div className="flex gap-3">
          {storeSlug && (
            <Link href={`/stores/${storeSlug}`} target="_blank">
              <button className="flex items-center gap-2 px-5 py-3 border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[4px_4px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none text-sm">
                <Icon name="open_in_new" size="sm" />
                Live Preview
              </button>
            </Link>
          )}
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-3 bg-[#ffcc00] border-4 border-[#1a1a1a] font-headline font-black uppercase shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:bg-[#1a1a1a] hover:text-white transition-all active:translate-x-1 active:translate-y-1 active:shadow-none disabled:opacity-50"
          >
            <Icon name="publish" size="sm" />
            {saving ? 'Saving...' : 'Publish'}
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left Panel: Editor */}
        <div className="w-full lg:w-[380px] shrink-0 flex flex-col gap-0 border-4 border-[#1a1a1a] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden">
          {/* Section Nav */}
          <div className="flex border-b-4 border-[#1a1a1a] bg-[#eee9e0] overflow-x-auto">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 px-2 font-headline font-black uppercase text-[10px] tracking-tight border-r-2 border-[#1a1a1a] last:border-r-0 transition-colors whitespace-nowrap ${
                  activeSection === item.id ? 'bg-[#ffcc00]' : 'hover:bg-white'
                }`}
              >
                <Icon name={item.icon} size="sm" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Section Content */}
          <div className="flex-1 p-6 bg-[#f5f0e8] space-y-5 overflow-y-auto max-h-[calc(100vh-320px)]">

            {activeSection === 'hero' && (
              <>
                <div>
                  <label className={labelClass}>Announcement Bar Text</label>
                  <input type="text" value={announcementText} onChange={(e) => setAnnouncementText(e.target.value)} placeholder="New arrivals now available" maxLength={100} className={inputClass} />
                  <div className="mt-2 flex items-center gap-3 cursor-pointer" onClick={() => setAnnouncementEnabled(!announcementEnabled)}>
                    <div className={`w-12 h-6 border-2 border-[#1a1a1a] relative transition-colors ${announcementEnabled ? 'bg-[#ffcc00]' : 'bg-[#ddd]'}`}>
                      <div className={`absolute top-[3px] w-3 h-3 bg-[#1a1a1a] transition-all ${announcementEnabled ? 'right-[3px]' : 'left-[3px]'}`} />
                    </div>
                    <span className="text-xs font-headline font-bold uppercase">Show Announcement Bar</span>
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Main Headline</label>
                  <input type="text" value={heroHeadline} onChange={(e) => setHeroHeadline(e.target.value)} placeholder="Welcome to your store" maxLength={80} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Subheadline</label>
                  <input type="text" value={heroSubheadline} onChange={(e) => setHeroSubheadline(e.target.value)} placeholder="Discover quality products" maxLength={100} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Description</label>
                  <textarea value={heroDescription} onChange={(e) => setHeroDescription(e.target.value)} placeholder="Find everything you need in one place..." rows={3} maxLength={200} className={`${inputClass} resize-none`} />
                  <p className="text-[10px] opacity-50 mt-1 font-bold uppercase">{heroDescription.length}/200</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Primary CTA</label>
                    <input type="text" value={heroCta1Text} onChange={(e) => setHeroCta1Text(e.target.value)} placeholder="Shop Now" maxLength={30} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Secondary CTA</label>
                    <input type="text" value={heroCta2Text} onChange={(e) => setHeroCta2Text(e.target.value)} placeholder="View Collections" maxLength={30} className={inputClass} />
                  </div>
                </div>
              </>
            )}

            {activeSection === 'trust' && (
              <>
                {[
                  { num: 1, title: trustBadge1Title, setTitle: setTrustBadge1Title, desc: trustBadge1Desc, setDesc: setTrustBadge1Desc },
                  { num: 2, title: trustBadge2Title, setTitle: setTrustBadge2Title, desc: trustBadge2Desc, setDesc: setTrustBadge2Desc },
                  { num: 3, title: trustBadge3Title, setTitle: setTrustBadge3Title, desc: trustBadge3Desc, setDesc: setTrustBadge3Desc },
                ].map(({ num, title, setTitle, desc, setDesc }) => (
                  <div key={num} className="border-2 border-[#1a1a1a] p-4 bg-white">
                    <p className="font-headline font-black uppercase text-xs mb-3 border-b-2 border-[#1a1a1a] pb-2">Badge {num}</p>
                    <div className="space-y-2">
                      <div>
                        <label className={labelClass}>Title</label>
                        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Badge Title" maxLength={50} className={inputClass} />
                      </div>
                      <div>
                        <label className={labelClass}>Description</label>
                        <textarea value={desc} onChange={(e) => setDesc(e.target.value)} placeholder="Badge description" rows={2} maxLength={150} className={`${inputClass} resize-none`} />
                      </div>
                    </div>
                  </div>
                ))}
              </>
            )}

            {activeSection === 'stats' && (
              <>
                <p className="text-xs font-headline font-bold uppercase opacity-60">Displayed as a stats bar on your storefront.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className={labelClass}>Stat 1 Value</label>
                    <input type="text" value={stat1Value} onChange={(e) => setStat1Value(e.target.value)} placeholder="12.5K+" maxLength={20} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Stat 1 Label</label>
                    <input type="text" value={stat1Label} onChange={(e) => setStat1Label(e.target.value)} placeholder="Happy Customers" maxLength={30} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Stat 2 Value</label>
                    <input type="text" value={stat2Value} onChange={(e) => setStat2Value(e.target.value)} placeholder="50K+" maxLength={20} className={inputClass} />
                  </div>
                  <div>
                    <label className={labelClass}>Stat 2 Label</label>
                    <input type="text" value={stat2Label} onChange={(e) => setStat2Label(e.target.value)} placeholder="Products Sold" maxLength={30} className={inputClass} />
                  </div>
                </div>
              </>
            )}

            {activeSection === 'seo' && (
              <>
                <div>
                  <label className={labelClass}>Meta Title <span className="opacity-50">({metaTitle.length}/60)</span></label>
                  <input type="text" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} placeholder="Your Store - Quality Products" maxLength={60} className={inputClass} />
                </div>
                <div>
                  <label className={labelClass}>Meta Description <span className="opacity-50">({metaDescription.length}/160)</span></label>
                  <textarea value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} placeholder="Discover quality products..." rows={3} maxLength={160} className={`${inputClass} resize-none`} />
                </div>
                <div>
                  <label className={labelClass}>Social Share Image URL</label>
                  <input type="url" value={ogImageUrl} onChange={(e) => setOgImageUrl(e.target.value)} placeholder="https://example.com/image.jpg" className={inputClass} />
                </div>
              </>
            )}

            {activeSection === 'ui' && (
              <div>
                <label className={labelClass}>Search Placeholder Text</label>
                <input type="text" value={searchPlaceholder} onChange={(e) => setSearchPlaceholder(e.target.value)} placeholder="Search products..." maxLength={50} className={inputClass} />
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="p-4 border-t-4 border-[#1a1a1a] bg-[#eee9e0]">
            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full bg-[#1a1a1a] text-white py-3 border-2 border-[#1a1a1a] font-headline font-black uppercase hover:bg-[#0055ff] transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Right Panel: Live Preview */}
        <div className="flex-1 border-4 border-[#1a1a1a] shadow-[8px_8px_0px_0px_rgba(26,26,26,1)] overflow-hidden flex flex-col bg-[#e8e3da]">
          {/* Preview Toolbar */}
          <div className="flex justify-between items-center px-4 py-3 border-b-4 border-[#1a1a1a] bg-[#eee9e0]">
            <div className="flex gap-2">
              <button className="p-2 border-2 border-[#1a1a1a] bg-[#ffcc00] shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                <Icon name="desktop_windows" size="sm" />
              </button>
              <button className="p-2 border-2 border-[#1a1a1a] bg-white hover:bg-[#ffcc00] transition-colors">
                <Icon name="smartphone" size="sm" />
              </button>
            </div>
            <div className="flex items-center gap-2 bg-white px-3 py-1 border-2 border-[#1a1a1a] text-xs font-headline font-bold uppercase">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              Live Preview
            </div>
            {storeSlug && (
              <Link href={`/stores/${storeSlug}`} target="_blank">
                <button className="flex items-center gap-1 px-3 py-1 border-2 border-[#1a1a1a] font-headline font-black uppercase text-xs hover:bg-[#ffcc00] transition-colors">
                  <Icon name="open_in_new" size="sm" />
                  Open Store
                </button>
              </Link>
            )}
          </div>

          {/* Preview Canvas */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="w-full bg-white border-4 border-[#1a1a1a] overflow-hidden">

              {/* Store Nav */}
              <div className="flex justify-between items-center px-4 py-3 border-b-2 border-[#1a1a1a] bg-white">
                <span className="font-headline font-black text-lg tracking-tighter">DROPLER.</span>
                <div className="flex gap-4 font-headline font-bold text-xs uppercase">
                  <span>Shop</span><span>About</span><span>Archive</span>
                </div>
                <div className="flex gap-2">
                  <Icon name="search" size="sm" />
                  <Icon name="shopping_bag" size="sm" />
                </div>
              </div>

              {/* Announcement Bar */}
              {announcementEnabled && announcementText && (
                <div className="bg-[#ffcc00] border-b-2 border-[#1a1a1a] py-2 px-4 text-center">
                  <span className="font-headline font-black text-xs uppercase">{announcementText}</span>
                </div>
              )}

              {/* Hero */}
              <div className="grid grid-cols-2 border-b-2 border-[#1a1a1a]" style={{ minHeight: 240 }}>
                <div className="p-6 flex flex-col justify-center gap-3 border-r-2 border-[#1a1a1a]">
                  <h1 className="text-3xl font-headline font-black leading-none tracking-tighter uppercase">
                    {heroHeadline || 'YOUR HEADLINE'}
                  </h1>
                  <p className="text-sm font-headline font-bold uppercase opacity-70">
                    {heroSubheadline || 'Your subheadline here'}
                  </p>
                  <p className="text-xs text-[#4a4a4a] leading-relaxed">
                    {heroDescription || 'Your description text will appear here.'}
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    <button className="px-4 py-2 bg-[#1a1a1a] text-white border-2 border-[#1a1a1a] font-headline font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                      {heroCta1Text || 'Shop Now'}
                    </button>
                    {heroCta2Text && (
                      <button className="px-4 py-2 bg-white border-2 border-[#1a1a1a] font-headline font-black uppercase text-xs shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]">
                        {heroCta2Text}
                      </button>
                    )}
                  </div>
                </div>
                <div className="bg-[#e2ddd4] flex items-center justify-center">
                  <div className="text-center opacity-30">
                    <Icon name="image" className="text-5xl" />
                    <p className="font-headline font-bold uppercase text-xs mt-1">Hero Image</p>
                  </div>
                </div>
              </div>

              {/* Trust Badges */}
              {(trustBadge1Title || trustBadge2Title || trustBadge3Title) && (
                <div className="grid grid-cols-3 border-b-2 border-[#1a1a1a]">
                  {[
                    { title: trustBadge1Title, desc: trustBadge1Desc },
                    { title: trustBadge2Title, desc: trustBadge2Desc },
                    { title: trustBadge3Title, desc: trustBadge3Desc },
                  ].map((badge, i) => (
                    <div key={i} className={`p-4 text-center ${i < 2 ? 'border-r-2 border-[#1a1a1a]' : ''}`}>
                      <p className="font-headline font-black uppercase text-xs mb-1">{badge.title || `Badge ${i + 1}`}</p>
                      <p className="text-[10px] opacity-60 leading-tight">{badge.desc}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Stats Bar */}
              {(stat1Value || stat2Value) && (
                <div className="flex border-b-2 border-[#1a1a1a] bg-[#1a1a1a] text-white">
                  {stat1Value && (
                    <div className="flex-1 p-4 text-center border-r-2 border-white/20">
                      <p className="font-headline font-black text-xl">{stat1Value}</p>
                      <p className="font-headline font-bold uppercase text-[10px] opacity-60">{stat1Label}</p>
                    </div>
                  )}
                  {stat2Value && (
                    <div className="flex-1 p-4 text-center">
                      <p className="font-headline font-black text-xl">{stat2Value}</p>
                      <p className="font-headline font-bold uppercase text-[10px] opacity-60">{stat2Label}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Bento Grid */}
              <div className="grid grid-cols-3 gap-3 p-4 bg-[#f5f0e8]">
                <div className="aspect-square bg-[#ffcc00] border-4 border-[#1a1a1a] p-3 flex flex-col justify-end">
                  <h3 className="font-headline font-black text-sm uppercase leading-tight">Limited Edition</h3>
                  <Icon name="arrow_forward" size="sm" className="mt-1" />
                </div>
                <div className="col-span-2 bg-[#1a1a1a] text-white border-4 border-[#1a1a1a] p-4 flex justify-between items-center">
                  <div>
                    <h3 className="font-headline font-black text-lg uppercase leading-none">New Archive<br />Discovery</h3>
                    <p className="text-white/60 mt-1 text-[10px]">Explore the forgotten pieces</p>
                  </div>
                  <div className="w-12 h-12 bg-[#0055ff] rotate-12 flex items-center justify-center border-2 border-white">
                    <Icon name="star" className="text-white text-xl" />
                  </div>
                </div>
              </div>

              {/* SEO Preview */}
              {(metaTitle || metaDescription) && (
                <div className="p-4 border-t-2 border-[#1a1a1a] bg-[#eee9e0]">
                  <p className="font-headline font-black uppercase text-[10px] mb-2 opacity-50">SEO Preview</p>
                  <div className="bg-white border-2 border-[#1a1a1a] p-3">
                    <p className="text-[#0055ff] font-bold text-sm truncate">{metaTitle || 'Page Title'}</p>
                    <p className="text-xs text-[#4a4a4a] mt-1 line-clamp-2">{metaDescription || 'Meta description...'}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
