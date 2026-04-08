import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ProtectedRoute from './ProtectedRoute'
import Home from '../pages/Home'
import Search from '../pages/Search'
import Library from '../pages/Library'
import PlaylistDetails from '../pages/PlaylistDetails'
import LikedSongs from '../pages/LikedSongs'
import Account from '../pages/Account'
import Login from '../pages/Auth/Login'
import Signup from '../pages/Auth/Signup'

const AppRouter = () => {
  const { user } = useSelector((state) => state.user)

  return (
    <Routes>
      <Route path="/login"  element={!user ? <Login />  : <Navigate to="/" replace />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" replace />} />

      <Route element={<ProtectedRoute />}>
        <Route path="/"             element={<Home />} />
        <Route path="/search"       element={<Search />} />
        <Route path="/library"      element={<Library />} />
        <Route path="/liked"        element={<LikedSongs />} />
        <Route path="/playlist/:id" element={<PlaylistDetails />} />
        <Route path="/account"      element={<Account />} />
        <Route path="/profile"      element={<Account />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
