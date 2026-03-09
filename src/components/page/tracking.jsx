import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuSend, LuWrench } from "react-icons/lu";
import { MdAccessTime } from "react-icons/md";
import { IoMdCheckmarkCircleOutline, IoMdCloseCircle } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import API_BASE from '../../config/api';
import TicketDetail from './TicketDetail';

/* ─── Tracking List View ─────────────────────────────────────── */
const Tracking = () => {
    const { sidebarOpen } = useOutletContext() ?? {};
    const containerClasses = `w-full min-h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'
        }`;

    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All'); // All | Assigned | Solving | Solved | Failed
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const isAdmin = selectedOrg?.isAdmin === true;

    // Decode current user id from JWT token
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

    // Fetch enriched group tickets + member emails in parallel
    useEffect(() => {
        if (!selectedOrg?.id) { setReports([]); return; }
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setLoading(true);
        Promise.all([
            fetch(`${API_BASE}/api/tickets/org/${selectedOrg.id}/groups/enriched`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json()),
            fetch(`${API_BASE}/api/tickets/org/${selectedOrg.id}/stats/members`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }).then(r => r.json())
        ])
            .then(([groupsData, membersData]) => {
                // Build userId → email lookup
                const emailMap = {};
                (membersData.result || []).forEach(m => { emailMap[m.userId] = m.email; });

                const normalizeStatus = s => {
                    if (!s) return 'Assigned';
                    const m = { assigned: 'Assigned', solving: 'Solving', solved: 'Solved', failed: 'Failed', draft: 'Draft' };
                    return m[s.toLowerCase()] || s;
                };
                // Each group = one GroupTicket; predictions = TicketPredictions inside it
                const mapped = (groupsData.result || []).map(g => ({
                    id: g.id,
                    title: g.Title,
                    status: normalizeStatus(g.status),
                    date: g.CreateAt ? new Date(g.CreateAt).toLocaleDateString() : '',
                    assignees: g.assignees || [],
                    timeline: g.timeline || [],
                    category: g.Category || '',
                    predictions: (g.predictions || []).map(p => {
                        const matchedTicket = (g.tickets || []).find(t => t.id === p.TicketId);
                        // p.assignees is an array of userId numbers from the backend
                        return {
                            id: p.TicketId || p.id,
                            groupId: g.id,
                            ticketId: p.TicketId,
                            predictionId: p.id,
                            topicName: p.Title || g.Title,
                            message: p.Detail || matchedTicket?.Detail || '',
                            organization: selectedOrg.name || `Org #${g.OrganizationId}`,
                            orgId: g.OrganizationId,
                            status: normalizeStatus(g.status),
                            date: g.CreateAt ? new Date(g.CreateAt).toLocaleDateString() : '',
                            topic: g.Title,
                            assignedTo: (p.assignees || []).map(a => ({ userId: a, email: emailMap[a] || `User #${a}` })),
                            timeline: g.timeline || [],
                            createdBy: {
                                email: matchedTicket?.CreatedBy
                                    ? (emailMap[matchedTicket.CreatedBy] || `User #${matchedTicket.CreatedBy}`)
                                    : 'Unknown',
                                userId: matchedTicket?.CreatedBy ?? null
                            },
                            followers: [],
                            category: p.Category || g.Category || '',
                            // Group-level info so TicketDetail can display the parent group
                            groupTitle: g.title,
                            groupStatus: normalizeStatus(g.status),
                            groupCategory: g.Category || '',
                            groupDeadline: g.Deadline || null,
                            suggest: p.Suggest || '',
                            matchScore: p.MatchScore ?? 0
                        };
                    })
                }));
                setReports(mapped);
            })
            .catch(e => console.error('Fetch enriched groups error', e))
            .finally(() => setLoading(false));
    }, [selectedOrg?.id]);

    // Stats: count only predictions the current user can access
    const allPredictions = reports.flatMap(g =>
        (g.predictions || []).filter(p => {
            const isPredAssignee = (p.assignedTo || []).some(a => a.userId === currentUserId);
            const isOwner = p.createdBy?.userId !== null && p.createdBy?.userId === currentUserId;
            return isAdmin || isPredAssignee || isOwner;
        })
    );
    const activeTickets = allPredictions.filter(p => p.status !== 'Solved' && p.status !== 'Failed').length;
    const assignedTickets = allPredictions.filter(p => p.status === 'Assigned').length;
    const solvingTickets = allPredictions.filter(p => p.status === 'Solving').length;
    const solvedTickets = allPredictions.filter(p => p.status === 'Solved').length;
    const failedTickets = allPredictions.filter(p => p.status === 'Failed').length;

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

    const StatCard = ({ label, count, icon }) => (
        <div className='bg-white shadow-md p-6 border-2 border-blue-200 rounded-2xl'>
            <p className='mb-3 text-gray-600 text-lg'>{label}</p>
            <div className='flex justify-between items-center'>
                <p className='font-bold text-gray-800 text-4xl'>{count}</p>
                <span className='text-3xl'>{icon}</span>
            </div>
        </div>
    );

    const filteredGroups = reports
        .map(g => ({
            ...g,
            predictions: (g.predictions || []).filter(p => {
                const matchSearch =
                    p.topicName?.toLowerCase().includes(search.toLowerCase()) ||
                    p.message?.toLowerCase().includes(search.toLowerCase());
                const matchStatus = statusFilter === 'All' || p.status === statusFilter;
                const isPredAssignee = (p.assignedTo || []).some(a => a.userId === currentUserId);
                const isOwner = p.createdBy?.userId !== null && p.createdBy?.userId === currentUserId;
                const canView = isAdmin || isPredAssignee || isOwner;
                return matchSearch && matchStatus && canView;
            })
        }))
        // Always hide groups that have no accessible tickets
        .filter(g => g.predictions.length > 0);

    return (
        <div className={containerClasses}>
            <div className='p-6 md:p-8'>
                {selectedTicket ? (
                    <TicketDetail
                            ticket={selectedTicket}
                            onBack={() => setSelectedTicket(null)}
                            isAdmin={isAdmin}
                            isAssignee={(selectedTicket?.assignedTo || []).some(a => a.userId === currentUserId)}
                        />
                ) : (
                    <>
                        <div className='gap-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-10 select-none'>
                            <StatCard label="Active Tickets" count={activeTickets} icon={<LuSend />} />
                            <StatCard label="Assigned" count={assignedTickets} icon={<MdAccessTime />} />
                            <StatCard label="Solving" count={solvingTickets} icon={<LuWrench />} />
                            <StatCard label="Solved" count={solvedTickets} icon={<IoMdCheckmarkCircleOutline />} />
                            <StatCard label="Failed" count={failedTickets} icon={<IoMdCloseCircle />} />
                        </div>

                        <div className='flex sm:flex-row flex-col gap-3 mb-8'>
                            <div className='relative sm:flex-1 w-full'>
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className='bg-white px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full select-none'
                                />
                                <span className='top-3 right-3 absolute text-gray-400'><FiSearch /></span>
                            </div>
                            {/* Status filter pills */}
                            <div className='flex flex-wrap items-center gap-2'>
                                {['All', 'Assigned', 'Solving', 'Solved', 'Failed'].map(s => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                            statusFilter === s
                                                ? s === 'Solved' ? 'bg-green-500 text-white border-green-500'
                                                    : s === 'Failed' ? 'bg-red-500 text-white border-red-500'
                                                    : s === 'Solving' ? 'bg-yellow-400 text-white border-yellow-400'
                                                    : 'bg-[#4377E5] text-white border-[#4377E5]'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        {s}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {!selectedOrg ? (
                            <div className='bg-gray-50 p-8 rounded-lg text-center'>
                                <p className='text-gray-500 text-lg'>Please select an organization.</p>
                            </div>
                        ) : loading ? (
                            <div className='bg-gray-50 p-8 rounded-lg text-center'>
                                <p className='text-gray-500'>Loading tickets...</p>
                            </div>
                        ) : filteredGroups.length === 0 ? (
                            <div className='bg-gray-50 p-8 rounded-lg text-center'>
                                <p className='text-gray-500 text-lg'>No submissions yet. Create a report to get started.</p>
                            </div>
                        ) : (
                            <div className='space-y-6'>
                                {filteredGroups.map((group) => (
                                    <div key={group.id} className='bg-blue-50 border border-blue-200 rounded-xl overflow-hidden'>
                                        <div className='bg-blue-100 px-6 py-3 border-blue-200 border-b'>
                                            <div className='flex flex-wrap items-center gap-2'>
                                                <h2 className='font-bold text-blue-900 text-lg'>Group #{group.id}</h2>
                                                <span className='font-semibold text-blue-700 text-base'>— {group.title}</span>
                                                {group.category && (
                                                    <span className='bg-purple-100 px-2.5 py-0.5 rounded-full font-semibold text-purple-700 text-xs'>{group.category}</span>
                                                )}
                                                <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeColor(group.status)}`}>{group.status}</span>
                                                {group.predictions[0]?.groupDeadline && (
                                                    <span className='ml-auto text-blue-600 text-xs'>Due {new Date(group.predictions[0].groupDeadline).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                            <p className='mt-0.5 text-blue-600 text-xs'>{group.predictions.length} ticket{group.predictions.length !== 1 ? 's' : ''} · {group.status} · {group.date}</p>
                                        </div>
                                        <div className='space-y-3 p-4'>
                                            {group.predictions.length === 0 ? (
                                                <p className='py-4 text-gray-400 text-sm text-center'>No tickets in this group.</p>
                                            ) : group.predictions.map((prediction, predIndex) => (
                                                <div
                                                    key={predIndex}
                                                    onClick={() => setSelectedTicket(prediction)}
                                                    className='bg-white shadow-sm hover:shadow-md p-4 rounded-lg transition-shadow cursor-pointer'
                                                >
                                                    <div className='flex justify-between items-start mb-2'>
                                                        <div className='flex-1'>
                                                            <div className='flex items-center gap-2 mb-0.5'>
                                                                <span className='font-mono text-gray-400 text-xs'>#{String(prediction.predictionId).padStart(5, '0')}</span>
                                                                <h3 className='font-bold text-gray-800'>{prediction.topicName}</h3>
                                                            </div>
                                                            <p className='text-gray-600 text-sm'>{prediction.message}</p>
                                                        </div>
                                                    </div>
                                                    <div className='flex justify-between items-center pt-2 border-gray-100 border-t'>
                                                        <span className='font-semibold text-gray-500 text-xs'>{prediction.organization}</span>
                                                        <span className='text-gray-500 text-xs select-none'>{prediction.date}</span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default Tracking;
