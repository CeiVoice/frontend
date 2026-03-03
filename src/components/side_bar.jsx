import React, { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Side = ({ isOpen = true }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    const load = () => {
      const org = JSON.parse(localStorage.getItem('selectedOrganization') || 'null')
      setIsAdmin(org?.isAdmin === true)
    }
    load()
    const iv = setInterval(load, 500)
    return () => clearInterval(iv)
  }, [])

  const linkClass = (path) =>
    `select-none text-left bg-transparent hover:text-gray-400 ${location.pathname === path ? 'text-[#4377E5] font-bold' : 'text-black'
    }`

  return (
    <aside
      className={`fixed left-0 top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-56 sm:w-60 md:w-64 bg-white shadow-md border-r border-gray-200 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className='h-full overflow-y-auto'>
        <div className='flex flex-col gap-6 px-6'>
          <button onClick={() => navigate('/tracking')} className={`mt-8 ${linkClass('/tracking')}`}>Tickets</button>
          {isAdmin && <button onClick={() => navigate('/user')} className={linkClass('/user')}>User</button>}
          {isAdmin && <button onClick={() => navigate('/admin')} className={linkClass('/admin')}>Admin</button>}
          {isAdmin && <button onClick={() => navigate('/dashboard')} className={linkClass('/dashboard')}>Dashboard</button>}
        </div>
      </div>
    </aside>
  )
}

export default Side