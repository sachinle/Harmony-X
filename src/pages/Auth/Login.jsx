import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, signInWithGoogle } from '../../services/firebase'
import { Music2 } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading]   = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (err) {
      const msg = err.code === 'auth/invalid-credential'
        ? 'Incorrect email or password.'
        : err.message
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) toast.error(error)
    else { toast.success('Logged in!'); navigate('/') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-spotify-black flex flex-col items-center justify-center px-4">
      <div className="w-full max-w-[420px]">
        <div className="flex justify-center mb-8">
          <Music2 className="text-white" size={40} />
        </div>

        <div className="bg-[#121212] rounded-xl px-10 py-8 border border-white/10">
          <h1 className="text-white text-3xl font-bold text-center mb-8">
            Log in to Harmony X
          </h1>

          <button
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-white/30 text-white font-bold py-3 rounded-full hover:border-white transition mb-4 text-sm disabled:opacity-50"
          >
            <svg width="18" height="18" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/15" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[#121212] px-4 text-spotify-light-gray text-sm">or</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-white font-bold text-sm mb-2">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
                className="w-full bg-[#242424] border border-white/20 text-white px-4 py-3 rounded-md focus:outline-none focus:border-white text-sm placeholder-spotify-light-gray"
              />
            </div>
            <div>
              <label className="block text-white font-bold text-sm mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                className="w-full bg-[#242424] border border-white/20 text-white px-4 py-3 rounded-md focus:outline-none focus:border-white text-sm placeholder-spotify-light-gray"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-spotify-green text-black font-bold py-3 rounded-full hover:bg-spotify-green-hover transition hover:scale-105 disabled:opacity-50 mt-2"
            >
              {loading ? 'Logging in…' : 'Log In'}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/10 text-center">
            <p className="text-spotify-light-gray text-sm">
              Don't have an account?{' '}
              <Link to="/signup" className="text-white font-bold hover:underline">
                Sign up for Harmony X
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login
