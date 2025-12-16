import React from 'react'

const Side = ({ isOpen = true }) => {
  return (
    <aside
      className={`fixed left-0 top-16 md:top-20 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] w-56 sm:w-60 md:w-64 bg-white shadow-md border-r border-gray-200 z-40 transform transition-transform duration-300 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
    >
      <div className='h-full overflow-y-auto'>
        <div className='flex flex-col px-6 gap-6'>
          <button className='text-left bg-transparent text-black mt-8 font-bold hover:text-gray-400'>PLANNING</button>
          <button className='text-left bg-transparent text-black hover:text-gray-400'>Timeline</button>
          <button className='text-left bg-transparent text-black hover:text-gray-400'>Board</button>
          <button className='text-left bg-transparent text-black hover:text-gray-400'>Issues</button>
          <button className='text-left bg-transparent text-black hover:text-gray-400'>Add view</button>
          <button className='text-left bg-transparent text-black font-bold hover:text-gray-400'>DEVELOPMENT</button>
          <button className='text-left bg-transparent text-black hover:text-gray-400'>Code</button>
        </div>
      </div>
    </aside>
  )
}

export default Side