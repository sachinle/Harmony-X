import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { auth } from '../../services/firebase'
import { supabase } from '../../services/supabase'
import toast from 'react-hot-toast'

const Signup = () => {
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password)
      await updateProfile(user, { displayName: name })
      
      // Create user in Supabase
      await supabase.from('users').insert([{
        id: user.uid,
        name,
        email
      }])
      
      toast.success('Account created!')
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-spotify-black">
      <div className="bg-spotify-dark p-8 rounded-lg w-full max-w-md">
        <h1 className="text-3xl font-bold text-spotify-green mb-6 text-center">Harmony X</h1>
        <h2 className="text-2xl text-white mb-6">Sign up</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-spotify-gray text-white px-4 py-3 rounded focus:outline-none focus:ring-2 focus:ring-spotify-green"
            required
          />
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
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>
        
        <p className="text-center text-spotify-light-gray mt-6">
          Already have an account?{' '}
          <Link to="/login" className="text-spotify-green hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Signup