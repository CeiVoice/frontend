import React from 'react'

const Home = ({ sidebarOpen = true }) => {
    return (
        <div className={`flex-1 h-screen bg-gray-100 pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'}`}>
            <div className="p-6 md:p-8">
                <p className="text-xl font-semibold">Home</p>
            </div>
        </div>
    )
}

export default Home