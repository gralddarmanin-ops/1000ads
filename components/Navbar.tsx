'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function Navbar() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
    supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user || null)
    })
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
  }

  return (
    <nav className="bg-black border-b border-[#2a2a2a] sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="text-xl font-bold text-[#cc0000]">
          1000ads
        </Link>
        <div className="flex items-center gap-3">
          <Link href="/post-ad"
            className="bg-[#cc0000] hover:bg-[#aa0000] text-white text-sm font-medium px-4 py-2 rounded-lg transition">
            + Post Ad
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard"
                className="text-sm text-gray-400 hover:text-white font-medium">
                My Ads
              </Link>
              <Link href="/messages"
                className="text-sm text-gray-400 hover:text-white font-medium">
                Messages
              </Link>
              <button onClick={handleLogout}
                className="text-sm text-gray-600 hover:text-red-500 transition">
                Logout
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login"
                className="text-sm text-gray-400 hover:text-white font-medium px-3 py-2">
                Sign in
              </Link>
              <Link href="/register"
                className="text-sm border border-[#cc0000] text-[#cc0000] font-medium px-4 py-2 rounded-lg hover:bg-[#cc0000] hover:text-white transition">
                Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  )
}