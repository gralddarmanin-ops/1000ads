'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function PricingPage() {
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      if (data.user) {
        const { data: p } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single()
        setProfile(p)
      }
      setLoading(false)
    })
  }, [])

  const isPro = profile?.role === 'pro'

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-5xl mx-auto px-4 py-14">

        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-3">
            Simple <span className="text-[#cc0000]">Pricing</span>
          </h1>
          <p className="text-gray-400 text-lg">
            Start free. Upgrade when you need more.
          </p>
        </div>

        {/* Plans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-14">

          {/* Free Plan */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-7">
            <div className="mb-6">
             
             <p className="text-4xl font-bold text-white">FREE</p>
              <p className="text-gray-600 text-sm mt-1">Forever free</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                '3 ads per month',
                '3 images per ad',
                'Basic listing visibility',
                'Contact via chat only',
                'All 30 categories',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-green-500 text-base">✓</span> {f}
                </li>
              ))}
              {[
                'Phone number visible',
                'WhatsApp button',
                'Email visible',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                  <span className="text-gray-700 text-base">✗</span> {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="w-full text-center py-3 rounded-xl text-sm text-gray-600 border border-[#2a2a2a]">
                Your current plan
              </div>
            ) : (
              <div className="w-full text-center py-3 rounded-xl text-sm text-gray-600 border border-[#2a2a2a]">
                Current plan
              </div>
            )}
          </div>

          {/* Pro Plan */}
          <div className="bg-[#141414] border-2 border-[#cc0000] rounded-2xl p-7 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2">
              <span className="bg-[#cc0000] text-white text-xs font-bold px-4 py-1 rounded-full">
                MOST POPULAR
              </span>
            </div>
            <div className="mb-6">
              <p className="text-sm font-medium text-[#cc0000] mb-1">Pro ⭐</p>
              <p className="text-4xl font-bold text-white">LKR 1000</p>
              <p className="text-gray-600 text-sm mt-1">per month</p>
            </div>
            <ul className="space-y-3 mb-8">
              {[
                '10 ads per month',
                '5 images per ad',
                'Priority listing visibility',
                'Phone number visible',
                'WhatsApp button',
                'Email visible',
                'All 30 categories',
                '50% off ad sets',
              ].map((f) => (
                <li key={f} className="flex items-center gap-3 text-sm text-gray-300">
                  <span className="text-green-500 text-base">✓</span> {f}
                </li>
              ))}
            </ul>
            {isPro ? (
              <div className="w-full text-center py-3 rounded-xl text-sm text-[#cc0000] border border-[#cc0000]">
                ✅ Active plan
              </div>
            ) : (
              <Link href="/checkout?plan=pro"
                className="block w-full text-center bg-[#cc0000] hover:bg-[#aa0000] text-white font-semibold py-3 rounded-xl text-sm transition">
                Upgrade to Pro →
              </Link>
            )}
          </div>

        </div>

        {/* Ad Sets */}
        <div className="mb-14">
          <h2 className="text-xl font-bold text-white mb-2 text-center">
            Need more ads? Buy an Ad Set
          </h2>
          <p className="text-gray-500 text-sm text-center mb-8">
            One-time purchase · Pro users get 50% off automatically
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Pack A */}
            <div className="bg-[#141414] border border-[#2a2a2a] hover:border-[#cc0000] rounded-2xl p-6 transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-white text-lg">Pack A</p>
                  <p className="text-gray-500 text-sm">3 extra ads</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {isPro ? '$2.49' : 'LKR 500'}
                  </p>
                  {isPro && (
                    <p className="text-xs text-green-500">50% Pro discount!</p>
                  )}
                  {!isPro && (
                    <p className="text-xs text-gray-600 line-through">LKR 500</p>
                  )}
                </div>
              </div>
              <Link href="/checkout?pack=3ads"
                className="block w-full text-center border border-[#cc0000] text-[#cc0000] hover:bg-[#cc0000] hover:text-white font-medium py-2.5 rounded-xl text-sm transition">
                Buy Pack A
              </Link>
            </div>

            {/* Pack B */}
            <div className="bg-[#141414] border border-[#2a2a2a] hover:border-[#cc0000] rounded-2xl p-6 transition">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-bold text-white text-lg">Pack B</p>
                  <p className="text-gray-500 text-sm">5 extra ads</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    {isPro ? '$3.99' : 'LKR 1000'}
                  </p>
                  {isPro && (
                    <p className="text-xs text-green-500">50% Pro discount!</p>
                  )}
                  {!isPro && (
                    <p className="text-xs text-gray-600 line-through">LKR 1000</p>
                  )}
                </div>
              </div>
              <Link href="/checkout?pack=5ads"
                className="block w-full text-center border border-[#cc0000] text-[#cc0000] hover:bg-[#cc0000] hover:text-white font-medium py-2.5 rounded-xl text-sm transition">
                Buy Pack B
              </Link>
            </div>

          </div>
        </div>

        {/* FAQ */}
        <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-7">
          <h2 className="text-lg font-bold text-white mb-6">
            Frequently asked questions
          </h2>
          <div className="space-y-5">
            {[
              {
                q: 'Can I cancel my Pro subscription anytime?',
                a: 'Yes, you can cancel anytime. Your Pro features stay active until the end of the billing period.'
              },
              {
                q: 'What happens to my ads if I downgrade?',
                a: 'Your existing ads stay live. Phone/WhatsApp/email will be hidden on ads once your Pro period ends.'
              },
              {
                q: 'Do ad sets expire?',
                a: 'No — purchased ad sets never expire. Use them whenever you need them.'
              },
              {
                q: 'How does the 50% Pro discount work on ad sets?',
                a: 'If you have an active Pro subscription, ad set prices are automatically halved at checkout.'
              },
            ].map((item) => (
              <div key={item.q} className="border-b border-[#2a2a2a] pb-5 last:border-0 last:pb-0">
                <p className="text-white font-medium text-sm mb-1.5">{item.q}</p>
                <p className="text-gray-500 text-sm leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] py-8 text-center text-sm text-gray-600">
        © 2025 1000ads · All rights reserved
      </footer>
    </div>
  )
}