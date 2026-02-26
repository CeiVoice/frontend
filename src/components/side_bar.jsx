import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'

const Side = ({ isOpen = true }) => {
  const navigate = useNavigate()
  const location = useLocation()

  const linkClass = (path) =>
    `select-none text-left bg-transparent hover:text-gray-400 ${location.pathname === path ? 'text-[#4377E5] font-bold' : 'text-black'
    }`

  return (
    <aside
      className={`fixed left-0 top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-56 sm:w-60 md:w-64 bg-white shadow-md border-r border-gray-200 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className='h-full overflow-y-auto'>
        <div className='flex flex-col px-6 gap-6'>
          <button onClick={() => navigate('/tracking')} className={`mt-8 ${linkClass('/tracking')}`}>TRACKING</button>
          <button onClick={() => navigate('/admin')} className={linkClass('/admin')}>Admin</button>
          <button className='select-none text-left bg-transparent text-black hover:text-gray-400'>Assignee</button>
        </div>
      </div>
    </aside>
  )
}

export default Side