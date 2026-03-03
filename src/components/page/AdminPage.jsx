import React, { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { MdDrafts } from "react-icons/md";
import { useOutletContext, useNavigate } from 'react-router-dom';
import API_BASE from '../../config/api';

const AdminPage = () => {
    const { sidebarOpen } = useOutletContext() ?? {};
    const navigate = useNavigate();
    const [draftTickets, setDraftTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [orgLoaded, setOrgLoaded] = useState(false);

    useEffect(() => {
        const loadOrg = () => {
            const saved = localStorage.getItem('selectedOrganization');
            const org = saved ? JSON.parse(saved) : null;
            setSelectedOrg(prev => prev?.id !== org?.id ? org : prev);
            setOrgLoaded(true);
        };
        loadOrg();
        const iv = setInterval(loadOrg, 500);
        return () => clearInterval(iv);
    }, []);

    const fetchDrafts = async (orgId) => {
        const token = localStorage.getItem('authToken');
        if (!token || !orgId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${API_BASE}/api/tickets/org/${orgId}/drafts`, {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (res.ok) {
                setDraftTickets(data.result || []);
            } else {
                setError(data.error || 'Failed to fetch draft tickets');
            }
        } catch (e) {
            setError('Network error. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (selectedOrg?.id) fetchDrafts(selectedOrg.id);
        else setDraftTickets([]);
    }, [selectedOrg?.id]);

    const isAdmin = selectedOrg?.isAdmin === true;

    const containerClasses = `w-full h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'}`;

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'failed': return 'bg-red-100 text-red-700';
            case 'assigned': return 'bg-yellow-100 text-yellow-700';
            case 'solved': return 'bg-green-100 text-green-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const filtered = draftTickets.filter(d =>
        (d.Title || '').toLowerCase().includes(search.toLowerCase()) ||
        (d.Detail || '').toLowerCase().includes(search.toLowerCase())
    );

    const groupedByTopic = filtered.reduce((acc, draft) => {
        const key = draft.GroupId ? `Merge → Group #${draft.GroupId}` : 'New Group';
        if (!acc[key]) acc[key] = [];
        acc[key].push(draft);
        return acc;
    }, {});

    if (!orgLoaded) {
        return (
            <div className={containerClasses}>
                <div className='flex justify-center items-center h-full'>
                    <p className='text-gray-400'>Loading...</p>
                </div>
            </div>
        );
    }

    if (orgLoaded && selectedOrg && !isAdmin) {
        return (
            <div className={containerClasses}>
                <div className='flex justify-center items-center h-full'>
                    <div className='bg-white shadow-md p-8 rounded-xl text-center'>
                        <p className='font-semibold text-gray-700 text-xl'>Access Denied</p>
                        <p className='mt-2 text-gray-500 text-sm'>You must be an admin of this organization to view this page.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className='p-6 md:p-8'>
                {/* Header */}
                <div className='mb-10'>
                    <div className='bg-blue-500 shadow-md p-6 rounded-2xl text-white'>
                        <p className='mb-3 text-lg select-none'>Total Draft Tickets</p>
                        <div className='flex justify-between items-center'>
                            <p className='font-bold text-4xl select-none'>{draftTickets.length}</p>
                            <span className='text-3xl'><MdDrafts /></span>
                        </div>
                        {selectedOrg && <p className='opacity-80 mt-2 text-sm'>{selectedOrg.name}</p>}
                    </div>
                </div>

                {/* Search */}
                <div className='flex gap-3 mb-8'>
                    <div className='relative flex-1'>
                        <input
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search draft tickets"
                            className='bg-white px-4 py-2 border border-gray-300 rounded-3xl focus:outline-none focus:ring-2 focus:ring-blue-500 w-full select-none'
                        />
                        <span className='top-3 right-3 absolute text-gray-400'><FiSearch /></span>
                    </div>
                    {selectedOrg && (
                        <button
                            onClick={() => fetchDrafts(selectedOrg.id)}
                            title="Refresh"
                            className='bg-white hover:bg-gray-50 p-2 border border-gray-300 rounded-full text-gray-500'
                        >
                            <FiRefreshCw />
                        </button>
                    )}
                </div>

                {!selectedOrg ? (
                    <div className='bg-gray-50 p-8 rounded-lg text-center'>
                        <p className='text-gray-500 text-lg'>Please select an organization.</p>
                    </div>
                ) : loading ? (
                    <div className='bg-gray-50 p-8 rounded-lg text-center'>
                        <p className='text-gray-500'>Loading draft tickets...</p>
                    </div>
                ) : error ? (
                    <div className='bg-red-50 p-8 rounded-lg text-center'>
                        <p className='text-red-500'>{error}</p>
                    </div>
                ) : filtered.length === 0 ? (
                    <div className='bg-gray-50 p-8 rounded-lg text-center'>
                        <p className='text-gray-500 text-lg'>No draft tickets. All tickets have been reviewed.</p>
                    </div>
                ) : (
                    <div className='space-y-6'>
                        {Object.entries(groupedByTopic).map(([groupName, drafts], topicIndex) => (
                            <div key={topicIndex} className='bg-red-50 border border-red-200 rounded-xl overflow-hidden'>
                                <div className='bg-red-100 px-6 py-3 border-red-200 border-b'>
                                    <div className='flex justify-between items-center'>
                                        <h2 className='font-bold text-red-900 text-lg'>{groupName}</h2>
                                        <span className='bg-red-200 px-3 py-1 rounded-full font-semibold text-red-900 text-sm select-none'>
                                            {drafts.length} Draft{drafts.length !== 1 ? 's' : ''}
                                        </span>
                                    </div>
                                </div>
                                <div className='space-y-3 p-4'>
                                    {drafts.map((draft, idx) => (
                                        <div
                                            key={idx}
                                            className='bg-white shadow-sm hover:shadow-md p-4 rounded-lg transition-shadow cursor-pointer'
                                            onClick={() => navigate('/admin-activity', { state: { draft, org: selectedOrg } })}
                                        >
                                            <div className='flex justify-between items-start mb-2'>
                                                <div className='flex-1'>
                                                    <h3 className='font-bold text-gray-800 text-lg'>{draft.Title}</h3>
                                                    <p className='mt-1 text-gray-600 text-sm line-clamp-2'>{draft.Detail}</p>
                                                </div>
                                                <div className='flex items-center gap-2 ml-4'>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold select-none ${getStatusBadgeColor(draft.status)}`}>
                                                        {draft.status}
                                                    </span>
                                                    <span className='bg-orange-100 px-3 py-1 rounded-full font-semibold text-orange-700 text-xs select-none'>
                                                        Draft
                                                    </span>
                                                </div>
                                            </div>
                                            <div className='flex justify-between items-center pt-2 border-gray-100 border-t'>
                                                <p className='text-gray-500 text-xs'>
                                                    Match: <span className='font-semibold text-blue-600'>{Math.round((draft.MatchScore || 0) * 100)}%</span>
                                                </p>
                                                <span className='text-gray-500 text-xs select-none'>
                                                    {draft.ticket ? new Date(draft.ticket.CreatedAt).toLocaleDateString() : ''}
                                                </span>
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
