import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import API_BASE from '../../config/api';

const statusColor = (status) => {
    switch (status?.toLowerCase()) {
        case 'solved': return 'bg-green-100 text-green-700';
        case 'solving': return 'bg-yellow-100 text-yellow-700';
        case 'active': return 'bg-yellow-100 text-yellow-700';
        case 'failed': return 'bg-red-100 text-red-600';
        default: return 'bg-blue-100 text-blue-700';
    }
};

const normalizeStatus = (s) => {
    if (!s) return 'Assigned';
    const m = { assigned: 'Assigned', solving: 'Solving', solved: 'Solved', failed: 'Failed', draft: 'Draft' };
    return m[s.toLowerCase()] || s;
};

const Userdashboard = () => {
    const { sidebarOpen } = useOutletContext() ?? {};
    const containerClasses = `w-full min-h-screen bg-gray-100 pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'sm:ml-60 md:ml-64' : 'ml-0'
        }`;

    const [groups, setGroups] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    // Decode current user id from JWT
    useEffect(() => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.id ?? null);
            }
        } catch { }
    }, []);

    // Sync selected org
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

    // Fetch enriched groups
    useEffect(() => {
        if (!selectedOrg?.id) { setGroups([]); return; }
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
                    title: g.Title,
                    status: normalizeStatus(g.status),
                    category: g.Category || 'Uncategorized',
                    date: g.CreateAt || '',
                    updatedAt: g.UpdateAt || g.CreateAt || '',
                    assignees: g.predictions?.[0]?.assignees || [],
                    timeline: g.timeline || [],
                }));
                setGroups(mapped);
            })
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [selectedOrg?.id]);

    // Groups where the current user is an assignee
    const myGroups = useMemo(() =>
        groups.filter(g => (g.assignees || []).includes(currentUserId)),
        [groups, currentUserId]
    );

    const stats = useMemo(() => {
        const now = Date.now();
        const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;

        const assignedToMe = myGroups.filter(g => g.status !== 'Solved' && g.status !== 'Failed').length;

        const recentSolved = myGroups.filter(g =>
            g.status === 'Solved' && new Date(g.updatedAt).getTime() >= thirtyDaysAgo
        ).length;

        const recentFailed = myGroups.filter(g =>
            g.status === 'Failed' && new Date(g.updatedAt).getTime() >= thirtyDaysAgo
        ).length;

        const totalHandled = myGroups.length;
        const solved = myGroups.filter(g => g.status === 'Solved').length;
        const failed = myGroups.filter(g => g.status === 'Failed').length;
        const successRate = (solved + failed) > 0
            ? Math.round((solved / (solved + failed)) * 100)
            : 0;
        const workload = myGroups.filter(g => g.status !== 'Solved' && g.status !== 'Failed').length;

        return { assignedToMe, recentSolved, recentFailed, totalHandled, successRate, workload };
    }, [myGroups]);

    const currentTickets = useMemo(() =>
        myGroups.filter(g => g.status !== 'Solved').slice(0, 10),
        [myGroups]
    );

    return (
        <div className={containerClasses}>
            <div className='space-y-6 p-4 sm:p-6 md:p-8'>

                {/* Title */}
                <h1 className='font-bold text-gray-800 text-xl md:text-2xl'>
                    Dashboard Overview{selectedOrg && <span className='font-medium text-gray-500 text-base'> — {selectedOrg.name}</span>}
                </h1>

                {!selectedOrg && (
                    <div className='bg-white p-8 border border-gray-200 rounded-2xl text-center'>
                        <p className='text-gray-500'>Please select an organization to view your dashboard.</p>
                    </div>
                )}

                {loading && (
                    <div className='bg-white p-8 border border-gray-200 rounded-2xl text-center'>
                        <p className='text-gray-500'>Loading dashboard...</p>
                    </div>
                )}

                {selectedOrg && !loading && (<>

                    {/* Top stat cards */}
                    <div className='gap-4 grid grid-cols-1 sm:grid-cols-3'>
                        <div className='bg-white shadow-sm p-5 border border-gray-200 rounded-2xl'>
                            <p className='mb-2 text-gray-500 text-sm'>Ticket Assign to me</p>
                            <p className='font-bold text-blue-500 text-4xl'>{stats.assignedToMe}</p>
                        </div>
                        <div className='bg-white shadow-sm p-5 border border-gray-200 rounded-2xl'>
                            <p className='mb-2 text-gray-500 text-sm'>Solved (Last 30 days)</p>
                            <p className='font-bold text-green-500 text-4xl'>{stats.recentSolved}</p>
                        </div>
                        <div className='bg-white shadow-sm p-5 border border-gray-200 rounded-2xl'>
                            <p className='mb-2 text-gray-500 text-sm'>Failed (Last 30 days)</p>
                            <p className='font-bold text-red-500 text-4xl'>{stats.recentFailed}</p>
                        </div>
                    </div>

                    {/* Performance Summary */}
                    <div className='bg-white shadow-sm p-6 border border-gray-200 rounded-2xl'>
                        <h2 className='mb-6 font-bold text-gray-800 text-base'>Performance Summary</h2>
                        <div className='gap-4 grid grid-cols-1 sm:grid-cols-3 text-center'>
                            <div>
                                <p className='font-bold text-gray-800 text-4xl'>{stats.totalHandled}</p>
                                <p className='mt-2 text-gray-500 text-sm'>Total Tickets Handled</p>
                            </div>
                            <div>
                                <p className='font-bold text-gray-800 text-4xl'>{stats.successRate}%</p>
                                <p className='mt-2 text-gray-500 text-sm'>Success Rate</p>
                            </div>
                            <div>
                                <p className='font-bold text-gray-800 text-4xl'>{stats.workload}</p>
                                <p className='mt-2 text-gray-500 text-sm'>Current Workload</p>
                            </div>
                        </div>
                    </div>

                    {/* My Current Tickets table */}
                    <div className='bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden'>
                        <div className='p-5 pb-3'>
                            <h2 className='font-bold text-gray-800 text-base'>My Current Tickets</h2>
                        </div>
                        <div className='overflow-x-auto'>
                            <table className='w-full min-w-[600px]'>
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
                                    {currentTickets.map((ticket, idx) => (
                                        <tr key={ticket.id} className={`border-t border-gray-100 ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/40'}`}>
                                            <td className='px-5 py-4 font-semibold text-gray-700 text-sm'>#{String(ticket.id).padStart(4, '0')}</td>
                                            <td className='px-5 py-4 font-semibold text-gray-800 text-sm'>{ticket.title}</td>
                                            <td className='px-5 py-4'>
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(ticket.status)}`}>
                                                    {ticket.status}
                                                </span>
                                            </td>
                                            <td className='px-5 py-4 text-gray-600 text-sm'>{ticket.category}</td>
                                            <td className='px-5 py-4 text-gray-600 text-sm'>
                                                {ticket.date ? new Date(ticket.date).toLocaleDateString('en-GB') : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {currentTickets.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className='px-5 py-10 text-gray-400 text-sm text-center'>
                                                No current tickets assigned to you.
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

export default Userdashboard;