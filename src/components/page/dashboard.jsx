import React, { useMemo, useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import API_BASE from '../../config/api';

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

    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);

    useEffect(() => {
        const loadOrg = () => {
            const saved = localStorage.getItem('selectedOrganization');
            const org = saved ? JSON.parse(saved) : null;
            setSelectedOrg(prev => prev?.id !== org?.id ? org : prev);
        };
        loadOrg();
        const iv = setInterval(loadOrg, 500);
        return () => clearInterval(iv);
    }, []);

    useEffect(() => {
        if (!selectedOrg?.id) { setTickets([]); return; }
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setLoading(true);
        fetch(`${API_BASE}/api/tickets/org/${selectedOrg.id}/groups/enriched`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                const mapped = (data.result || []).map(g => ({
                    id: g.id,
                    status: g.status ? (g.status.charAt(0).toUpperCase() + g.status.slice(1)) : 'Assigned',
                    topic: g.Title,
                    topicName: g.Title,
                    date: g.CreateAt || '',
                    timeline: g.timeline || []
                }));
                setTickets(mapped);
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [selectedOrg?.id]);

    const stats = useMemo(() => {
        const total = tickets.length;
        const solvedTimes = tickets
            .filter(t => t.status === 'Solved' && t.timeline?.length >= 2)
            .map(t => {
                const first = new Date(t.timeline[0].date);
                const last = new Date(t.timeline[t.timeline.length - 1].date);
                return (last - first) / (1000 * 60 * 60);
            });
        const avgResolution = solvedTimes.length
            ? (solvedTimes.reduce((a, b) => a + b, 0) / solvedTimes.length).toFixed(1)
            : '0.0';
        const backlog = tickets.filter(t => t.status !== 'Solved').length;
        return { total, avgResolution, backlog };
    }, [tickets]);

    const byStatus = useMemo(() => {
        const map = {};
        tickets.forEach(t => { map[t.status] = (map[t.status] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [tickets]);

    const byGroup = useMemo(() => {
        const map = {};
        tickets.forEach(t => { if (t.topic) map[t.topic] = (map[t.topic] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [tickets]);

    const recentUnresolved = useMemo(() =>
        tickets.filter(t => t.status !== 'Solved').slice(0, 5),
        [tickets]
    );

    return (
        <div className={containerClasses}>
            <div className='space-y-6 p-4 sm:p-6 md:p-8'>

                {/* Title */}
                <h1 className='font-bold text-gray-800 text-xl md:text-2xl'>
                    Dashboard Overview {selectedOrg && <span className='font-medium text-gray-500 text-base'>— {selectedOrg.name}</span>}
                </h1>

                {!selectedOrg && (
                    <div className='bg-white p-8 border border-gray-200 rounded-2xl text-center'>
                        <p className='text-gray-500'>Please select an organization to view dashboard.</p>
                    </div>
                )}

                {loading && (
                    <div className='bg-white p-8 border border-gray-200 rounded-2xl text-center'>
                        <p className='text-gray-500'>Loading dashboard...</p>
                    </div>
                )}

                {selectedOrg && !loading && (<>

                {/* Stats cards */}
                <div className='gap-4 grid grid-cols-1 sm:grid-cols-3'>
                    <div className='bg-white shadow-sm p-5 border border-gray-200 rounded-2xl'>
                        <p className='mb-2 text-gray-500 text-sm'>Total Tickets</p>
                        <p className='font-bold text-blue-500 text-4xl'>{stats.total}</p>
                    </div>
                    <div className='bg-white shadow-sm p-5 border border-gray-200 rounded-2xl'>
                        <p className='mb-2 text-gray-500 text-sm'>Average Resolution Time</p>
                        <p className='font-bold text-yellow-400 text-4xl'>{stats.avgResolution}</p>
                    </div>
                    <div className='bg-white shadow-sm p-5 border border-gray-200 rounded-2xl'>
                        <p className='mb-2 text-gray-500 text-sm'>Current Backlog</p>
                        <p className='font-bold text-red-500 text-4xl'>{stats.backlog}</p>
                    </div>
                </div>

                {/* Tickets by Status & Group */}
                <div className='gap-4 grid grid-cols-1 md:grid-cols-2'>
                    <div className='bg-white shadow-sm p-5 border border-gray-200 rounded-2xl'>
                        <h2 className='mb-4 font-bold text-gray-800 text-base'>Tickets by Status</h2>
                        <div className='space-y-2'>
                            {byStatus.map(([status, count]) => (
                                <div key={status} className='flex justify-between text-gray-600 text-sm'>
                                    <span>{status}</span>
                                    <span>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className='bg-white shadow-sm p-5 border border-gray-200 rounded-2xl'>
                        <h2 className='mb-4 font-bold text-gray-800 text-base'>Tickets by Group</h2>
                        <div className='space-y-2'>
                            {byGroup.map(([group, count], idx) => (
                                <div key={group} className='flex justify-between text-gray-600 text-sm'>
                                    <span>Group {idx + 1}</span>
                                    <span>{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Unresolved Tickets */}
                <div className='bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden'>
                    <div className='p-5 pb-3'>
                        <h2 className='font-bold text-gray-800 text-base'>Recent Unresolved Ticket</h2>
                    </div>
                    <div className='overflow-x-auto'>
                        <table className='w-full min-w-130'>
                            <thead>
                                <tr className='border-gray-100 border-t'>
                                    <th className='px-5 py-3 font-semibold text-gray-400 text-xs text-left'>ID</th>
                                    <th className='px-5 py-3 font-semibold text-gray-400 text-xs text-left'>Title</th>
                                    <th className='px-5 py-3 font-semibold text-gray-400 text-xs text-left'>Status</th>
                                    <th className='px-5 py-3 font-semibold text-gray-400 text-xs text-left'>Category</th>
                                    <th className='px-5 py-3 font-semibold text-gray-400 text-xs text-left'>Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentUnresolved.map((ticket, idx) => (
                                    <tr key={ticket.id} className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                                        <td className='px-5 py-4 font-semibold text-gray-700 text-sm'>#{String(ticket.id).padStart(4, '0')}</td>
                                        <td className='px-5 py-4 font-semibold text-gray-800 text-sm'>{ticket.topicName}</td>
                                        <td className='px-5 py-4'>
                                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(ticket.status)}`}>
                                                {ticket.status}
                                            </span>
                                        </td>
                                        <td className='px-5 py-4 text-gray-600 text-sm'>{ticket.topic}</td>
                                        <td className='px-5 py-4 text-gray-600 text-sm'>
                                            {new Date(ticket.date).toLocaleDateString('en-GB').replace(/\//g, '/')}
                                        </td>
                                    </tr>
                                ))}
                                {recentUnresolved.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className='px-5 py-10 text-gray-400 text-sm text-center'>
                                            No unresolved tickets.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                </>)}
            </div>
        </div>
    );
};

export default AssigneePage;
