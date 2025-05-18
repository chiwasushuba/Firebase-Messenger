'use client'

import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import React, { useState } from 'react'
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Eye, EyeOff } from "lucide-react"
import { auth, db, githubProvider, googleProvider } from '@/utils/firebase';
import { AuthError, signInWithEmailAndPassword, signInWithPopup } from 'firebase/auth';
import { useRouter } from "next/navigation"; 
import Image from 'next/image';
import { doc, getDoc } from 'firebase/firestore';

const LoginPage = () => {
  const router = useRouter();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('')

    if(!email.trim()){
      setError("Email is empty!")
      return
    }

    if(!password.trim()){
      setError("Password is empty!")
      return
    }
    try{
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/chat")
      
    } catch (err: unknown) {
      const error = err as AuthError;
  
      switch (error.code) {
        case 'auth/user-not-found':
          setError('No account found with this email.');
          break;
        case 'auth/wrong-password':
          setError('Incorrect password.');
          break;
        case 'auth/invalid-email':
          setError('Invalid email address.');
          break;
        case 'auth/too-many-requests':
          setError('Too many failed attempts. Please try again later.');
          break;
        default:
          setError('Login failed: ' + error.message);
          break;
      }
    }
  };

  // Google Login handler
  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
  
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
  
        if (!docSnap.exists()) {
          await auth.signOut();
          setError('No account found. Please sign up first.');
          return;
        }
  
        router.push('/chat');
      }
    } catch (e: unknown) {
      setError('Error logging in with Google');
    }
  };
  

  // GitHub login handler
  const handleGithubLogin = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
  
      if (user) {
        const docRef = doc(db, 'users', user.uid);
        const docSnap = await getDoc(docRef);
  
        if (!docSnap.exists()) {
          await auth.signOut();
          setError('No account found. Please sign up first.');
          return;
        }
  
        router.push('/chat');
      }
    } catch (e: unknown) {
      setError('Error logging in with GitHub');
    }
  };
  
  

  return (
    <div className='min-h-screen flex justify-center items-center bg-gradient-to-r from-[#2D336B] via-[#7886C7] to-[#A9B5DF]'>  
      <div className='w-[50em] h-[26em] flex'>
        <motion.div className="w-1/2 h-full bg-gray-200 flex flex-col border-solid border p-10 gap-4"
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 1}}
        >
          <form onSubmit={handleLogin} className="flex flex-col gap-3 h-full justify-between">
            <div className='flex flex-col gap-6'>
              <div className='flex flex-col'>
                <Label className='font-mono text-2xl font-bold'>Welcome Back</Label>
                <Label className='text-sm text-gray-500'>Please sign in to your account</Label>
              </div>

              <div className='flex flex-col gap-2'>
                <Label className='font-mono text-sm'>Email:</Label>
                <Input 
                  className='border-[#A9B5DF] font-mono' 
                  name="email" 
                  placeholder='Email'
                  value={email}
                  onChange={(e) => {setEmail(e.target.value); setError('')}} 
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
            </div>

            <div className='flex flex-col justify-center items-center gap-2'>
              <div className='flex items-center gap-3'>
                <Checkbox className="bg-white border border-gray-400 hover:border-black" />
                <Label>Remember me</Label>
              </div>
              {error && (
                <motion.p
                  className="text-red-500 text-sm font-mono text-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {error}
                </motion.p>
              )}
              <Button type="submit" className='w-1/2 font-mono hover:bg-gray-700 active:bg-gray-600 cursor-pointer'>Login</Button>
            </div>
          </form>
          <div className='flex justify-center gap-6'>
                <Button
                  onClick={handleGoogleLogin}
                  className='w-auto p-2 flex items-center justify-center bg-white hover:bg-gray-700 active:bg-gray-600'
                >
                  <Image
                    src='/googleLogo.webp'
                    alt='Google'
                    width={30}
                    height={30}
                  />
                </Button>

                <Button
                  onClick={handleGithubLogin}
                  className='w-auto p-2 flex items-center justify-center bg-white hover:bg-gray-200 active:bg-gray-600'
                >
                  <Image
                    src='/githubLogo.png'
                    alt='GitHub'
                    width={30}
                    height={30}
                  />
                </Button>
              </div>
        </motion.div>

        <Link href="/signup" className="w-1/2 h-full" onClick={() => { setEmail(""); setPassword(""); }}>
          <motion.div
            initial={{ x: -400 }}
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
              Signup
            </motion.span>

            <motion.span
              className="text-sm font-serif text-white"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1.5 }}
            >
              No Account?
            </motion.span>
          </motion.div>
        </Link>
      </div>
    </div>
  )
}

export default LoginPage;
