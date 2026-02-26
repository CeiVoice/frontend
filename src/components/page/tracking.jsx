import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuSend, LuWrench } from "react-icons/lu";
import { MdAccessTime } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io"
import { FiSearch } from "react-icons/fi";

const Tracking = () => {
    const { reports = [], sidebarOpen } = useOutletContext() ?? {};
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

    // Group tickets by organization
    const groupedByOrg = reports.reduce((acc, report) => {
        const org = report.organization || 'Uncategorized';
        if (!acc[org]) {
            acc[org] = [];
        }
        acc[org].push(report);
        return acc;
    }, {});

    return (
        <div className={containerClasses}>
            <div className='p-6 md:p-8'>
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 select-none'>
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
                            className='select-none w-full px-4 py-2 rounded-3xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <span className='absolute right-3 top-3 text-gray-400'>{<FiSearch />}</span>
                    </div>
                </div>

                {reports.length === 0 ? (
                    <div className='bg-gray-50 rounded-lg p-8 text-center'>
                        <p className='text-gray-500 text-lg'>No submissions yet. Create a report to get started.</p>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {Object.entries(groupedByOrg).map(([organization, orgReports], orgIndex) => (
                            <div key={orgIndex} className='bg-blue-50 rounded-xl overflow-hidden border border-blue-200'>
                                <div className='bg-blue-100 px-6 py-3 border-b border-blue-200'>
                                    <h2 className='text-lg font-bold text-blue-900'>{organization}</h2>
                                </div>
                                <div className='space-y-3 p-4'>
                                    {orgReports.map((report, reportIndex) => (
                                        <div key={reportIndex} className='bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow'>
                                            <div className='flex justify-between items-start mb-2'>
                                                <div>
                                                    <h3 className='text-lg font-bold text-gray-800'>{report.topicName}</h3>
                                                    <p className='text-gray-600 mt-1 text-sm'>{report.message}</p>
                                                </div>
                                                <span className={`px-3 py-1 rounded-full text-xs font-semibold select-none ${getStatusBadgeColor(report.status)}`}>
                                                    {report.status}
                                                </span>
                                            </div>
                                            <div className='flex justify-between items-center pt-2 border-t border-gray-100'>
                                                <p className='text-xs text-gray-500'>
                                                    <span className='font-semibold'>{report.topic}</span>
                                                </p>
                                                <span className='text-xs text-gray-500 select-none'>{report.date}</span>
                                            </div>
                                        </div>
                                    ))}
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