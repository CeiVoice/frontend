import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { FiSearch } from "react-icons/fi";
import { MdDrafts } from "react-icons/md";

const AdminPage = () => {
    const { reports = [], sidebarOpen } = useOutletContext() ?? {};
    const [showDetailPage, setShowDetailPage] = useState(false);

    const containerClasses = `w-full h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'
        }`;

    // Filter only draft tickets
    const draftTickets = reports.filter(r => r.admin_status === 'Draft');

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Failed':
                return 'bg-red-100 text-red-700';
            case 'Solving':
                return 'bg-yellow-100 text-yellow-700';
            case 'Solved':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    // Group draft tickets by topic
    const groupedByTopic = draftTickets.reduce((acc, report) => {
        const topic = report.topic || 'Uncategorized';
        if (!acc[topic]) {
            acc[topic] = [];
        }
        acc[topic].push(report);
        return acc;
    }, {});

    // If detail page is shown, render detail page in same container
    if (showDetailPage) {
        return (
            <div className={containerClasses}>
                <div className='p-6 md:p-8 flex items-center justify-center h-full overflow-auto'>
                    <div className='text-center'>
                        <h1 className='text-4xl font-bold text-gray-800'>Admin</h1>
                        <button
                            onClick={() => setShowDetailPage(false)}
                            className='mt-8 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600'
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className='p-6 md:p-8'>
                <div className='mb-10'>
                    <div className='bg-blue-500 rounded-2xl p-6 shadow-md text-white'>
                        <p className='text-lg mb-3 select-none'>Total Draft Tickets</p>
                        <div className='flex items-center justify-between'>
                            <p className='text-4xl font-bold select-none'>{draftTickets.length}</p>
                            <span className='text-3xl'><MdDrafts /></span>
                        </div>
                    </div>
                </div>

                <div className='flex gap-4 mb-8'>
                    <div className='relative flex-1'>
                        <input
                            type="text"
                            placeholder="Search draft tickets"
                            className='select-none w-full px-4 py-2 rounded-3xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                        />
                        <span className='absolute right-3 top-3 text-gray-400'>{<FiSearch />}</span>
                    </div>
                </div>

                {draftTickets.length === 0 ? (
                    <div className='bg-gray-50 rounded-lg p-8 text-center'>
                        <p className='text-gray-500 text-lg'>No draft tickets. All tickets have been reviewed.</p>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {Object.entries(groupedByTopic).map(([topic, topicReports], topicIndex) => (
                            <div key={topicIndex} className='bg-red-50 rounded-xl overflow-hidden border border-red-200'>
                                <div className='bg-red-100 px-6 py-3 border-b border-red-200'>
                                    <div className='flex justify-between items-center'>
                                        <h2 className='text-lg font-bold text-red-900'>Group {topicIndex + 1}</h2>
                                        <span className='bg-red-200 text-red-900 px-3 py-1 rounded-full text-sm font-semibold select-none'>
                                            {topicReports.length} Draft{topicReports.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className='space-y-3 p-4'>
                                    {topicReports.map((report, reportIndex) => (
                                        <div
                                            key={reportIndex}
                                            className='bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer'
                                            onClick={() => setShowDetailPage(true)}
                                        >
                                            <div className='flex justify-between items-start mb-2'>
                                                <div className='flex-1'>
                                                    <h3 className='text-lg font-bold text-gray-800'>{report.topicName}</h3>
                                                    <p className='text-gray-600 mt-1 text-sm'>{report.message}</p>
                                                </div>
                                                <div className='flex gap-2 items-center ml-4'>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold select-none ${getStatusBadgeColor(report.status)}`}>
                                                        {report.status}
                                                    </span>
                                                    <span className='px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-700 select-none'>
                                                        Draft
                                                    </span>
                                                </div>
                                            </div>
                                            <div className='flex justify-between items-center pt-2 border-t border-gray-100'>
                                                <p className='text-xs text-gray-500'>
                                                    <span className='font-semibold'>{report.organization}</span>
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

export default AdminPage;
