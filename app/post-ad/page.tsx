'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'

export default function PostAdPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [images, setImages] = useState<File[]>([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    title: '',
    description: '',
    price: '',
    currency: 'LKR',
    location: '',
    category_id: '',
  })

  useEffect(() => {
    checkUser()
    fetchCategories()
  }, [])

  const checkUser = async () => {
    const { data } = await supabase.auth.getUser()
    if (!data.user) {
      router.push('/login')
      return
    }
    setUser(data.user)
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single()
    setProfile(profileData)
  }

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const maxImages = profile?.role === 'pro' ? 5 : 3
    if (files.length > maxImages) {
      setError(`You can upload max ${maxImages} images`)
      return
    }
    setImages(files)
    setError('')
  }

  // Auto-hide phone numbers for free users
  const sanitizeDescription = (text: string, role: string) => {
    if (role === 'pro') return text
    return text
      .replace(/(\+?[\d\s\-\(\)]{7,15})/g, '[phone hidden]')
      .replace(/(\+94|0094|94)?[\s\-]?(7[0-9]|11|21|23|24|25|26|27|31|32|33|34|35|36|37|38|41|45|47|51|52|54|55|57|63|65|66|67|91)[\s\-]?[0-9]{7}/g, '[phone hidden]')
      .replace(/\b07\d{8}\b/g, '[phone hidden]')
      .replace(/\b\+947\d{8}\b/g, '[phone hidden]')
  }

  const hasPhoneNumber = (text: string) => {
    return /(\+?[\d\s\-\(\)]{7,15})/.test(text)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Check ad limit
    const maxAds = profile?.role === 'pro' ? 10 : 3
    if (profile?.ads_used_this_month >= maxAds) {
      setError(`You have reached your ${maxAds} ads/month limit. ${profile?.role === 'free' ? 'Upgrade to Pro for more!' : ''}`)
      setLoading(false)
      return
    }

    try {
      // Insert ad
      const { data: ad, error: adError } = await supabase
        .from('ads')
        .insert({
          user_id: user.id,
          category_id: parseInt(form.category_id),
          title: form.title,
          description: sanitizeDescription(form.description, profile?.role),
          price: form.price ? parseFloat(form.price) : null,
          currency: form.currency,
          location: form.location,
          is_pro_ad: profile?.role === 'pro',
          status: 'active',
        })
        .select()
        .single()

      if (adError) throw adError

      // Upload images
      for (let i = 0; i < images.length; i++) {
        const file = images[i]
        const fileName = `${user.id}/${ad.id}/${Date.now()}-${i}`
        const { data: uploaded, error: uploadError } = await supabase.storage
          .from('ad-images')
          .upload(fileName, file)
        if (!uploadError && uploaded) {
          const { data: urlData } = supabase.storage
            .from('ad-images')
            .getPublicUrl(fileName)
          await supabase.from('ad_images').insert({
            ad_id: ad.id,
            image_url: urlData.publicUrl,
            position: i,
          })
        }
      }

      // Update ads used count
      await supabase
        .from('profiles')
        .update({ ads_used_this_month: (profile?.ads_used_this_month || 0) + 1 })
        .eq('id', user.id)

      router.push(`/ads/${ad.id}`)
    } catch (err: any) {
      setError(err.message || 'Something went wrong')
      setLoading(false)
    }
  }

  const maxImages = profile?.role === 'pro' ? 5 : 3
  const maxAds = profile?.role === 'pro' ? 10 : 3
  const adsLeft = maxAds - (profile?.ads_used_this_month || 0)

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="max-w-2xl mx-auto px-4 py-10">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Post an ad</h1>
          <p className="text-gray-500 text-sm mt-1">
            {profile?.role === 'pro' ? '⭐ Pro account' : '🆓 Free account'} ·{' '}
            <span className={adsLeft <= 1 ? 'text-red-500 font-medium' : 'text-gray-500'}>
              {adsLeft} ad{adsLeft !== 1 ? 's' : ''} remaining this month
            </span>
          </p>
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Category */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Category *
            </label>
            <select
              required
              value={form.category_id}
              onChange={(e) => setForm({ ...form, category_id: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Select a category</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Title & Description */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Ad title *
              </label>
              <input
                type="text"
                required
                maxLength={100}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g. iPhone 14 Pro Max 256GB"
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-gray-700 block mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Describe what you're selling..."
              />
              {/* Live warning for free users typing phone numbers */}
              {profile?.role === 'free' && hasPhoneNumber(form.description) && (
                <p className="text-xs text-orange-500 mt-1.5 flex items-center gap-1">
                  ⚠️ Phone numbers will be automatically hidden. Upgrade to Pro to show your number.
                </p>
              )}
            </div>
          </div>

          {/* Price */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="text-sm font-semibold text-gray-700 block mb-3">
              Price
            </label>
            <div className="flex gap-3">
              <select
                value={form.currency}
                onChange={(e) => setForm({ ...form, currency: e.target.value })}
                className="border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
              >
                <option>LKR</option>
                <option>USD</option>
              </select>
              <input
                type="number"
                min="0"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Leave empty if free"
              />
            </div>
          </div>

          {/* Location */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Location *
            </label>
            <input
              type="text"
              required
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
              className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Colombo, Sri Lanka"
            />
          </div>

          {/* Images */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <label className="text-sm font-semibold text-gray-700 block mb-1">
              Photos
            </label>
            <p className="text-xs text-gray-400 mb-3">
              Max {maxImages} photos · {profile?.role === 'free' ? 'Upgrade to Pro for 5 photos' : '5 photos allowed ⭐'}
            </p>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageChange}
              className="w-full border border-dashed border-gray-300 rounded-xl px-4 py-6 text-sm text-gray-500 cursor-pointer hover:border-blue-400 transition"
            />
            {images.length > 0 && (
              <div className="flex gap-2 mt-3 flex-wrap">
                {images.map((img, i) => (
                  <div key={i} className="relative">
                    <img
                      src={URL.createObjectURL(img)}
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || adsLeft <= 0}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3.5 rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Posting your ad...' : 'Post ad for free'}
          </button>

          {profile?.role === 'free' && (
            <p className="text-center text-xs text-gray-400">
              Free account: {maxAds} ads/month · 3 images per ad · Contact via chat only
            </p>
          )}

        </form>
      </div>
    </div>
  )
}