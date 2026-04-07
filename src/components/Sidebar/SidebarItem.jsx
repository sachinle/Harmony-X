import React from 'react'
import { NavLink } from 'react-router-dom'

const SidebarItem = ({ to, icon: Icon, label }) => {
  return (
    <NavLink 
      to={to} 
      className={({ isActive }) => `sidebar-item ${isActive ? 'sidebar-item-active' : ''}`}
    >
      <Icon size={24} />
      <span>{label}</span>
    </NavLink>
  )
}

export default SidebarItem