import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ProtectedRoute from './ProtectedRoute'
import Home from '../pages/Home'
import Search from '../pages/Search'
import Library from '../pages/Library'
import PlaylistDetails from '../pages/PlaylistDetails'
import Login from '../pages/Auth/Login'
import Signup from '../pages/Auth/Signup'

const AppRouter = () => {
  const { user } = useSelector((state) => state.user)

  return (
    <Routes>
      <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
      <Route path="/signup" element={!user ? <Signup /> : <Navigate to="/" />} />
      
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<Home />} />
        <Route path="/search" element={<Search />} />
        <Route path="/library" element={<Library />} />
        <Route path="/playlist/:id" element={<PlaylistDetails />} />
        <Route path="/liked" element={<Library filter="liked" />} />
      </Route>
    </Routes>
  )
}

export default AppRouter