'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminAdsPage() {
  const router = useRouter()
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    checkAdmin()
  }, [])

  const checkAdmin = async () => {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { router.push('/login'); return }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single()
    if (profile?.role !== 'admin') { router.push('/'); return }
    fetchAds()
  }

  const fetchAds = async () => {
    const { data } = await supabase
      .from('ads')
      .select('*, categories(name, icon), profiles(full_name, email)')
      .order('created_at', { ascending: false })
    setAds(data || [])
    setLoading(false)
  }

  const deleteAd = async (adId: string) => {
    if (!confirm('Delete this ad permanently?')) return
    await supabase.from('ads').delete().eq('id', adId)
    setAds(ads.filter(a => a.id !== adId))
  }

  const updateStatus = async (adId: string, status: string) => {
    await supabase.from('ads').update({ status }).eq('id', adId)
    setAds(ads.map(a => a.id === adId ? { ...a, status } : a))
  }

  const filtered = ads.filter(ad => {
    const matchSearch =
      ad.title?.toLowerCase().includes(search.toLowerCase()) ||
      ad.profiles?.email?.toLowerCase().includes(search.toLowerCase())
    const matchFilter = filter === 'all' || ad.status === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <nav className="bg-black border-b border-[#2a2a2a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-[#cc0000] font-bold text-xl">1000ads</Link>
            <span className="text-xs bg-[#cc0000] text-white px-2 py-0.5 rounded-full font-bold">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-white">Overview</Link>
            <Link href="/admin/users" className="text-sm text-gray-400 hover:text-white">Users</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-red-500">← Back to site</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-white">
            Ads <span className="text-gray-600 text-lg">({ads.length})</span>
          </h1>
          <div className="flex gap-2">
            {['all', 'active', 'sold', 'expired'].map((s) => (
              <button key={s}
                onClick={() => setFilter(s)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition capitalize ${
                  filter === s
                    ? 'border-[#cc0000] text-[#cc0000] bg-[#cc0000]/10'
                    : 'border-[#2a2a2a] text-gray-500 hover:border-gray-600'
                }`}>
                {s}
              </button>
            ))}
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search ads..."
              className="bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-1.5 text-sm focus:outline-none focus:border-[#cc0000] w-48"
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#141414] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Ad</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Status</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Price</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Views</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((ad) => (
                  <tr key={ad.id} className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a]">
                    <td className="px-4 py-3">
                      <p className="text-white font-medium truncate max-w-xs">{ad.title}</p>
                      <p className="text-gray-600 text-xs">
                        {ad.categories?.icon} {ad.categories?.name}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-gray-300 text-xs">{ad.profiles?.full_name}</p>
                      <p className="text-gray-600 text-xs">{ad.profiles?.email}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        ad.status === 'active'
                          ? 'bg-green-900/40 text-green-400'
                          : ad.status === 'sold'
                          ? 'bg-blue-900/40 text-blue-400'
                          : 'bg-gray-800 text-gray-500'
                      }`}>
                        {ad.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {ad.price ? `${ad.currency} ${Number(ad.price).toLocaleString()}` : 'Free'}
                    </td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      👁 {ad.views || 0}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Link href={`/ads/${ad.id}`}
                          className="text-xs text-blue-400 hover:underline">
                          View
                        </Link>
                        {ad.status === 'active' ? (
                          <button
                            onClick={() => updateStatus(ad.id, 'expired')}
                            className="text-xs bg-gray-800 text-gray-400 border border-gray-700 px-2.5 py-1 rounded-lg hover:bg-gray-700 transition">
                            Expire
                          </button>
                        ) : (
                          <button
                            onClick={() => updateStatus(ad.id, 'active')}
                            className="text-xs bg-green-900/30 text-green-400 border border-green-900 px-2.5 py-1 rounded-lg hover:bg-green-900/50 transition">
                            Activate
                          </button>
                        )}
                        <button
                          onClick={() => deleteAd(ad.id)}
                          className="text-xs bg-red-900/30 text-red-400 border border-red-900 px-2.5 py-1 rounded-lg hover:bg-red-900/50 transition">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}