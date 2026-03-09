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
    const [timeFilter, setTimeFilter] = useState('all'); // 'all' | '30d'
    const [sortField, setSortField] = useState('date'); // 'date' | 'status' | 'category'
    const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'

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
                    category: g.Category || 'Uncategorized',
                    date: g.CreateAt || '',
                    timeline: g.timeline || []
                }));
                setTickets(mapped);
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [selectedOrg?.id]);

    // Apply time filter
    const filteredTickets = useMemo(() => {
        if (timeFilter === '30d') {
            const cutoff = new Date();
            cutoff.setDate(cutoff.getDate() - 30);
            return tickets.filter(t => t.date && new Date(t.date) >= cutoff);
        }
        return tickets;
    }, [tickets, timeFilter]);

    const stats = useMemo(() => {
        const total = filteredTickets.length;
        const solvedTimes = filteredTickets
            .filter(t => t.status === 'Solved' && t.timeline?.length >= 2)
            .map(t => {
                const first = new Date(t.timeline[0].date);
                const last = new Date(t.timeline[t.timeline.length - 1].date);
                return (last - first) / (1000 * 60 * 60);
            });
        const avgHours = solvedTimes.length
            ? solvedTimes.reduce((a, b) => a + b, 0) / solvedTimes.length
            : 0;
        const avgResolution = solvedTimes.length
            ? avgHours < 1
                ? `${Math.round(avgHours * 60)} min`
                : `${avgHours.toFixed(1)} hrs`
            : '0 min';
        const backlog = filteredTickets.filter(t => t.status !== 'Solved').length;
        return { total, avgResolution, backlog };
    }, [filteredTickets]);

    const byStatus = useMemo(() => {
        const map = {};
        filteredTickets.forEach(t => { map[t.status] = (map[t.status] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [filteredTickets]);

    const byCategory = useMemo(() => {
        const map = {};
        filteredTickets.forEach(t => { map[t.category] = (map[t.category] || 0) + 1; });
        return Object.entries(map).sort((a, b) => b[1] - a[1]);
    }, [filteredTickets]);

    const handleSort = (field) => {
        if (sortField === field) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDir('asc'); }
    };
    const SortIcon = ({ field }) => {
        if (sortField !== field) return <span className='ml-1 text-gray-300'>↕</span>;
        return <span className='ml-1 text-blue-500'>{sortDir === 'asc' ? '↑' : '↓'}</span>;
    };

    const sortedTickets = useMemo(() => {
        return [...filteredTickets].sort((a, b) => {
            const dir = sortDir === 'asc' ? 1 : -1;
            if (sortField === 'date') {
                return dir * ((a.date ? new Date(a.date) : 0) - (b.date ? new Date(b.date) : 0));
            }
            const valA = (sortField === 'status' ? a.status : a.category) || '';
            const valB = (sortField === 'status' ? b.status : b.category) || '';
            return dir * valA.localeCompare(valB);
        });
    }, [filteredTickets, sortField, sortDir]);

    return (
        <div className={containerClasses}>
            <div className='space-y-6 p-4 sm:p-6 md:p-8'>

                {/* Title + time filter */}
                <div className='flex flex-wrap justify-between items-center gap-3'>
                    <h1 className='font-bold text-gray-800 text-xl md:text-2xl'>
                        Dashboard Overview {selectedOrg && <span className='font-medium text-gray-500 text-base'>— {selectedOrg.name}</span>}
                    </h1>
                    <div className='flex gap-2'>
                        {[{ label: 'All Time', val: 'all' }, { label: 'Last 30 Days', val: '30d' }].map(({ label, val }) => (
                            <button
                                key={val}
                                onClick={() => setTimeFilter(val)}
                                className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                    timeFilter === val
                                        ? 'bg-[#4377E5] text-white border-[#4377E5]'
                                        : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                }`}
                            >
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

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
                            <h2 className='mb-4 font-bold text-gray-800 text-base'>Tickets by Category</h2>
                            <div className='space-y-2'>
                                {byCategory.map(([category, count]) => (
                                    <div key={category} className='flex justify-between text-gray-600 text-sm'>
                                        <span>{category}</span>
                                        <span>{count}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* All Groups Table */}
                    <div className='bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden'>
                        <div className='flex justify-between items-center p-5 pb-3'>
                            <h2 className='font-bold text-gray-800 text-base'>All Groups</h2>
                            <span className='text-gray-400 text-xs'>{filteredTickets.length} group{filteredTickets.length !== 1 ? 's' : ''}</span>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full min-w-[36rem]'>
                                <thead>
                                    <tr className='border-gray-100 border-t'>
                                        <th className='px-5 py-3 font-semibold text-gray-400 text-xs text-left'>ID</th>
                                        <th className='px-5 py-3 font-semibold text-gray-400 text-xs text-left'>Title</th>
                                        <th
                                            className='px-5 py-3 font-semibold text-gray-400 hover:text-gray-600 text-xs text-left cursor-pointer select-none'
                                            onClick={() => handleSort('status')}
                                        >Status <SortIcon field='status' /></th>
                                        <th
                                            className='px-5 py-3 font-semibold text-gray-400 hover:text-gray-600 text-xs text-left cursor-pointer select-none'
                                            onClick={() => handleSort('category')}
                                        >Category <SortIcon field='category' /></th>
                                        <th
                                            className='px-5 py-3 font-semibold text-gray-400 hover:text-gray-600 text-xs text-left cursor-pointer select-none'
                                            onClick={() => handleSort('date')}
                                        >Date <SortIcon field='date' /></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {sortedTickets.map((ticket, idx) => (
                                        <tr key={ticket.id} className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                                            <td className='px-5 py-3 font-semibold text-gray-700 text-sm'>#{String(ticket.id).padStart(4, '0')}</td>
                                            <td className='px-5 py-3 font-semibold text-gray-800 text-sm'>{ticket.topicName}</td>
                                            <td className='px-5 py-3'>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className='px-5 py-3 text-gray-600 text-sm'>{ticket.category}</td>
                                            <td className='px-5 py-3 text-gray-600 text-sm'>
                                                {ticket.date ? new Date(ticket.date).toLocaleDateString('en-GB') : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {sortedTickets.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className='px-5 py-10 text-gray-400 text-sm text-center'>
                                                No groups found.
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
