import React, { useState, useEffect } from 'react'

const Home = ({ sidebarOpen = true, reports = [] }) => {
    const [selectedOrg, setSelectedOrg] = useState(null)

    useEffect(() => {
        // Load selected organization from localStorage
        const loadSelectedOrg = () => {
            const savedSelectedOrg = localStorage.getItem('selectedOrganization')
            if (savedSelectedOrg) {
                setSelectedOrg(JSON.parse(savedSelectedOrg))
            } else {
                setSelectedOrg(null)
            }
        }

        // Load initially
        loadSelectedOrg()

        // Poll for changes every 500ms
        const interval = setInterval(loadSelectedOrg, 500)

        return () => clearInterval(interval)
    }, [])

    // Filter tickets by selected organization
    const orgTickets = selectedOrg
        ? reports.filter(r => r.organization === selectedOrg.name)
        : []

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-red-100 text-red-700'
            case 'In Progress':
                return 'bg-yellow-100 text-yellow-700'
            case 'Solved':
                return 'bg-green-100 text-green-700'
            default:
                return 'bg-blue-100 text-blue-700'
        }
    }

    return (
        <div className={`flex-1 h-screen bg-gray-100 pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'}`}>
            <div className="p-6 md:p-8">
                {!selectedOrg ? (
                    <div className='bg-white rounded-xl p-8 text-center shadow-md'>
                        <p className="text-xl font-semibold text-gray-600">No Organization Selected</p>
                        <p className="text-sm text-gray-500 mt-2">Please select an organization from the dropdown menu</p>
                    </div>
                ) : (
                    <>
                        <div className='mb-6'>
                            <h1 className="text-2xl font-bold text-gray-800">{selectedOrg.name}</h1>
                            <p className="select-none text-sm text-gray-500">{orgTickets.length} ticket{orgTickets.length !== 1 ? 's' : ''}</p>
                        </div>

                        {orgTickets.length === 0 ? (
                            <div className='bg-white rounded-lg p-8 text-center shadow-md'>
                                <p className='text-gray-500 text-lg'>No tickets for this organization yet.</p>
                            </div>
                        ) : (
                            <div className='space-y-4'>
                                {orgTickets.map((report, index) => (
                                    <div key={index} className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'>
                                        <div className='flex justify-between items-start mb-3'>
                                            <div>
                                                <h3 className='text-xl font-bold text-gray-800'>{report.topicName}</h3>
                                                <p className='text-gray-600 mt-1'>{report.message}</p>
                                            </div>
                                            <span className={`px-4 py-1 rounded-full text-sm font-semibold select-none ${getStatusBadgeColor(report.status)}`}>
                                                {report.status}
                                            </span>
                                        </div>
                                        <div className='flex justify-between items-center pt-3 border-t border-gray-200'>
                                            <p className='text-sm text-gray-500'>
                                                <span className='font-semibold'>{report.topic}</span>
                                            </p>
                                            <span className='text-sm text-gray-500 select-none'>{report.date}</span>
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