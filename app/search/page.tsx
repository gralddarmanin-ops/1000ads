'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useSearchParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState(query)

  useEffect(() => {
    if (query) fetchResults(query)
    else setLoading(false)
  }, [query])

  const fetchResults = async (q: string) => {
    setLoading(true)
    const { data } = await supabase
      .from('ads')
      .select('*, categories(name, icon), ad_images(image_url)')
      .eq('status', 'active')
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order('created_at', { ascending: false })
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

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex gap-2 mb-8">
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

        {/* Results Header */}
        {query && (
          <div className="mb-6">
            <h1 className="text-xl font-bold text-white">
              {loading ? 'Searching...' : `${ads.length} results for "${query}"`}
            </h1>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#141414] rounded-xl border border-[#2a2a2a] h-52 animate-pulse" />
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20 bg-[#141414] rounded-2xl border border-[#2a2a2a]">
            <p className="text-4xl mb-3">🔍</p>
            <p className="text-gray-400 font-medium text-lg">No results found</p>
            <p className="text-gray-600 text-sm mt-2 mb-6">
              Try different keywords or browse categories
            </p>
            <Link href="/"
              className="bg-[#cc0000] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#aa0000] transition">
              Back to homepage
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {ads.map((ad) => (
              <Link key={ad.id} href={`/ads/${ad.id}`}
                className="bg-[#141414] border border-[#2a2a2a] rounded-xl overflow-hidden hover:border-[#cc0000] transition group">
                <div className="bg-[#1a1a1a] h-36 flex items-center justify-center text-4xl overflow-hidden">
                  {ad.ad_images?.[0]?.image_url ? (
                    <img src={ad.ad_images[0].image_url}
                      className="w-full h-full object-cover" />
                  ) : '📷'}
                </div>
                <div className="p-3">
                  <p className="text-xs text-gray-600 mb-1">
                    {ad.categories?.icon} {ad.categories?.name}
                  </p>
                  <p className="text-sm font-semibold text-white truncate group-hover:text-[#cc0000]">
                    {ad.title}
                  </p>
                  <p className="text-[#cc0000] font-bold text-sm mt-1">
                    {ad.price ? `${ad.currency} ${Number(ad.price).toLocaleString()}` : 'Free'}
                  </p>
                  <p className="text-xs text-gray-600 mt-1">📍 {ad.location}</p>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>

      <footer className="border-t border-[#2a2a2a] mt-10 py-8 text-center text-sm text-gray-600">
        © 2025 1000ads · All rights reserved
      </footer>
    </div>
  )
}