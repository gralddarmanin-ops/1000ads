'use client'
import { useEffect, useState, useRef } from 'react'
import { supabase } from '@/lib/supabaseClient'
import { useParams, useRouter } from 'next/navigation'
import Navbar from '@/components/Navbar'
import Link from 'next/link'

export default function ChatPage() {
  const { adId } = useParams()
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [ad, setAd] = useState<any>(null)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [otherId, setOtherId] = useState<string>('')
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    initChat()
  }, [adId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const initChat = async () => {
    const { data: authData } = await supabase.auth.getUser()
    if (!authData.user) { router.push('/login'); return }
    setUser(authData.user)

    // Fetch ad
    const { data: adData } = await supabase
      .from('ads')
      .select('*, profiles(id, full_name)')
      .eq('id', adId)
      .single()
    setAd(adData)

    // Set other person
    const other = adData?.profiles?.id === authData.user.id
      ? null : adData?.profiles?.id
    setOtherId(other || '')

    // Fetch messages
    await fetchMessages(authData.user.id)

    // Mark messages as read
    await supabase
      .from('messages')
      .update({ is_read: true })
      .eq('ad_id', adId)
      .eq('receiver_id', authData.user.id)

    // Subscribe to new messages
    supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `ad_id=eq.${adId}`
      }, () => fetchMessages(authData.user.id))
      .subscribe()
  }

  const fetchMessages = async (userId: string) => {
    const { data } = await supabase
      .from('messages')
      .select(`
        *,
        sender:profiles!messages_sender_id_fkey(full_name)
      `)
      .eq('ad_id', adId)
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
      .order('created_at', { ascending: true })
    setMessages(data || [])
  }

  const sendMessage = async () => {
    if (!newMessage.trim() || !user || sending) return
    setSending(true)

    const receiverId = otherId || ad?.profiles?.id

    await supabase.from('messages').insert({
      ad_id: adId,
      sender_id: user.id,
      receiver_id: receiverId,
      content: newMessage.trim(),
    })

    setNewMessage('')
    setSending(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col">
      <Navbar />

      {/* Chat Header */}
      <div className="bg-black border-b border-[#2a2a2a] px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <button onClick={() => router.push('/messages')}
            className="text-gray-600 hover:text-white transition">
            ←
          </button>
          <div className="flex-1 min-w-0">
            <p className="text-white font-semibold text-sm truncate">
              {ad?.title}
            </p>
            <p className="text-xs text-gray-600">
              with {ad?.profiles?.full_name}
            </p>
          </div>
          <Link href={`/ads/${adId}`}
            className="text-xs text-[#cc0000] hover:underline">
            View ad →
          </Link>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-3">
          {messages.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 text-sm">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isMine = msg.sender_id === user?.id
              return (
                <div key={msg.id}
                  className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                    isMine
                      ? 'bg-[#cc0000] text-white rounded-br-sm'
                      : 'bg-[#141414] text-gray-200 border border-[#2a2a2a] rounded-bl-sm'
                  }`}>
                    <p>{msg.content}</p>
                    <p className={`text-xs mt-1 ${isMine ? 'text-red-200' : 'text-gray-600'}`}>
                      {new Date(msg.created_at).toLocaleTimeString([], {
                        hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                </div>
              )
            })
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      {/* Message Input */}
      <div className="bg-black border-t border-[#2a2a2a] px-4 py-3">
        <div className="max-w-3xl mx-auto flex gap-2">
          <textarea
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message... (Enter to send)"
            className="flex-1 bg-[#141414] border border-[#2a2a2a] text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-[#cc0000] resize-none placeholder-gray-600"
          />
          <button
            onClick={sendMessage}
            disabled={!newMessage.trim() || sending}
            className="bg-[#cc0000] hover:bg-[#aa0000] disabled:opacity-50 text-white px-5 py-2.5 rounded-xl text-sm font-medium transition">
            Send
          </button>
        </div>
      </div>
    </div>
  )
}