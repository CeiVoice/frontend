import React, { useState, useEffect } from 'react'
import { useOutletContext } from 'react-router-dom'
import API_BASE from '../../config/api'

const Home = () => {
    const { sidebarOpen = true } = useOutletContext() ?? {}
    const [selectedOrg, setSelectedOrg] = useState(null)
    const [tickets, setTickets] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        const loadSelectedOrg = () => {
            const saved = localStorage.getItem('selectedOrganization')
            const org = saved ? JSON.parse(saved) : null
            setSelectedOrg(prev => {
                if (prev?.id !== org?.id) return org
                return prev
            })
        }
        loadSelectedOrg()
        const interval = setInterval(loadSelectedOrg, 500)
        return () => clearInterval(interval)
    }, [])

    useEffect(() => {
        if (!selectedOrg) {
            setTickets([])
            return
        }

        const fetchTickets = async () => {
            const token = localStorage.getItem('authToken')
            if (!token) return

            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`${API_BASE}/api/tickets/org/${selectedOrg.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    }
                })
                const data = await res.json()
                if (res.ok) {
                    setTickets(data.result || [])
                } else {
                    setError(data.error || 'Failed to fetch tickets')
                }
            } catch (err) {
                setError('Something went wrong')
            } finally {
                setLoading(false)
            }
        }

        fetchTickets()
    }, [selectedOrg?.id])

    return (
        <div className={`flex-1 h-screen bg-gray-100 pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'}`}>
            <div className="p-6 md:p-8">
                {!selectedOrg ? (
                    <div className='bg-white shadow-md p-8 rounded-xl text-center'>
                        <p className="font-semibold text-gray-600 text-xl">No Organization Selected</p>
                        <p className="mt-2 text-gray-500 text-sm">Please select an organization from the dropdown menu</p>
                    </div>
                ) : loading ? (
                    <div className='bg-white shadow-md p-8 rounded-xl text-center'>
                        <p className='text-gray-500'>Loading tickets...</p>
                    </div>
                ) : error ? (
                    <div className='bg-white shadow-md p-8 rounded-xl text-center'>
                        <p className='text-red-500'>{error}</p>
                    </div>
                ) : (
                    <>
                        <div className='mb-6'>
                            <h1 className="font-bold text-gray-800 text-2xl">{selectedOrg.name}</h1>
                            <p className="text-gray-500 text-sm select-none">{tickets.length} ticket group{tickets.length !== 1 ? 's' : ''}</p>
                        </div>

                        {tickets.length === 0 ? (
                            <div className='bg-white shadow-md p-8 rounded-lg text-center'>
                                <p className='text-gray-500 text-lg'>No tickets for this organization yet.</p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {tickets.map((group) => (
                                    <div key={group.id} className='bg-white shadow-md hover:shadow-lg p-6 rounded-xl transition-shadow'>
                                        <div className='flex justify-between items-start mb-3'>
                                            <h3 className='font-bold text-gray-800 text-xl'>{group.Title}</h3>
                                            {group.Deadline && (
                                                <span className='bg-blue-500 px-3 py-1 rounded-full text-white text-xs select-none'>
                                                    Due {new Date(group.Deadline).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                        <div className='flex justify-between items-center pt-3 border-gray-200 border-t'>
                                            <span className='text-gray-400 text-xs select-none'>Group #{group.id}</span>
                                            <span className='text-gray-400 text-xs select-none'>
                                                Created {new Date(group.CreateAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}

export default Home