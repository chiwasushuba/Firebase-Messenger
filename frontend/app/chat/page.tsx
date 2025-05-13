'use client'

import { useEffect, useState } from 'react'
import { sendMessage, listenToMessages, startChat } from '@/utils/chat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext' // assuming you have auth
import { db } from '@/utils/firebase' // assuming you're importing Firestore
import { collection, getDocs } from 'firebase/firestore' // Import Firestore functions

const ChatPage = () => {
  const { user } = useAuth() // custom hook for current Firebase user
  const [chatId, setChatId] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([]) // Store messages
  const [text, setText] = useState('')
  const [users, setUsers] = useState<any[]>([]) // List of users to chat with
  const [selectedUser, setSelectedUser] = useState<string>('') // Store the selected user ID for chatting

  // Fetch all users except the current one
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersList = querySnapshot.docs
        .map(doc => doc.data())
        .filter((userData: any) => userData.uid !== user?.uid); // Exclude the current user

      setUsers(usersList);
    }

    fetchUsers();
  }, [user]);

  useEffect(() => {
    if (!selectedUser || !user?.uid) return;

    // Start a new chat with the selected user
    startChat(user.uid, selectedUser).then(id => {
      setChatId(id) // Set the chat ID
      const unsub = listenToMessages(id, setMessages) // Subscribe to real-time updates
      return () => unsub(); // Clean up the listener on unmount
    });
  }, [selectedUser, user]);

  // Handle sending a message
  const handleSend = async () => {
    if (!text.trim()) return; // Don't send empty messages
    await sendMessage(chatId, user.uid, text); // Send message using the utility function
    setText(''); // Clear the input field
  }

  return (
    <div className="p-4 space-y-4">
      <div>
        <h3>Select a user to chat with:</h3>
        <ul>
          {users.map((u: any) => (
            <li key={u.uid}>
              <Button onClick={() => setSelectedUser(u.uid)}>{u.username}</Button>
            </li>
          ))}
        </ul>
      </div>

      {selectedUser && (
        <>
          <div className="border p-2 h-64 overflow-y-scroll bg-gray-50 rounded">
            {/* Display messages */}
            {messages.map((msg) => (
              <div key={msg.id} className="mb-2">
                <strong>{msg.senderId === user?.uid ? 'You' : 'Them'}:</strong> {msg.text}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Type a message..."
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
        </>
      )}
    </div>
  );
}

export default ChatPage;
