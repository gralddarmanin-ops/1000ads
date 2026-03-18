'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

function ActionMenu({ user, onAction }: { user: any, onAction: (action: string, userId: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const actions = [
    user.role !== 'pro' && user.role !== 'admin' && {
      label: '⭐ Upgrade to Pro',
      key: 'upgrade',
      color: 'text-yellow-400',
    },
    user.role === 'pro' && {
      label: '↓ Downgrade to Free',
      key: 'downgrade',
      color: 'text-gray-300',
    },
    user.role !== 'admin' && {
      label: '🔄 Reset monthly ads',
      key: 'reset',
      color: 'text-blue-400',
    },
    user.role !== 'admin' && user.role !== 'banned' && {
      label: '🚫 Ban user',
      key: 'ban',
      color: 'text-orange-400',
    },
    user.role === 'banned' && {
      label: '✅ Unban user',
      key: 'unban',
      color: 'text-green-400',
    },
    user.role !== 'admin' && {
      label: '🗑️ Delete user',
      key: 'delete',
      color: 'text-red-400',
    },
  ].filter(Boolean)

  if (user.role === 'admin') return (
    <span className="text-xs text-gray-600 italic">No actions</span>
  )

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1a1a] border border-[#2a2a2a] hover:border-[#cc0000] text-gray-400 hover:text-white transition text-lg"
      >
        ⋮
      </button>

      {open && (
        <div className="absolute right-0 top-9 bg-[#1a1a1a] border border-[#2a2a2a] rounded-xl shadow-xl z-50 w-52 overflow-hidden">
          {(actions as any[]).map((action) => (
            <button
              key={action.key}
              onClick={() => {
                onAction(action.key, user.id)
                setOpen(false)
              }}
              className={`w-full text-left px-4 py-2.5 text-sm ${action.color} hover:bg-[#2a2a2a] transition flex items-center gap-2`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default function AdminUsersPage() {
  const router = useRouter()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [addForm, setAddForm] = useState({ full_name: '', email: '', password: '', role: 'free' })
  const [addError, setAddError] = useState('')
  const [addLoading, setAddLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  useEffect(() => { checkAdmin() }, [])

  const checkAdmin = async () => {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { router.push('/login'); return }
    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', authData.user.id).single()
    if (profile?.role !== 'admin') { router.push('/'); return }
    fetchUsers()
  }

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setTimeout(() => setSuccessMsg(''), 3000)
  }

  const handleAction = async (action: string, userId: string) => {
    const user = users.find(u => u.id === userId)

    switch (action) {
      case 'upgrade':
        await supabase.from('profiles').update({ role: 'pro' }).eq('id', userId)
        setUsers(users.map(u => u.id === userId ? { ...u, role: 'pro' } : u))
        showSuccess('⭐ User upgraded to Pro!')
        break

      case 'downgrade':
        await supabase.from('profiles').update({ role: 'free' }).eq('id', userId)
        setUsers(users.map(u => u.id === userId ? { ...u, role: 'free' } : u))
        showSuccess('✅ User downgraded to Free!')
        break

      case 'reset':
        await supabase.from('profiles').update({ ads_used_this_month: 0 }).eq('id', userId)
        setUsers(users.map(u => u.id === userId ? { ...u, ads_used_this_month: 0 } : u))
        showSuccess('🔄 Monthly ads reset to 0!')
        break

      case 'ban':
        if (!confirm(`Ban ${user?.email}? They will not be able to post ads.`)) return
        await supabase.from('profiles').update({ role: 'banned' }).eq('id', userId)
        setUsers(users.map(u => u.id === userId ? { ...u, role: 'banned' } : u))
        showSuccess('🚫 User banned!')
        break

      case 'unban':
        await supabase.from('profiles').update({ role: 'free' }).eq('id', userId)
        setUsers(users.map(u => u.id === userId ? { ...u, role: 'free' } : u))
        showSuccess('✅ User unbanned!')
        break

      case 'delete':
        if (!confirm(`Permanently delete ${user?.email} and ALL their ads? This cannot be undone.`)) return
        await supabase.from('messages').delete().eq('sender_id', userId)
        await supabase.from('messages').delete().eq('receiver_id', userId)
        await supabase.from('ads').delete().eq('user_id', userId)
        await supabase.from('profiles').delete().eq('id', userId)
        setUsers(users.filter(u => u.id !== userId))
        showSuccess('🗑️ User deleted!')
        break
    }
  }

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault()
    setAddLoading(true)
    setAddError('')

    const { data, error } = await supabase.auth.signUp({
      email: addForm.email,
      password: addForm.password,
      options: { data: { full_name: addForm.full_name } }
    })

    if (error) { setAddError(error.message); setAddLoading(false); return }

    if (addForm.role === 'pro' && data.user) {
      await supabase.from('profiles').update({ role: 'pro' }).eq('id', data.user.id)
    }

    setAddLoading(false)
    setShowAddModal(false)
    setAddForm({ full_name: '', email: '', password: '', role: 'free' })
    showSuccess('✅ User created successfully!')
    fetchUsers()
  }

  const filtered = users.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-[#0a0a0a]">

      {/* Navbar */}
      <nav className="bg-black border-b border-[#2a2a2a] sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-[#cc0000] font-bold text-xl">1000ads</Link>
            <span className="text-xs bg-[#cc0000] text-white px-2 py-0.5 rounded-full font-bold">ADMIN</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="text-sm text-gray-400 hover:text-white">Overview</Link>
            <Link href="/admin/ads" className="text-sm text-gray-400 hover:text-white">Ads</Link>
            <Link href="/" className="text-sm text-gray-600 hover:text-red-500">← Back to site</Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
          <h1 className="text-2xl font-bold text-white">
            Users <span className="text-gray-600 text-lg">({users.length})</span>
          </h1>
          <div className="flex items-center gap-3">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or email..."
              className="bg-[#141414] border border-[#2a2a2a] text-white rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-[#cc0000] w-64"
            />
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-[#cc0000] hover:bg-[#aa0000] text-white text-sm font-medium px-4 py-2 rounded-xl transition">
              + Add User
            </button>
          </div>
        </div>

        {/* Success Message */}
        {successMsg && (
          <div className="bg-green-900/30 border border-green-800 text-green-400 text-sm px-4 py-3 rounded-xl mb-4">
            {successMsg}
          </div>
        )}

        {/* Table */}
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-[#141414] rounded-xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2a2a2a]">
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">User</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Role</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Ads used</th>
                  <th className="text-left px-4 py-3 text-gray-500 font-medium">Joined</th>
                  <th className="text-right px-4 py-3 text-gray-500 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((user) => (
                  <tr key={user.id} className="border-b border-[#2a2a2a] hover:bg-[#1a1a1a]">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#cc0000]/20 flex items-center justify-center text-[#cc0000] font-bold text-xs flex-shrink-0">
                          {user.full_name?.[0]?.toUpperCase() || '?'}
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.full_name || '—'}</p>
                          <p className="text-gray-600 text-xs">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                        user.role === 'admin' ? 'bg-purple-900/40 text-purple-400'
                        : user.role === 'pro' ? 'bg-yellow-900/40 text-yellow-400'
                        : user.role === 'banned' ? 'bg-red-900/40 text-red-400'
                        : 'bg-gray-800 text-gray-400'
                      }`}>
                        {user.role === 'admin' ? '👑 Admin'
                          : user.role === 'pro' ? '⭐ Pro'
                          : user.role === 'banned' ? '🚫 Banned'
                          : '🆓 Free'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-400">
                      {user.ads_used_this_month || 0} / {user.role === 'pro' ? 10 : 3}
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <ActionMenu user={user} onAction={handleAction} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 px-4">
          <div className="bg-[#141414] border border-[#2a2a2a] rounded-2xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Add new user</h2>
              <button onClick={() => { setShowAddModal(false); setAddError('') }}
                className="text-gray-600 hover:text-white text-2xl leading-none">×</button>
            </div>
            {addError && (
              <div className="bg-red-900/30 border border-red-800 text-red-400 text-sm px-4 py-3 rounded-xl mb-4">
                {addError}
              </div>
            )}
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Full name</label>
                <input type="text" required value={addForm.full_name}
                  onChange={(e) => setAddForm({ ...addForm, full_name: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#cc0000]"
                  placeholder="John Doe" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Email</label>
                <input type="email" required value={addForm.email}
                  onChange={(e) => setAddForm({ ...addForm, email: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#cc0000]"
                  placeholder="user@email.com" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Password</label>
                <input type="password" required minLength={6} value={addForm.password}
                  onChange={(e) => setAddForm({ ...addForm, password: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#cc0000]"
                  placeholder="Min. 6 characters" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Account type</label>
                <select value={addForm.role}
                  onChange={(e) => setAddForm({ ...addForm, role: e.target.value })}
                  className="w-full bg-[#0a0a0a] border border-[#2a2a2a] text-white rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:border-[#cc0000]">
                  <option value="free">🆓 Free</option>
                  <option value="pro">⭐ Pro</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button"
                  onClick={() => { setShowAddModal(false); setAddError('') }}
                  className="flex-1 border border-[#2a2a2a] text-gray-400 font-medium py-2.5 rounded-xl text-sm hover:border-gray-600 transition">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  className="flex-1 bg-[#cc0000] hover:bg-[#aa0000] disabled:opacity-50 text-white font-semibold py-2.5 rounded-xl text-sm transition">
                  {addLoading ? 'Creating...' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}