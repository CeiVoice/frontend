import React from 'react';
import { LuSend, LuWrench } from "react-icons/lu";
import { MdAccessTime } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io"
import { FiSearch } from "react-icons/fi";
const Tracking = ({ reports, sidebarOpen }) => {
    const containerClasses = `w-full h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'
        }`;

    const totalTickets = reports.length;
    const activeTickets = reports.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    const pendingTickets = reports.filter(r => r.status === 'Pending').length;
    const inProgressTickets = reports.filter(r => r.status === 'In Progress').length;
    const solvedTickets = reports.filter(r => r.status === 'Solved').length;

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-red-100 text-red-700';
            case 'In Progress':
                return 'bg-yellow-100 text-yellow-700';
            case 'Solved':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    const StatCard = ({ label, count, icon }) => (
        <div className='bg-white rounded-2xl p-6 shadow-md border-2 border-blue-200'>
            <p className='text-gray-600 text-lg mb-3'>{label}</p>
            <div className='flex items-center justify-between'>
                <p className='text-4xl font-bold text-gray-800'>{count}</p>
                <span className='text-3xl'>{icon}</span>
            </div>
        </div>
    );

    return (
        <div className={containerClasses}>
            <div className='p-6 md:p-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10'>
                    <StatCard label="Active Tickets" count={activeTickets} icon={<LuSend />} />
                    <StatCard label="Pending" count={pendingTickets} icon={<MdAccessTime />} />
                    <StatCard label="In Progress" count={inProgressTickets} icon={<LuWrench />} />
                    <StatCard label="Solved" count={solvedTickets} icon={<IoMdCheckmarkCircleOutline />} />
                </div>

                <div className='flex gap-4 mb-8'>
                    <div className='relative flex-1'>
                        <input
                            type="text"
                            placeholder="Search"
                            className='w-full px-4 py-2 rounded-3xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <span className='absolute right-3 top-3 text-gray-400'>{<FiSearch />}</span>
                    </div>
                </div>

                {reports.length === 0 ? (
                    <div className='bg-gray-50 rounded-lg p-8 text-center'>
                        <p className='text-gray-500 text-lg'>No submissions yet. Create a report to get started.</p>
                    </div>
                ) : (
                    <div className='space-y-4'>
                        {reports.map((report, index) => (
                            <div key={index} className='bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow'>
                                <div className='flex justify-between items-start mb-3'>
                                    <div>
                                        <h3 className='text-xl font-bold text-gray-800'>{report.topicName}</h3>
                                        <p className='text-gray-600 mt-1'>{report.message}</p>
                                    </div>
                                    <span className={`px-4 py-1 rounded-full text-sm font-semibold ${getStatusBadgeColor(report.status)}`}>
                                        {report.status}
                                    </span>
                                </div>
                                <div className='flex justify-between items-center pt-3 border-t border-gray-200'>
                                    <p className='text-sm text-gray-500'>
                                        <span className='font-semibold'>{report.topic}</span>
                                    </p>
                                    <span className='text-sm text-gray-500'>{report.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Tracking;
