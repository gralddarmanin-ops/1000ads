'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import Navbar from '@/components/Navbar'

export default function HomePage() {
  const [categories, setCategories] = useState<any[]>([])
  const [ads, setAds] = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
    fetchAds()
  }, [])

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }

  const fetchAds = async () => {
    const { data } = await supabase
      .from('ads')
      .select('*, categories(name), profiles(full_name)')
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(12)
    setAds(data || [])
    setLoading(false)
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (search.trim()) window.location.href = `/search?q=${search}`
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Hero */}
      <div className="bg-black border-b border-[#2a2a2a] py-14 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl font-bold text-white mb-3">
            Buy & Sell <span className="text-[#cc0000]">Anything</span>
          </h1>
          <p className="text-gray-400 mb-8 text-lg">
            1000s of ads across 30 categories
          </p>
          <form onSubmit={handleSearch} className="flex gap-2 max-w-xl mx-auto">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search for anything..."
              className="flex-1 px-5 py-3 rounded-xl bg-[#141414] border border-[#2a2a2a] text-white text-sm placeholder-gray-600 focus:outline-none focus:border-[#cc0000]"
            />
            <button type="submit"
              className="bg-[#cc0000] hover:bg-[#aa0000] text-white font-semibold px-6 py-3 rounded-xl text-sm transition">
              Search
            </button>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-10">

        {/* Categories */}
        <h2 className="text-xl font-bold text-white mb-5">Browse categories</h2>
        <div className="grid grid-cols-3 sm:grid-cols-5 lg:grid-cols-6 gap-3 mb-12">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.slug}`}
              className="bg-[#141414] border border-[#2a2a2a] rounded-xl p-3 text-center hover:border-[#cc0000] transition group">
              <div className="text-2xl mb-1">{cat.icon}</div>
              <p className="text-xs text-gray-400 group-hover:text-[#cc0000] font-medium leading-tight">
                {cat.name}
              </p>
            </Link>
          ))}
        </div>

        {/* Latest Ads */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-bold text-white">Latest ads</h2>
          <Link href="/ads" className="text-[#cc0000] text-sm hover:underline">
            View all →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#141414] rounded-xl border border-[#2a2a2a] h-52 animate-pulse" />
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-16 bg-[#141414] rounded-2xl border border-[#2a2a2a]">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-400 font-medium">No ads yet</p>
            <p className="text-gray-600 text-sm mb-5">Be the first to post!</p>
            <Link href="/post-ad"
              className="bg-[#cc0000] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#aa0000] transition">
              Post a free ad
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ads.map((ad) => (
              <Link key={ad.id} href={`/ads/${ad.id}`}
                className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#cc0000] transition group">
                <div className="bg-[#1a1a1a] h-36 flex items-center justify-center text-4xl">
                  📷
                </div>
                <div className="p-3">
                  <p className="text-sm font-semibold text-white truncate group-hover:text-[#cc0000]">
                    {ad.title}
                  </p>
                  <p className="text-[#cc0000] font-bold text-sm mt-1">
                    {ad.price ? `${ad.currency} ${ad.price}` : 'Free'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">{ad.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Post Ad Banner */}
        <div className="mt-12 bg-[#141414] border border-[#2a2a2a] rounded-2xl p-8 text-center">
          <h3 className="text-xl font-bold text-white mb-2">
            Ready to sell something?
          </h3>
          <p className="text-gray-500 text-sm mb-5">
            Free users get 3 ads/month. Upgrade to Pro for more.
          </p>
          <Link href="/post-ad"
            className="bg-[#cc0000] text-white px-8 py-3 rounded-xl font-medium hover:bg-[#aa0000] transition">
            Post a free ad
          </Link>
        </div>

      </div>

      {/* Footer */}
      <footer className="border-t border-[#2a2a2a] mt-10 py-8 text-center text-sm text-gray-600">
        © 2025 1000ads · All rights reserved
      </footer>
    </div>
  )
}