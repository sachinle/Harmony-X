import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth, signInWithGoogle } from '../../services/firebase'
import toast from 'react-hot-toast'

const Login = () => {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await signInWithEmailAndPassword(auth, email, password)
      toast.success('Welcome back!')
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    const { error } = await signInWithGoogle()
    if (error) {
      toast.error(error)
    } else {
      toast.success('Logged in with Google')
      navigate('/')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-spotify-black">
      <div className="bg-spotify-dark p-8 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-spotify-green mb-6 text-center">Harmony X</h1>
        <h2 className="text-2xl text-white mb-6">Log in</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-spotify-gray text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-spotify-green"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-spotify-gray text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-spotify-green"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-spotify-green text-black font-bold py-3 rounded hover:bg-spotify-green-hover transition disabled:opacity-50"
          >
            {loading ? 'Logging in...' : 'Log In'}
          </button>
        </form>
        
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-spotify-gray"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-spotify-dark text-spotify-light-gray">Or</span>
          </div>
        </div>
        
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-black font-bold py-3 rounded hover:bg-gray-200 transition"
        >
          Continue with Google
        </button>
        
        <p className="text-center text-spotify-light-gray mt-6">
          Don't have an account?{' '}
          <Link to="/signup" className="text-spotify-green hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login