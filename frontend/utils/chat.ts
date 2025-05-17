// utils/chat.ts
import {
  collection,
  addDoc,
  doc,
  setDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp
} from 'firebase/firestore';
import { db } from './firebase';

export const startChat = async (uid1: string, uid2: string) => {
  const chatId = [uid1, uid2].sort().join('_');
  await setDoc(doc(db, 'chats', chatId), {
    participants: [uid1, uid2],
    createdAt: serverTimestamp(),
  });
  return chatId;
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  senderUsername: string,
  text: string
) => {
  await addDoc(collection(db, 'chats', chatId, 'messages'), {
    senderId,
    senderUsername, // add this
    text,
    createdAt: serverTimestamp(),
  });
};


export const listenToMessages = (chatId: string, callback: (msgs: any[]) => void) => {
  const q = query(collection(db, 'chats', chatId, 'messages'), orderBy('createdAt'));
  return onSnapshot(q, (snapshot) => {
    const msgs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(msgs);
  });
};
