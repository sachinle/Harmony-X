import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import {
  updatePassword, reauthenticateWithCredential,
  EmailAuthProvider, updateProfile,
} from 'firebase/auth'
import { auth, logout } from '../services/firebase'
import { updateUserName } from '../services/supabase'
import { setUser, clearUser } from '../store/slices/userSlice'
import { LogOut } from 'lucide-react'
import toast from 'react-hot-toast'
import UserAvatar from '../components/UserAvatar/UserAvatar'

const Section = ({ title, children }) => (
  <div className="bg-[#181818] rounded-lg p-6 mb-4">
    <h2 className="text-white font-bold text-lg mb-4">{title}</h2>
    {children}
  </div>
)

const Account = () => {
  const dispatch  = useDispatch()
  const navigate  = useNavigate()
  const { user }  = useSelector((state) => state.user)

  const [name, setName]               = useState(user?.name || '')
  const [nameLoading, setNameLoading] = useState(false)
  const [currentPass, setCurrentPass] = useState('')
  const [newPass, setNewPass]         = useState('')
  const [confirmPass, setConfirmPass] = useState('')
  const [passLoading, setPassLoading] = useState(false)

  const handleUpdateName = async (e) => {
    e.preventDefault()
    if (!name.trim() || name === user.name) return
    setNameLoading(true)
    try {
      await updateProfile(auth.currentUser, { displayName: name.trim() })
      await updateUserName(user.uid, name.trim())
      dispatch(setUser({ ...user, name: name.trim() }))
      toast.success('Name updated!')
    } catch {
      toast.error('Failed to update name')
    } finally {
      setNameLoading(false)
    }
  }

  const handleUpdatePassword = async (e) => {
    e.preventDefault()
    if (newPass !== confirmPass) { toast.error('Passwords do not match'); return }
    if (newPass.length < 6)     { toast.error('Password must be at least 6 characters'); return }
    setPassLoading(true)
    try {
      const credential = EmailAuthProvider.credential(user.email, currentPass)
      await reauthenticateWithCredential(auth.currentUser, credential)
      await updatePassword(auth.currentUser, newPass)
      toast.success('Password updated!')
      setCurrentPass(''); setNewPass(''); setConfirmPass('')
    } catch (err) {
      toast.error(err.code === 'auth/wrong-password' ? 'Current password is incorrect' : 'Failed to update password')
    } finally {
      setPassLoading(false)
    }
  }

  const handleLogout = async () => {
    await logout()
    dispatch(clearUser())
    navigate('/login')
  }

  return (
    <div className="px-8 pb-36 pt-8 max-w-2xl">
      <h1 className="text-white text-3xl font-bold mb-2">Account</h1>
      <p className="text-spotify-light-gray text-sm mb-8">{user?.email}</p>

      <Section title="Profile">
        <div className="flex items-center gap-4 mb-6">
          <UserAvatar user={user} size={80} />
          <div>
            <p className="text-white font-bold text-xl">{user?.name}</p>
            <p className="text-spotify-light-gray text-sm">{user?.email}</p>
          </div>
        </div>
        <form onSubmit={handleUpdateName} className="space-y-3">
          <div>
            <label className="block text-spotify-light-gray text-sm mb-1">Display name</label>
            <input value={name} onChange={e => setName(e.target.value)}
              className="w-full bg-[#282828] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-spotify-green text-sm" />
          </div>
          <button type="submit" disabled={nameLoading || !name.trim() || name === user?.name}
            className="bg-white text-black font-bold px-5 py-2.5 rounded-full text-sm hover:bg-white/90 disabled:opacity-40 transition">
            {nameLoading ? 'Saving…' : 'Save name'}
          </button>
        </form>
      </Section>

      <Section title="Change password">
        <form onSubmit={handleUpdatePassword} className="space-y-3">
          {[
            { label: 'Current password', val: currentPass, set: setCurrentPass },
            { label: 'New password',     val: newPass,     set: setNewPass },
            { label: 'Confirm new password', val: confirmPass, set: setConfirmPass },
          ].map(({ label, val, set }) => (
            <div key={label}>
              <label className="block text-spotify-light-gray text-sm mb-1">{label}</label>
              <input type="password" value={val} onChange={e => set(e.target.value)} required minLength={6}
                className="w-full bg-[#282828] text-white px-4 py-3 rounded-md focus:outline-none focus:ring-2 focus:ring-spotify-green text-sm" />
            </div>
          ))}
          <button type="submit" disabled={passLoading || !currentPass || !newPass || !confirmPass}
            className="bg-white text-black font-bold px-5 py-2.5 rounded-full text-sm hover:bg-white/90 disabled:opacity-40 transition">
            {passLoading ? 'Updating…' : 'Update password'}
          </button>
        </form>
      </Section>

      <Section title="Sign out">
        <p className="text-spotify-light-gray text-sm mb-4">
          Signed in as <strong className="text-white">{user?.email}</strong>
        </p>
        <button onClick={handleLogout}
          className="flex items-center gap-2 border border-white/30 text-white font-bold px-5 py-2.5 rounded-full text-sm hover:border-white transition">
          <LogOut size={16} />
          Log out
        </button>
      </Section>
    </div>
  )
}

export default Account
