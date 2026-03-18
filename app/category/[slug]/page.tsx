export const runtime = 'edge';
'use client';

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function CategoryPage() {
  const { slug } = useParams()
  const [ads, setAds] = useState<any[]>([])
  const [category, setCategory] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategory()
  }, [slug])

  const fetchCategory = async () => {
    const { data: cat } = await supabase
      .from('categories')
      .select('*')
      .eq('slug', slug)
      .single()
    setCategory(cat)

    if (cat) {
      const { data } = await supabase
        .from('ads')
        .select('*, ad_images(image_url)')
        .eq('category_id', cat.id)
        .eq('status', 'active')
        .order('created_at', { ascending: false })
      setAds(data || [])
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-6xl mx-auto px-4 py-8">

        <div className="mb-8">
          <Link href="/" className="text-sm text-gray-600 hover:text-[#cc0000] mb-3 inline-block">
            ← All categories
          </Link>
          <h1 className="text-2xl font-bold text-white">
            {category?.icon} {category?.name}
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {loading ? '...' : `${ads.length} active ads`}
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-[#141414] rounded-xl border border-[#2a2a2a] h-52 animate-pulse" />
            ))}
          </div>
        ) : ads.length === 0 ? (
          <div className="text-center py-20 bg-[#141414] rounded-2xl border border-[#2a2a2a]">
            <p className="text-4xl mb-3">{category?.icon}</p>
            <p className="text-gray-400 font-medium">No ads in this category yet</p>
            <p className="text-gray-600 text-sm mt-2 mb-6">Be the first to post!</p>
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
                <div className="bg-[#1a1a1a] h-36 flex items-center justify-center text-4xl overflow-hidden">
                  {ad.ad_images?.[0]?.image_url ? (
                    <img src={ad.ad_images[0].image_url}
                      className="w-full h-full object-cover" />
                  ) : '📷'}
                </div>
                <div className="p-3">
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
