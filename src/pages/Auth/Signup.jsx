import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { supabase } from '../../services/supabase'
import { Music2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const [name, setName]         = useState('')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: name.trim() })
      await supabase.from('users').upsert({
        id: user.uid, name: name.trim(), email: email.trim(),
      }, { onConflict: 'id' })
      toast.success('Account created! Welcome 🎵')
      navigate('/')
    } catch (err) {
      const msg = err.code === 'auth/email-already-in-use'
        ? 'An account with this email already exists.'
        : err.message
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-spotify-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-8">
          <Music2 className="text-white" size={40} />
        </div>

        <div className="bg-[#121212] rounded-xl px-10 py-8 border border-white/10">
          <h1 className="text-white text-3xl font-bold text-center mb-2">Sign up free</h1>
          <p className="text-spotify-light-gray text-center text-sm mb-8">to start listening on Harmony X</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-bold text-sm mb-2">What's your name?</label>
              <input
                type="text"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your name"
                required
                className="w-full bg-[#242424] border border-white/20 text-white px-4 py-3 rounded-md focus:outline-none focus:border-white text-sm placeholder-spotify-light-gray"
              />
            </div>
            <div>
              <label className="block text-white font-bold text-sm mb-2">What's your email?</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                className="w-full bg-[#242424] border border-white/20 text-white px-4 py-3 rounded-md focus:outline-none focus:border-white text-sm placeholder-spotify-light-gray"
              />
            </div>
            <div>
              <label className="block text-white font-bold text-sm mb-2">Create a password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Create a password"
                required
                minLength={6}
                className="w-full bg-[#242424] border border-white/20 text-white px-4 py-3 rounded-md focus:outline-none focus:border-white text-sm placeholder-spotify-light-gray"
              />
              <p className="text-spotify-light-gray text-xs mt-1">Use at least 6 characters.</p>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-spotify-green-hover transition hover:scale-105 disabled:opacity-50 mt-2"
            >
              {loading ? 'Creating account…' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-spotify-light-gray text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-white font-bold hover:underline">Log in here</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Signup
