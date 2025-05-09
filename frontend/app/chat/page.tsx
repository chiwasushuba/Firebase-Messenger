'use client';

import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function ChatPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<string[]>([]);
  const socket = useRef<WebSocket | null>(null);


  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }

    // Connect to WebSocket server
    socket.current = new WebSocket('ws://localhost:8080');

    socket.current.onmessage = (event) => {
      setMessages((prev) => [...prev, event.data]);
    };

    return () => socket.current?.close();
  }, [loading, user]);

  const sendMessage = () => {
    if (!input.trim() || !socket.current) return;
    const msg = `${user?.email}: ${input}`;
    socket.current.send(msg);
    setInput('');
  };
  

  if (loading || !user) return <p>Loading...</p>;

  return (
    <div style={{ padding: '1rem' }}>
      <h2>Live Chat</h2>
      <button onClick={logout}>Logout</button>

      <div style={{ height: '300px', border: '1px solid #ccc', padding: '1rem', overflowY: 'auto', marginTop: '1rem' }}>
        {messages.map((msg, idx) => (
          <div key={idx}>{msg}</div>
        ))}
      </div>

      <div style={{ marginTop: '1rem' }}>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message"
        />
        <button onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
