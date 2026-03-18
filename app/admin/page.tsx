'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function AdminPage() {
  const router = useRouter()
  const [stats, setStats] = useState<any>(null)
  const [loading, setLoading] = useState(true)

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

    fetchStats()
  }

  const fetchStats = async () => {
    const [
      { count: totalUsers },
      { count: totalAds },
      { count: activeAds },
      { count: proUsers },
    ] = await Promise.all([
      supabase.from('profiles').select('*', { count: 'exact', head: true }),
      supabase.from('ads').select('*', { count: 'exact', head: true }),
      supabase.from('ads').select('*', { count: 'exact', head: true }).eq('status', 'active'),
      supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('role', 'pro'),
    ])

    setStats({ totalUsers, totalAds, activeAds, proUsers })
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <p className="text-gray-400">Loading admin panel...</p>
    </div>
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Admin Navbar */}
      <nav className="bg-black border-b border-[#2a2a2a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-xl font-bold text-[#cc0000]">
              1000ads
            </Link>
            <span className="text-xs bg-[#cc0000] text-white px-2 py-0.5 rounded-full font-bold">
              ADMIN
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin/users" className="text-sm text-gray-400 hover:text-white">Users</Link>
            <Link href="/admin/ads" className="text-sm text-gray-400 hover:text-white">Ads</Link>
            <Link href="/admin/messages" className="text-sm text-gray-400 hover:text-white">Messages</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-red-500">← Back to site</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold text-white mb-8">Dashboard Overview</h1>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total users', value: stats?.totalUsers || 0, color: 'text-blue-400' },
            { label: 'Pro users', value: stats?.proUsers || 0, color: 'text-yellow-400' },
            { label: 'Total ads', value: stats?.totalAds || 0, color: 'text-green-400' },
            { label: 'Active ads', value: stats?.activeAds || 0, color: 'text-[#cc0000]' },
          ].map((stat) => (
            <div key={stat.label} className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
              <p className="text-xs text-gray-500 mb-2">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Manage Users',
              desc: 'View all users, upgrade to Pro, ban accounts',
              href: '/admin/users',
              icon: '👥',
            },
            {
              title: 'Manage Ads',
              desc: 'View, approve, delete or expire any ad',
              href: '/admin/ads',
              icon: '📋',
            },
            {
              title: 'Manage Messages',
              desc: 'View all conversations between users',
              href: '/admin/messages',
              icon: '💬',
            },
          ].map((item) => (
            <Link key={item.href} href={item.href}
              className="bg-[#141414] border border-[#2a2a2a] hover:border-[#cc0000] rounded-2xl p-6 transition group">
              <p className="text-3xl mb-3">{item.icon}</p>
              <p className="font-bold text-white group-hover:text-[#cc0000] mb-1">{item.title}</p>
              <p className="text-sm text-gray-500">{item.desc}</p>
            </Link>
          ))}
        </div>

      </div>
    </div>
  )
}