'use client'

import { useEffect, useState } from "react"
import { deleteUser, getAuth, onAuthStateChanged, signOut, User } from "firebase/auth"
import { db } from "@/utils/firebase"
import { deleteDoc, doc, getDoc } from "firebase/firestore"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"

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
            profileUrl: data.profileImageUrl || '',
          })
        }
      }
    }

    fetchProfile()
  }, [user])

  const handleLogout = async () => {
    try {
      await signOut(getAuth())
      router.push("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  const handleChat = () => {
    router.push("/chat")
  }

  const handleDeleteAccount = async () => {
    if (!user) return
    const confirmDelete = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone."
    )
    if (!confirmDelete) return
  
    try {
      // delete Firestore user document
      await deleteDoc(doc(db, "users", user.uid))
  
      // delete Firebase auth user
      await deleteUser(user)
  
      // after deletion, redirect to login page
      router.push("/login")
    } catch (error: any) {
      if (error.code === "auth/requires-recent-login") {
        alert("Please logout and login again before deleting your account for security reasons.")
      } else {
        alert("Failed to delete account: " + error.message)
      }
      console.error("Delete account error:", error)
    }
  }

  if (loading) return <p className="text-center p-6 text-lg font-medium">Loading...</p>
  if (!user) return <p className="text-center p-6 text-lg font-medium">You must be logged in to view this page.</p>

  const technologies = [
    "Next.js",
    "React",
    "TypeScript",
    "Shadcn/UI",
    "Firebase SDK",
    "Firebase Storage",
    "Firestore",
    "dotenv",
    "uploadBytes",
    "Framer Motion",
  ]

  return (
    <div className="bg-gradient-to-r from-[#2D336B] via-[#7886C7] to-[#A9B5DF] min-h-screen flex items-center justify-center px-4 py-12">
      <motion.div
        className="w-full max-w-4xl bg-white rounded-2xl shadow-xl p-10 space-y-8"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-4xl font-extrabold text-center text-gray-800">
          Welcome, <span className="text-blue-700">{profileData.username}</span>
        </h1>

        <div className="text-gray-700 space-y-4">
          <p className="text-lg">
            This is a real-time messaging app built with Google Cloud technologies like Firebase SDK and Firestore.
            Messages update instantly without needing to refresh—like using a websocket!
          </p>
          <p className="text-lg">
            Through this project, I learned a lot about scalable frontend architecture and integrating real-time databases.
          </p>
        </div>

        <div>
          <h2 className="text-2xl font-semibold text-gray-800 mb-3">Technologies Used</h2>
          <div className="flex flex-wrap gap-3">
            {technologies.map((tech, index) => (
              <span
                key={index}
                className="px-4 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full shadow-sm"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        <div className="flex justify-center gap-6 pt-6">
          <button
            onClick={handleChat}
            className="px-6 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow transition-all"
          >
            Go to Chat
          </button>
          <button
            onClick={handleLogout}
            className="px-6 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-semibold shadow transition-all"
          >
            Logout
          </button>

          <button
            onClick={handleDeleteAccount}
            className="px-6 py-2 rounded-xl bg-gray-800 hover:bg-gray-900 text-white font-semibold shadow transition-all"
          >
            Delete Account
          </button>
        </div>
      </motion.div>
    </div>
  )
}
