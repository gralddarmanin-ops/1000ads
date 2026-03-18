'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function DashboardPage() {
  const router = useRouter()
  const [profile, setProfile] = useState<any>(null)
  const [ads, setAds] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { router.push('/login'); return }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()
    setProfile(profileData)

    const { data: adsData } = await supabase
      .from('ads')
      .select('*, categories(name, icon), ad_images(image_url)')
      .eq('user_id', authData.user.id)
      .order('created_at', { ascending: false })
    setAds(adsData || [])
    setLoading(false)
  }

  const deleteAd = async (adId: string) => {
    if (!confirm('Are you sure you want to delete this ad?')) return
    await supabase.from('ads').delete().eq('id', adId)
    setAds(ads.filter(a => a.id !== adId))
  }

  const toggleStatus = async (adId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'active' ? 'sold' : 'active'
    await supabase.from('ads').update({ status: newStatus }).eq('id', adId)
    setAds(ads.map(a => a.id === adId ? { ...a, status: newStatus } : a))
  }

  const maxAds = profile?.role === 'pro' ? 10 : 3
  const adsLeft = maxAds - (profile?.ads_used_this_month || 0)

  if (loading) return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl" />
          ))}
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Dashboard</h1>
            <p className="text-gray-500 text-sm mt-1">
              Welcome back, {profile?.full_name} 👋
            </p>
          </div>
          <Link href="/post-ad"
            className="bg-blue-600 text-white text-sm font-medium px-4 py-2.5 rounded-xl hover:bg-blue-700 transition">
            + Post Ad
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">Account type</p>
            <p className="text-lg font-bold text-gray-900">
              {profile?.role === 'pro' ? '⭐ Pro' : '🆓 Free'}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">Ads this month</p>
            <p className="text-lg font-bold text-gray-900">
              {profile?.ads_used_this_month || 0}
              <span className="text-sm font-normal text-gray-400">/{maxAds}</span>
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">Ads remaining</p>
            <p className={`text-lg font-bold ${adsLeft <= 1 ? 'text-red-500' : 'text-green-600'}`}>
              {adsLeft}
            </p>
          </div>
          <div className="bg-white rounded-2xl border border-gray-100 p-4">
            <p className="text-xs text-gray-400 mb-1">Total ads</p>
            <p className="text-lg font-bold text-gray-900">{ads.length}</p>
          </div>
        </div>

        {/* Upgrade Banner for free users */}
        {profile?.role === 'free' && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-500 rounded-2xl p-5 mb-8 flex items-center justify-between">
            <div>
              <p className="text-white font-semibold">Upgrade to Pro ⭐</p>
              <p className="text-blue-100 text-sm mt-0.5">
                10 ads/month · 5 images · Show phone & WhatsApp
              </p>
            </div>
            <Link href="/pricing"
              className="bg-white text-blue-600 text-sm font-semibold px-4 py-2 rounded-xl hover:bg-blue-50 transition whitespace-nowrap">
              View plans
            </Link>
          </div>
        )}

        {/* My Ads */}
        <h2 className="text-lg font-bold text-gray-900 mb-4">My Ads</h2>

        {ads.length === 0 ? (
          <div className="bg-white rounded-2xl border border-gray-100 p-12 text-center">
            <p className="text-4xl mb-3">📋</p>
            <p className="text-gray-500 font-medium">No ads yet</p>
            <p className="text-gray-400 text-sm mb-5">Post your first ad for free!</p>
            <Link href="/post-ad"
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-blue-700 transition">
              Post a free ad
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {ads.map((ad) => (
              <div key={ad.id}
                className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">

                {/* Image */}
                <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center text-2xl">
                  {ad.ad_images?.[0]?.image_url ? (
                    <img src={ad.ad_images[0].image_url}
                      className="w-full h-full object-cover" />
                  ) : '📷'}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-semibold text-gray-900 text-sm truncate">
                      {ad.title}
                    </p>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium flex-shrink-0 ${
                      ad.status === 'active'
                        ? 'bg-green-50 text-green-600'
                        : 'bg-gray-100 text-gray-500'
                    }`}>
                      {ad.status}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400">
                    {ad.categories?.icon} {ad.categories?.name} ·{' '}
                    {ad.price ? `${ad.currency} ${Number(ad.price).toLocaleString()}` : 'Free'} ·{' '}
                    👁 {ad.views} views
                  </p>
                  <p className="text-xs text-gray-300 mt-0.5">
                    Posted {new Date(ad.created_at).toLocaleDateString()}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  <Link href={`/ads/${ad.id}`}
                    className="text-xs text-blue-600 hover:underline font-medium">
                    View
                  </Link>
                  <button
                    onClick={() => toggleStatus(ad.id, ad.status)}
                    className="text-xs text-gray-500 hover:text-green-600 font-medium border border-gray-200 px-2.5 py-1 rounded-lg hover:border-green-300 transition">
                    {ad.status === 'active' ? 'Mark sold' : 'Reactivate'}
                  </button>
                  <button
                    onClick={() => deleteAd(ad.id)}
                    className="text-xs text-red-400 hover:text-red-600 font-medium border border-gray-200 px-2.5 py-1 rounded-lg hover:border-red-300 transition">
                    Delete
                  </button>
                </div>

              </div>
            ))}
          </div>
        )}

        {/* Profile Settings */}
        <div className="mt-8 bg-white rounded-2xl border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-700 mb-4">Profile settings</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-400 mb-1">Full name</p>
              <p className="text-gray-900 font-medium">{profile?.full_name || '—'}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Email</p>
              <p className="text-gray-900 font-medium">{profile?.email || '—'}</p>
            </div>
            {profile?.role === 'pro' && (
              <>
                <div>
                  <p className="text-xs text-gray-400 mb-1">Phone</p>
                  <p className="text-gray-900 font-medium">{profile?.phone || '—'}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-400 mb-1">WhatsApp</p>
                  <p className="text-gray-900 font-medium">{profile?.whatsapp || '—'}</p>
                </div>
              </>
            )}
          </div>
          <Link href="/profile"
            className="mt-4 inline-block text-sm text-blue-600 hover:underline font-medium">
            Edit profile →
          </Link>
        </div>

      </div>
    </div>
  )
}