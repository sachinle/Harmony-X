import React, { useState } from 'react'

/**
 * UserAvatar
 * - Google users (photoURL present): shows the Google photo; falls back to anime avatar on load error
 * - Email users (no photoURL): shows a deterministic DiceBear anime avatar based on name/email
 *
 * Props:
 *   user       — { name, email, photoURL }
 *   size       — number in px (default 32)
 *   className  — extra Tailwind classes
 */
const UserAvatar = ({ user, size = 32, className = '' }) => {
  const [imgError, setImgError] = useState(false)

  const seed = encodeURIComponent(user?.name || user?.email || 'user')
  // big-smile gives bright bitmoji-style faces with vivid backgrounds
  const animeUrl = `https://api.dicebear.com/9.x/big-smile/svg?seed=${seed}&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,c1f0d1&backgroundType=solid`

  const style = { width: size, height: size, minWidth: size, minHeight: size }

  // Show anime avatar when: no photoURL OR photo failed to load
  if (!user?.photoURL || imgError) {
    return (
      <img
        src={animeUrl}
        alt={user?.name || 'User'}
        style={style}
        className={`rounded-full object-cover bg-[#1a1a1a] ${className}`}
      />
    )
  }

  return (
    <img
      src={user.photoURL}
      alt={user?.name || 'User'}
      style={style}
      className={`rounded-full object-cover ${className}`}
      onError={() => setImgError(true)}
    />
  )
}

export default UserAvatar
