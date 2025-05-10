'use client'

import { useEffect, useState } from "react";
import { useAuth } from '@/context/AuthContext';
import { db } from "@/utils/firebase";
import { doc, getDoc } from "firebase/firestore";

export default function Home() {
  const { user, loading, logout } = useAuth();

  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    profileUrl: '', 
  });

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          setProfileData({
            username: data.username || '',
            bio: data.bio || '',
            profileUrl: data.profile || '',
          });
        }
      }
    };

    fetchProfile();
  }, [user]);

  if (loading) return <p>Loading...</p>;

  return (
    <div className="flex flex-col justify-center items-center gap-4">
      <p>Welcome, <strong>{profileData.username}</strong></p>
      {profileData.profileUrl && (
        <img
          src={profileData.profileUrl}
          alt="Profile"
          className="w-24 h-24 rounded-full"
        />
      )}
      {profileData.bio && (
        <p className="text-sm text-gray-600">"{profileData.bio}"</p>
      )}
      <button onClick={logout} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
        Logout
      </button>
    </div>
  );
}
