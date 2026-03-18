'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName } }
    })
    if (error) { setError(error.message); setLoading(false) }
    else router.push('/')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 w-full max-w-md p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Create account</h1>
        <p className="text-gray-500 text-sm mb-6">Join 1000ads and start posting for free</p>
        {error && <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-lg mb-4">{error}</div>}
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Full name</label>
            <input type="text" required value={fullName} onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Your full name" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Email</label>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="you@email.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-700 block mb-1">Password</label>
            <input type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
              className="w-full border border-gray-200 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Min. 6 characters" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 rounded-lg text-sm transition disabled:opacity-50">
            {loading ? 'Creating account...' : 'Create account'}
          </button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-blue-600 font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}