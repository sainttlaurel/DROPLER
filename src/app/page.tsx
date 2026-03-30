import Link from 'next/link'
import { TopNav } from '@/components/layout/TopNav'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f5f0e8]">
      <TopNav />

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center border-b-4 border-[#1a1a1a]">
        <div>
          <span className="inline-block bg-[#e63b2e] text-white font-headline font-black uppercase px-4 py-1 text-sm mb-6">
            Dropshipping Platform
          </span>
          <h1 className="font-headline font-black text-7xl md:text-8xl uppercase tracking-tighter leading-none mb-6">
            Sell.<br />Ship.<br />Scale.
          </h1>
          <p className="font-body text-xl text-[#1a1a1a]/70 mb-10 max-w-md">
            Build your dropshipping store in minutes. Manage products, orders, and customers from one dashboard.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link href="/auth/register">
              <button className="px-8 py-4 bg-[#ffcc00] border-4 border-[#1a1a1a] font-headline font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                Start Free
              </button>
            </Link>
            <Link href="/auth/login">
              <button className="px-8 py-4 bg-white border-4 border-[#1a1a1a] font-headline font-black uppercase text-lg shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                Log In
              </button>
            </Link>
          </div>
        </div>
        <div className="hidden lg:flex items-center justify-center">
          <div className="w-full aspect-square max-w-md bg-[#1a1a1a] border-4 border-[#1a1a1a] shadow-[12px_12px_0px_0px_rgba(26,26,26,1)] flex items-center justify-center">
            <span className="font-headline font-black text-[#ffcc00] text-9xl uppercase">D</span>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-24 border-b-4 border-[#1a1a1a]">
        <h2 className="font-headline font-black text-6xl uppercase tracking-tighter mb-16">Features</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { title: 'Product Management', desc: 'Import, edit, and manage your entire catalog with bulk actions and category organization.', icon: '📦' },
            { title: 'Order Tracking', desc: 'Real-time order management with status updates, tracking numbers, and customer notifications.', icon: '🚚' },
            { title: 'Analytics', desc: 'Live revenue, profit, and sales velocity data. No fake numbers — all from your real orders.', icon: '📊' },
            { title: 'Storefront', desc: 'A fully branded customer-facing store with cart, checkout, and account management.', icon: '🛍️' },
            { title: 'Customer Accounts', desc: 'Customers can register, track orders, and message your support team directly.', icon: '👤' },
            { title: 'Support Inbox', desc: 'Built-in support ticket system. Customers send messages, you reply from the dashboard.', icon: '💬' },
          ].map((f) => (
            <div key={f.title} className="border-4 border-[#1a1a1a] bg-white p-8 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <div className="text-4xl mb-4">{f.icon}</div>
              <h3 className="font-headline font-black uppercase text-xl mb-3">{f.title}</h3>
              <p className="font-body text-[#1a1a1a]/70">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-24 border-b-4 border-[#1a1a1a]">
        <h2 className="font-headline font-black text-6xl uppercase tracking-tighter mb-4">Pricing</h2>
        <p className="font-body text-xl text-[#1a1a1a]/70 mb-16">Simple. No hidden fees.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl">
          {[
            { plan: 'Free', price: '$0', desc: 'Get started with the basics.', features: ['1 store', 'Up to 50 products', 'Order management', 'Basic analytics'], cta: 'Start Free', highlight: false },
            { plan: 'Pro', price: '$29/mo', desc: 'Everything you need to scale.', features: ['Unlimited products', 'Advanced analytics', 'Priority support', 'Custom domain'], cta: 'Get Pro', highlight: true },
          ].map((p) => (
            <div key={p.plan} className={`border-4 border-[#1a1a1a] p-8 shadow-[6px_6px_0px_0px_rgba(26,26,26,1)] ${p.highlight ? 'bg-[#ffcc00]' : 'bg-white'}`}>
              <h3 className="font-headline font-black uppercase text-3xl mb-1">{p.plan}</h3>
              <div className="font-headline font-black text-5xl mb-2">{p.price}</div>
              <p className="font-body text-[#1a1a1a]/70 mb-6">{p.desc}</p>
              <ul className="space-y-2 mb-8">
                {p.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 font-body font-semibold">
                    <span className="text-[#1a1a1a]">✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link href="/auth/register">
                <button className="w-full py-3 border-4 border-[#1a1a1a] font-headline font-black uppercase bg-[#1a1a1a] text-white hover:bg-[#0055ff] transition-colors">
                  {p.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-6 py-12 flex flex-col md:flex-row justify-between items-center gap-4">
        <span className="font-headline font-black uppercase text-2xl tracking-tighter">Dropler</span>
        <p className="font-body text-sm text-[#1a1a1a]/50">© {new Date().getFullYear()} Dropler. All rights reserved.</p>
        <div className="flex gap-6 font-headline font-bold uppercase text-sm">
          <Link href="/auth/login" className="hover:text-[#0055ff] transition-colors">Login</Link>
          <Link href="/auth/register" className="hover:text-[#0055ff] transition-colors">Register</Link>
        </div>
      </footer>
    </main>
  )
}
