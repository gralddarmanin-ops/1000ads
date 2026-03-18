'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function ProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    whatsapp: '',
    email: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { router.push('/login'); return }

    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    setProfile(data)
    setForm({
      full_name: data?.full_name || '',
      phone: data?.phone || '',
      whatsapp: data?.whatsapp || '',
      email: data?.email || '',
    })
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSaved(false)

    await supabase
      .from('profiles')
      .update({
        full_name: form.full_name,
        phone: profile?.role === 'pro' ? form.phone : null,
        whatsapp: profile?.role === 'pro' ? form.whatsapp : null,
        email: form.email,
      })
      .eq('id', profile.id)

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white">Edit profile</h1>
          <p className="text-gray-500 text-sm mt-1">
            {profile?.role === 'pro'
              ? '⭐ Pro account — all contact fields visible to buyers'
              : '🆓 Free account — only name visible. Upgrade to show contact details'}
          </p>
        </div>

        {saved && (
          <div className="bg-green-900/30 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-xl mb-6">
            ✅ Profile saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">

          {/* Basic Info */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-white">Basic info</h3>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Full name</label>
              <input
                type="text"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#cc0000]"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#cc0000]"
                placeholder="your@email.com"
              />
            </div>
          </div>

          {/* Contact Info — Pro only */}
          <div className={`bg-[#141414] border rounded-2xl p-5 space-y-4 ${
            profile?.role === 'pro'
              ? 'border-[#cc0000]/30'
              : 'border-[#2a2a2a] opacity-60'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white">
                Contact details
                {profile?.role === 'pro' && (
                  <span className="ml-2 text-xs text-[#cc0000]">⭐ Pro</span>
                )}
              </h3>
              {profile?.role !== 'pro' && (
                <span className="text-xs text-gray-600">
                  🔒 Pro only
                </span>
              )}
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5">Phone number</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                disabled={profile?.role !== 'pro'}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#cc0000] disabled:cursor-not-allowed disabled:opacity-40"
                placeholder="+94 77 123 4567"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1.5">WhatsApp number</label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                disabled={profile?.role !== 'pro'}
                className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#cc0000] disabled:cursor-not-allowed disabled:opacity-40"
                placeholder="+94 77 123 4567"
              />
            </div>

            {profile?.role !== 'pro' && (
              <div className="bg-[#cc0000]/10 border border-[#cc0000]/20 rounded-xl px-4 py-3 text-xs text-gray-400">
                🔒 Upgrade to Pro to show your phone and WhatsApp to buyers
                <a href="/pricing" className="text-[#cc0000] ml-1 hover:underline">
                  View plans →
                </a>
              </div>
            )}
          </div>

          {/* Account Info */}
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-white mb-4">Account info</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-xs text-gray-600 mb-1">Account type</p>
                <p className="text-white font-medium">
                  {profile?.role === 'pro' ? '⭐ Pro' : '🆓 Free'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Ads this month</p>
                <p className="text-white font-medium">
                  {profile?.ads_used_this_month || 0} / {profile?.role === 'pro' ? 10 : 3}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600 mb-1">Member since</p>
                <p className="text-white font-medium">
                  {profile?.created_at
                    ? new Date(profile.created_at).toLocaleDateString()
                    : '—'}
                </p>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#cc0000] hover:bg-[#aa0000] disabled:opacity-50 text-white font-semibold py-3.5 rounded-xl transition"
          >
            {loading ? 'Saving...' : 'Save profile'}
          </button>

        </form>
      </div>
    </div>
  )
}