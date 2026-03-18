'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function MessagesPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [conversations, setConversations] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { router.push('/login'); return }
    setUser(authData.user)

    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        ads(id, title),
        sender:profiles!messages_sender_id_fkey(id, full_name),
        receiver:profiles!messages_receiver_id_fkey(id, full_name)
      `)
      .or(`sender_id.eq.${authData.user.id},receiver_id.eq.${authData.user.id}`)
      .order('created_at', { ascending: false })

    // Group by ad_id to show conversations
    const grouped: any = {}
    for (const msg of data || []) {
      const key = msg.ad_id
      if (!grouped[key]) grouped[key] = { ...msg, unread: 0 }
      if (!msg.is_read && msg.receiver_id === authData.user.id) {
        grouped[key].unread++
      }
    }
    setConversations(Object.values(grouped))
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-4 py-8">

        <h1 className="text-2xl font-bold text-white mb-6">Messages</h1>

        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-[#141414] rounded-2xl border border-[#2a2a2a] h-20 animate-pulse" />
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <div className="text-center py-20 bg-[#141414] rounded-2xl border border-[#2a2a2a]">
            <p className="text-4xl mb-3">💬</p>
            <p className="text-gray-400 font-medium">No messages yet</p>
            <p className="text-gray-600 text-sm mt-2 mb-6">
              When buyers contact you, messages will appear here
            </p>
            <Link href="/"
              className="bg-[#cc0000] text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-[#aa0000] transition">
              Browse ads
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {conversations.map((conv) => {
              const isReceiver = conv.receiver_id === user?.id
              const otherPerson = isReceiver ? conv.sender : conv.receiver
              return (
                <Link key={conv.ad_id} href={`/messages/${conv.ad_id}`}
                  className="bg-[#141414] border border-[#2a2a2a] hover:border-[#cc0000] rounded-2xl p-4 flex items-center gap-4 transition">
                  <div className="w-10 h-10 rounded-full bg-[#cc0000]/20 flex items-center justify-center text-[#cc0000] font-bold text-sm flex-shrink-0">
                    {otherPerson?.full_name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-0.5">
                      <p className="font-semibold text-white text-sm">
                        {otherPerson?.full_name}
                      </p>
                      <p className="text-xs text-gray-600">
                        {new Date(conv.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 truncate">
                      Re: {conv.ads?.title}
                    </p>
                    <p className="text-xs text-gray-600 truncate mt-0.5">
                      {conv.content}
                    </p>
                  </div>
                  {conv.unread > 0 && (
                    <span className="bg-[#cc0000] text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0">
                      {conv.unread}
                    </span>
                  )}
                </Link>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}