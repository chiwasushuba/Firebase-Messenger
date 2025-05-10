// app/chat/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { sendMessage, listenToMessages, startChat } from '@/utils/chat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext' // assuming you have auth

const ChatPage = () => {
  const { user } = useAuth() // custom hook for current Firebase user
  const [chatId, setChatId] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')

  useEffect(() => {
    const uid2 = 'otherUserId'; // Replace with actual user ID you want to chat with
    if (user?.uid) {
      startChat(user.uid, uid2).then(id => {
        setChatId(id)
        const unsub = listenToMessages(id, setMessages)
        return () => unsub()
      })
    }
  }, [user])

  const handleSend = async () => {
    if (!text.trim()) return
    await sendMessage(chatId, user.uid, text)
    setText('')
  }

  return (
    <div className="p-4 space-y-4">
      <div className="border p-2 h-64 overflow-y-scroll bg-gray-50 rounded">
        {messages.map((msg) => (
          <div key={msg.id} className="mb-2">
            <strong>{msg.senderId === user.uid ? 'You' : 'Them'}:</strong> {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <Input value={text} onChange={(e) => setText(e.target.value)} placeholder="Type a message..." />
        <Button onClick={handleSend}>Send</Button>
      </div>
    </div>
  )
}

export default ChatPage
