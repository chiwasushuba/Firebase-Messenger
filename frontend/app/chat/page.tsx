'use client'

import { useEffect, useRef, useState } from 'react'
import { sendMessage, listenToMessages, startChat } from '@/utils/chat'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/context/AuthContext' // assuming you have auth
import { db } from '@/utils/firebase' // assuming you're importing Firestore
import { collection, doc, getDoc, getDocs } from 'firebase/firestore' // Import Firestore functions
import { Label } from '@radix-ui/react-label'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import MessageBubble from '@/components/MessageBubble'

const ChatPage = () => {
  const { user } = useAuth() // custom hook for current Firebase user
  const [chatId, setChatId] = useState<string>('')
  const [messages, setMessages] = useState<any[]>([]) // Store messages
  const [text, setText] = useState('')
  const [users, setUsers] = useState<any[]>([]) // List of users to chat with
  const [selectedUser, setSelectedUser] = useState<any | null>(null); // Store the selected user ID for chatting
  const [userMap, setUserMap] = useState<Record<string, any>>({});
  const [currentUser, setCurrentUser] = useState<any>(null);

  // automatic scrolls down
  const bottomRef = useRef<HTMLDivElement | null>(null);

  // fetchCurrentUser

  useEffect(() => {
    if (!user?.uid) return;
  
    const fetchCurrentUserProfile = async () => {
      try {
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (userDocSnap.exists()) {
          setCurrentUser(userDocSnap.data());
          console.log('Current user profile:', userDocSnap.data());
        } else {
          console.log('No Firestore profile found for current user');
          setCurrentUser(null);
        }
      } catch (error) {
        console.error('Error fetching current user profile:', error);
      }
    };
  
    fetchCurrentUserProfile();
  }, [user]);


  // Fetch all users except the current one
  useEffect(() => {
    const fetchUsers = async () => {
      const usersRef = collection(db, 'users');
      const querySnapshot = await getDocs(usersRef);
      const usersList = querySnapshot.docs
        .map(doc => doc.data())
        .filter((userData: any) => userData.uid !== user?.uid); // Exclude the current user

      setUsers(usersList);

      const map: Record<string, any> = {};
      usersList.forEach(u => {
        map[u.uid] = u;
      });
      if (user) map[user.uid] = user; // Include current user
      setUserMap(map);
    }
    fetchUsers();
  }, [user]);
  

  useEffect(() => {
    if (!selectedUser?.uid || !user?.uid) return;

    // Start a new chat with the selected user
    startChat(user.uid, selectedUser.uid).then(id => {
      setChatId(id) // Set the chat ID
      const unsub = listenToMessages(id, setMessages) // Subscribe to real-time updates
      return () => unsub(); // Clean up the listener on unmount
    });

  }, [selectedUser, user]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  // Handle sending a message
  const handleSend = async () => {
    if (!text.trim() || !user?.uid || !user?.displayName) return;
  
    const currentUsername = currentUser.username
    console.log(currentUsername)

    await sendMessage(chatId, user.uid, currentUsername || 'Anonymous', text);
    setText('');
  };
  

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <div className="w-72 p-4 space-y-4 border-r border-gray-300">
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Avatar className="w-16 h-16 border border-black rounded-full">
              <AvatarImage src={currentUser?.profileImageUrl} alt="@user" />
              <AvatarFallback>CN</AvatarFallback>
            </Avatar>
            <h3>Username: {currentUser?.username}</h3>
          </div>
          <Label>Select a user to chat with:</Label>
          <ul>
            {users.map((u: any) => (
              <li key={u.uid}>
                <Button className="mb-2" onClick={() => setSelectedUser(u)}>
                  {u.username}
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
  
      {/* Chat area */}
      {selectedUser && (
        <div className="flex flex-col flex-1 p-4 space-y-4 bg-gray-50">
          {/* Message list */}
          <div className="flex-1 overflow-y-auto border rounded p-2 space-y-2">
            {messages.map((msg) => {
              const isOwnMessage = msg.senderId === user?.uid;
              return (
                <MessageBubble
                  key={msg.id}
                  msgId={msg.id}
                  senderUsername={msg.senderUsername || 'Unknown'}
                  textMessage={msg.text}
                  isOwnMessage={isOwnMessage}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>
  
          {/* Message input */}
          <div className="flex gap-2">
            <Input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Type a message..."
            />
            <Button onClick={handleSend}>Send</Button>
          </div>
        </div>
      )}
    </div>
  );  
  
}

export default ChatPage;
 