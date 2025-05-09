'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@radix-ui/react-label';
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { AuthError } from "firebase/auth";
import { Eye, EyeOff } from 'lucide-react';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup } from 'firebase/auth';
import { auth, googleProvider, githubProvider } from '@/utils/firebase';  // Update to include OAuth providers
import { useRouter } from 'next/navigation';
import Image from 'next/image';

const SignupPage = () => {
  const router = useRouter();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  // Email signup handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if(!email.trim()){
      setError("Email is empty!")
      return
    }
    if(!username.trim()){
      setError("Username is username!")
      return
    }
    if(!password.trim()){
      setError("Password is empty!")
      return
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      router.push('/');
    } catch (err: unknown) {
      const error = err as AuthError;
  
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('This email is already in use.');
          break;
        case 'auth/invalid-email':
          setError('The email address is not valid.');
          break;
        case 'auth/weak-password':
          setError('The password is too weak.');
          break;
        default:
          setError('Error creating account: ' + error.message);
          break;
      }
    }
  };

  // Google signup handler
  const handleGoogleSignup = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      if (user) {
        router.push('/');
      }
    } catch (e: unknown) {
      setError('Error logging in with Google');
    }
  };

  // GitHub signup handler
  const handleGithubSignup = async () => {
    try {
      const result = await signInWithPopup(auth, githubProvider);
      const user = result.user;
      if (user) {
        router.push('/');
      }
    } catch (e: unknown) {
      setError('Error logging in with GitHub');
    }
  };

  return (
    <div className='min-h-screen flex justify-center items-center bg-gradient-to-r from-[#2D336B] via-[#7886C7] to-[#A9B5DF]'>
      <div className='w-[50em] h-[26em] flex'>
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

        <motion.div
          className="w-1/2 h-full bg-gray-200 flex flex-col border-solid border pl-10 pr-10 pt-5 gap-4"
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
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
              />

              <Label className='font-mono text-sm'>Username:</Label>
              <Input
                className='border-[#A9B5DF] font-mono'
                name="username"
                placeholder='Username'
                value={username}
                onChange={(e) => { setUsername(e.target.value); setError(''); }}
              />

              <Label className='font-mono text-sm'>Password:</Label>
              <div className="relative">
                <Input
                  type={isPasswordVisible ? "text" : "password"}
                  className="border-[#A9B5DF] font-mono w-full"
                  name="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setError(''); }}
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
              <div className='flex justify-between gap-6'>
                <Button
                  onClick={handleGoogleSignup}
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
                  onClick={handleGithubSignup}
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

            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
