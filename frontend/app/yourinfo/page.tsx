"use client"

import { useState, useEffect, useRef } from "react"
import { setDoc, doc } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { db } from "@/utils/firebase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter
} from "@/components/ui/card"
import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from "@/components/ui/avatar"
import { X } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL
} from "firebase/storage"
import { v4 as uuidv4 } from "uuid"

export default function ProfileSetup() {
  const [username, setUsername] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [bio, setBio] = useState("")
  const [profile, setProfile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const inputRef = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const storage = getStorage()

  console.log(storage)
  
  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview)
    }
  }, [imagePreview])

  const validateForm = () => {
    if (!username.trim()) return "Username is required"
    if (!firstName.trim()) return "First Name is required"
    if (!lastName.trim()) return "Last Name is required"
    if (!bio.trim()) return "Bio is required"
    return ""
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    const auth = getAuth()
    const user = auth.currentUser

    if (!user) {
      setError("You must be logged in to save your profile")
      setIsSubmitting(false)
      return
    }

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      setIsSubmitting(false)
      return
    }

    try {
      let profileImageUrl = ""

      if (profile) {
        const imageRef = ref(
          storage,
          `profiles/${user.uid}/${uuidv4()}-${profile.name}`
        )
        await uploadBytes(imageRef, profile)
        profileImageUrl = await getDownloadURL(imageRef)
        alert("image uploaded!")
      }

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        username,
        firstName,
        lastName,
        bio,
        profileImageUrl,
        createdAt: new Date()
      })

      router.push("/")
    } catch (err) {
      console.error("Error saving profile:", err)
      setError("Failed to save profile. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setProfile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const removeImage = () => {
    setProfile(null)
    setImagePreview("")
  }

  const handleInputClick = () => {
    inputRef.current?.click()
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="max-w-md mx-auto shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            Set Up Your Profile
          </CardTitle>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {/* Profile Image */}
            <div className="flex flex-col items-center space-y-3">
              <Avatar className="w-24 h-24 border-2 border-border">
                {imagePreview ? (
                  <AvatarImage src={imagePreview} alt="Profile preview" />
                ) : (
                  <AvatarFallback className="text-xl">
                    {firstName && lastName
                      ? `${firstName[0]}${lastName[0]}`
                      : "?"}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex items-center gap-2">
                <label className="cursor-pointer">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    ref={inputRef}
                  />
                  <Button
                    onClick={handleInputClick}
                    type="button"
                    variant="outline"
                    size="sm"
                  >
                    Upload Photo
                  </Button>
                </label>

                {imagePreview && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={removeImage}
                    className="h-9 w-9 p-0"
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove image</span>
                  </Button>
                )}
              </div>
            </div>

            {/* Basic Information */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  placeholder="Enter your username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input
                    id="firstName"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input
                    id="lastName"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell us about yourself"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="mt-3 flex flex-col gap-2">
            {error && <Label className="text-red-500">{error}</Label>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save Profile"}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
