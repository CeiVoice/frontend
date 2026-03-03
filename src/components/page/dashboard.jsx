import React, { useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EXAMPLE_TICKETS } from '../constants/ticketExamples';

const statusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'solved': return 'bg-green-100 text-green-700';
        case 'solving': return 'bg-yellow-100 text-yellow-700';
        case 'active': return 'bg-yellow-100 text-yellow-700';
        case 'failed': return 'bg-red-100 text-red-600';
        default: return 'bg-gray-100 text-gray-600';
    }
};

const AssigneePage = () => {
    const { sidebarOpen } = useOutletContext() ?? {};
    const containerClasses = `w-full min-h-screen bg-gray-100 pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'sm:ml-60 md:ml-64' : 'ml-0'
        }`;

    const stats = useMemo(() => {
        const total = EXAMPLE_TICKETS.length;

        // Average resolution time: days between first and last timeline entry for solved tickets
        const solvedTimes = EXAMPLE_TICKETS
            .filter(t => t.status === 'Solved' && t.timeline?.length >= 2)
            .map(t => {
                const first = new Date(t.timeline[0].date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
                const last = new Date(t.timeline[t.timeline.length - 1].date.replace(/(\d{2})\/(\d{2})\/(\d{4})/, '$3-$2-$1'));
                return (last - first) / (1000 * 60 * 60); // hours
            });
        const avgResolution = solvedTimes.length
            ? (solvedTimes.reduce((a, b) => a + b, 0) / solvedTimes.length).toFixed(1)
            : '0.0';

        // Current backlog = unresolved (not Solved)
        const backlog = EXAMPLE_TICKETS.filter(t => t.status !== 'Solved').length;

        return { total, avgResolution, backlog };
    }, []);

    const byStatus = useMemo(() => {
        const map = {};
        EXAMPLE_TICKETS.forEach(t => {
            map[t.status] = (map[t.status] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, []);

    const byGroup = useMemo(() => {
        const map = {};
        EXAMPLE_TICKETS.forEach(t => {
            if (t.topic) map[t.topic] = (map[t.topic] || 0) + 1;
        });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, []);

    const recentUnresolved = useMemo(() =>
        EXAMPLE_TICKETS
            .filter(t => t.status !== 'Solved')
            .slice(0, 5),
        []
    );

    return (
        <div className={containerClasses}>
            <div className='p-4 sm:p-6 md:p-8 space-y-6'>

                {/* Title */}
                <h1 className='text-xl md:text-2xl font-bold text-gray-800'>Dashboard Overview</h1>

                {/* Stats cards */}
                <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-5'>
                        <p className='text-sm text-gray-500 mb-2'>Total Tickets</p>
                        <p className='text-4xl font-bold text-blue-500'>{stats.total}</p>
                    </div>
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-5'>
                        <p className='text-sm text-gray-500 mb-2'>Average Resolution Time</p>
                        <p className='text-4xl font-bold text-yellow-400'>{stats.avgResolution}</p>
                    </div>
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-5'>
                        <p className='text-sm text-gray-500 mb-2'>Current Backlog</p>
                        <p className='text-4xl font-bold text-red-500'>{stats.backlog}</p>
                    </div>
                </div>

                {/* Tickets by Status & Group */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-5'>
                        <h2 className='text-base font-bold text-gray-800 mb-4'>Tickets by Status</h2>
                        <div className='space-y-2'>
                            {byStatus.map(([status, count]) => (
                                <div key={status} className='flex justify-between text-sm text-gray-600'>
                                    <span>{status}</span>
                                    <span>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='bg-white rounded-2xl shadow-sm border border-gray-200 p-5'>
                        <h2 className='text-base font-bold text-gray-800 mb-4'>Tickets by Group</h2>
                        <div className='space-y-2'>
                            {byGroup.map(([group, count], idx) => (
                                <div key={group} className='flex justify-between text-sm text-gray-600'>
                                    <span>Group {idx + 1}</span>
                                    <span>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Unresolved Tickets */}
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                    <div className='p-5 pb-3'>
                        <h2 className='text-base font-bold text-gray-800'>Recent Unresolved Ticket</h2>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full min-w-[520px]'>
                            <thead>
                                <tr className='border-t border-gray-100'>
                                    <th className='text-left px-5 py-3 text-xs text-gray-400 font-semibold'>ID</th>
                                    <th className='text-left px-5 py-3 text-xs text-gray-400 font-semibold'>Title</th>
                                    <th className='text-left px-5 py-3 text-xs text-gray-400 font-semibold'>Status</th>
                                    <th className='text-left px-5 py-3 text-xs text-gray-400 font-semibold'>Category</th>
                                    <th className='text-left px-5 py-3 text-xs text-gray-400 font-semibold'>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUnresolved.map((ticket, idx) => (
                                    <tr key={ticket.id} className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                                        <td className='px-5 py-4 text-sm font-semibold text-gray-700'>#{String(ticket.id).padStart(4, '0')}</td>
                                        <td className='px-5 py-4 text-sm font-semibold text-gray-800'>{ticket.topicName}</td>
                                        <td className='px-5 py-4'>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className='px-5 py-4 text-sm text-gray-600'>{ticket.topic}</td>
                                        <td className='px-5 py-4 text-sm text-gray-600'>
                                            {new Date(ticket.date).toLocaleDateString('en-GB').replace(/\//g, '/')}
                                        </td>
                                    </tr>
                                ))}
                                {recentUnresolved.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className='px-5 py-10 text-center text-gray-400 text-sm'>
                                            No unresolved tickets.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default AssigneePage;
