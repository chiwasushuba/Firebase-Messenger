'use client'

import { useEffect, useState } from "react"
import { getAuth, onAuthStateChanged, signOut, User } from "firebase/auth"
import { db } from "@/utils/firebase"
import { doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileData, setProfileData] = useState({
    username: '',
    bio: '',
    profileUrl: '', 
  })

  const router = useRouter()

  useEffect(() => {
    const auth = getAuth()

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        const docRef = doc(db, 'users', user.uid)
        const docSnap = await getDoc(docRef)

        if (docSnap.exists()) {
          const data = docSnap.data()
          setProfileData({
            username: data.username || '',
            bio: data.bio || '',
            profileUrl: data.profileImageUrl || '', // <-- use correct field name
          })
        }
      }
    }

    fetchProfile()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(getAuth())
      router.push("/login") // Redirect after logout
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  if (loading) return <p>Loading...</p>
  if (!user) return <p>You must be logged in to view this page.</p>

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
      <button onClick={handleLogout} className="mt-2 px-4 py-2 bg-red-500 text-white rounded">
        Logout
      </button>
    </div>
  )
}
