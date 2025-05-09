'use client'

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "@/utils/firebase";
import { useRouter } from "next/navigation"; 
import axios from 'axios';

const SignupPage = () => {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); 
  
    try {
      // 1. Pre-check if username is taken
      const preCheck = await axios.post(`${process.env.NEXT_PUBLIC_PORT}/api/user/check`, { username });
      if (preCheck.status !== 200) {
        setError("Username already taken.");
        return;
      }
    
      // 2. Firebase create user
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCred.user, { displayName: username });
      const token = await userCred.user.getIdToken();
    
      // 3. Send token to backend to set the cookie
      await axios.post(
        `${process.env.NEXT_PUBLIC_PORT}/api/user/firebase-login`,
        { idToken: token },
        { withCredentials: true } // important to enable cookie
      );
    
      // 4. Now call signup without token in header
      const resp = await axios.post(
        `${process.env.NEXT_PUBLIC_PORT}/api/user/signup`,
        { email, username },
        { withCredentials: true } // needed to send cookie
      );
    
      if (resp.status === 200) {
        router.push("/");
      }
    } catch (err: any) {
      console.error("Signup failed:", err);
  
      if (err.code?.startsWith("auth/")) {
        // Firebase Auth errors
        const messages: Record<string, string> = {
          "auth/email-already-in-use": "Email is already in use.",
          "auth/invalid-email": "Invalid email format.",
          "auth/weak-password": "Password is too weak.",
        };
        setError(messages[err.code] || err.message || "An unexpected Firebase error occurred.");
      } else if (axios.isAxiosError(err)) {
        // Axios (backend) errors
        const msg = err.response?.data?.message || "Server error. Please try again.";
        setError(err.response?.status === 409 ? msg : "Something went wrong.");
      } else {
        setError("An unknown error occurred.");
      }
    }
  };
  

  return (
    <div className='min-h-screen flex justify-center items-center bg-gradient-to-r from-[#2D336B] via-[#7886C7] to-[#A9B5DF'>   
      <div className='w-[50em] h-[24em] flex'>

        <Link href="/login" className="w-1/2 h-full" onClick={() => { setEmail(""); setPassword(""); }}>
          <motion.div
            initial={{ x: 400 }}
            animate={{ x: 0 }}
            transition={{ type: "tween" }}
            className="w-full h-full bg-[#7886C7] flex flex-col justify-center items-center hover:brightness-110 transition"
          >
            <motion.span
              className="text-4xl font-mono text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              Login
            </motion.span>

            <motion.span
              className="text-sm font-serif text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              You already have an account?
            </motion.span>
          </motion.div>
        </Link>

        <motion.div className="w-1/2 h-full bg-gray-200 flex flex-col border-solid border pl-10 pr-10 pt-5 gap-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1 }}
        >
          <form onSubmit={handleSubmit} className="flex flex-col gap-4 h-full">
            <div className='flex flex-col gap-2'>
              <Label className='font-mono text-2xl font-bold'>Create Account</Label>

              <Label className='font-mono text-sm'>Email:</Label>
              <Input 
                className='border-[#A9B5DF] font-mono' 
                name="email" 
                placeholder='Email'
                value={email}
                onChange={(e) => {setEmail(e.target.value); setError('')}} 
              />

              <Label className='font-mono text-sm'>Username:</Label>
              <Input 
                className='border-[#A9B5DF] font-mono' 
                name="username" 
                placeholder='Username' 
                value={username}
                onChange={(e) => {setUsername(e.target.value); setError('')}}
              />

              <Label className='font-mono text-sm'>Password:</Label>
              <div className="relative">
                <Input
                  type={isPasswordVisible ? "text" : "password"}
                  className="border-[#A9B5DF] font-mono w-full"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => {setPassword(e.target.value); setError('')}}
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((prev) => !prev)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                >
                  {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">{isPasswordVisible ? "Hide password" : "Show password"}</span>
                </button>
              </div>
            </div>

            <div className='flex flex-col justify-center items-center gap-2'>
              {error && (
                <motion.p
                  className="text-red-500 text-sm font-mono text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}

              <Button type="submit" className='w-1/2 font-mono hover:bg-gray-700 active:bg-gray-600 cursor-pointer'>
                Signup
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
