'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { sendMessage, listenToMessages, startChat } from '@/utils/chat'
import { db } from '@/utils/firebase'
import { useAuth } from '@/context/AuthContext'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@radix-ui/react-label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import MessageBubble from '@/components/MessageBubble'
import { signOut, getAuth } from 'firebase/auth'

const ChatPage = () => {
  const { user } = useAuth()
  const router = useRouter()

  const [currentUser, setCurrentUser] = useState<any>(null)
  const [users, setUsers] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any | null>(null)
  const [chatId, setChatId] = useState('')
  const [messages, setMessages] = useState<any[]>([])
  const [text, setText] = useState('')
  const [userMap, setUserMap] = useState<Record<string, any>>({})

  const bottomRef = useRef<HTMLDivElement | null>(null)

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    const fetchProfile = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', user.uid))
        if (userDoc.exists()) {
          setCurrentUser(userDoc.data())
        }
      } catch (err) {
        console.error('Error fetching user profile', err)
      }
    }

    fetchProfile()
  }, [user])

  // Fetch other users
  useEffect(() => {
    const fetchUsers = async () => {
      const snapshot = await getDocs(collection(db, 'users'))
      const usersList = snapshot.docs
        .map(doc => doc.data())
        .filter(u => u.uid !== user?.uid)

      setUsers(usersList)

      const map: Record<string, any> = {}
      usersList.forEach(u => (map[u.uid] = u))
      if (user) map[user.uid] = user
      setUserMap(map)
    }

    if (user) fetchUsers()
  }, [user])

  // Start chat and listen to messages
  useEffect(() => {
    if (!selectedUser?.uid || !user?.uid) return

    const initChat = async () => {
      const id = await startChat(user.uid, selectedUser.uid)
      setChatId(id)
      const unsubscribe = listenToMessages(id, setMessages)
      return () => unsubscribe()
    }

    initChat()
  }, [selectedUser, user])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    if (!text.trim() || !user?.uid) return

    const username = currentUser?.username || 'Anonymous'
    await sendMessage(chatId, user.uid, username, text.trim())
    setText('')
  }

  const handleLogout = async () => {
    try {
      await signOut(getAuth())
      router.push("/login") // Redirect after logout
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <div className="flex h-screen bg-white text-gray-800">
      {/* Sidebar */}
      <div className="w-72 border-r px-4 py-6 space-y-6 bg-gray-100">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14 border">
            <AvatarImage src={currentUser?.profileImageUrl} alt="@user" />
            <AvatarFallback>U</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm text-muted-foreground">Logged in as</p>
            <p className="font-semibold">{currentUser?.username || 'User'}</p>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-sm">Select a user:</Label>
          <ul className="space-y-2">
            {users.map(u => (
              <li key={u.uid}>
                <Button
                  variant={selectedUser?.uid === u.uid ? 'default' : 'outline'}
                  className="w-full justify-start"
                  onClick={() => setSelectedUser(u)}
                >
                  {u.username}
                </Button>
              </li>
            ))}
          </ul>
        </div>

        <div className="flex justify-between space-y-2 pt-4 border-t mt-auto">
          <Button
            variant="outline"
            className="w-1/2"
            onClick={() => router.push('/')}
          >
            About
          </Button>
          <Button
            variant="destructive"
            className="w-1/2"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex flex-1 flex-col px-6 py-4">
        {selectedUser ? (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto space-y-2 bg-gray-50 border rounded-lg p-4">
              {messages.map(msg => (
                <MessageBubble
                  key={msg.id}
                  msgId={msg.id}
                  senderUsername={msg.senderUsername || 'Unknown'}
                  textMessage={msg.text}
                  isOwnMessage={msg.senderId === user?.uid}
                />
              ))}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="mt-4 flex gap-2">
              <Input
                value={text}
                onChange={e => setText(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSend()
                }}
                placeholder="Type your message..."
              />
              <Button onClick={handleSend}>Send</Button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            Select a user to start chatting.
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatPage
