import React, { useState, useEffect } from 'react';
import { FiSearch, FiRefreshCw } from "react-icons/fi";
import { MdDrafts } from "react-icons/md";
import { useOutletContext } from 'react-router-dom';

const AdminPage = () => {
    const { sidebarOpen } = useOutletContext() ?? {};
    const [showDetailPage, setShowDetailPage] = useState(false);
    const [selectedDraft, setSelectedDraft] = useState(null);
    const [draftTickets, setDraftTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
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

    const fetchDrafts = async (orgId) => {
        const token = localStorage.getItem('authToken');
        if (!token || !orgId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`http://localhost/api/tickets/org/${orgId}/drafts`, {
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

    const containerClasses = `w-full h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'
        }`;

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

    // Group by suggested GroupId (null = New Group)
    const groupedByTopic = filtered.reduce((acc, draft) => {
        const key = draft.GroupId ? `Merge → Group #${draft.GroupId}` : 'New Group';
        if (!acc[key]) acc[key] = [];
        acc[key].push(draft);
        return acc;
    }, {});

    if (showDetailPage && selectedDraft) {
        return (
            <div className={containerClasses}>
                <div className='p-6 md:p-8'>
                    <button
                        onClick={() => { setShowDetailPage(false); setSelectedDraft(null); }}
                        className='flex items-center gap-1 mb-6 text-gray-500 hover:text-gray-800 text-sm'
                    >
                        ← Back
                    </button>
                    <div className='bg-white shadow p-6 border border-gray-200 rounded-2xl'>
                        <div className='flex flex-wrap items-center gap-2 mb-3'>
                            <span className='font-bold text-gray-800 text-lg'>
                                #{String(selectedDraft.TicketId).padStart(5, '0')}
                            </span>
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeColor(selectedDraft.status)}`}>
                                {selectedDraft.status}
                            </span>
                            <span className='bg-orange-100 px-2.5 py-0.5 rounded-full font-semibold text-orange-700 text-xs'>Draft</span>
                        </div>
                        <h3 className='mb-1 font-bold text-gray-800 text-xl'>{selectedDraft.Title}</h3>
                        <p className='mb-4 text-gray-600 text-sm'>{selectedDraft.Detail}</p>

                        <div className='gap-4 grid grid-cols-2 mb-4 text-sm'>
                            <div>
                                <p className='mb-1 font-semibold text-gray-500 text-xs uppercase'>Match Score</p>
                                <p className='font-bold text-blue-600'>{Math.round((selectedDraft.MatchScore || 0) * 100)}%</p>
                            </div>
                            <div>
                                <p className='mb-1 font-semibold text-gray-500 text-xs uppercase'>Suggested Group</p>
                                <p className='text-gray-700'>{selectedDraft.GroupId ? `Group #${selectedDraft.GroupId}` : 'New Group'}</p>
                            </div>
                            <div>
                                <p className='mb-1 font-semibold text-gray-500 text-xs uppercase'>Suggested Assignee ID</p>
                                <p className='text-gray-700'>{selectedDraft.assignee || 'None'}</p>
                            </div>
                            <div>
                                <p className='mb-1 font-semibold text-gray-500 text-xs uppercase'>Submitted</p>
                                <p className='text-gray-700'>
                                    {selectedDraft.ticket ? new Date(selectedDraft.ticket.CreatedAt).toLocaleDateString() : '—'}
                                </p>
                            </div>
                        </div>

                        {selectedDraft.Suggest && (
                            <div className='bg-blue-50 p-4 border border-blue-200 rounded-xl'>
                                <p className='mb-1 font-semibold text-blue-700 text-xs uppercase'>AI Suggestion</p>
                                <p className='text-gray-700 text-sm'>{selectedDraft.Suggest}</p>
                            </div>
                        )}
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
                                            onClick={() => { setSelectedDraft(draft); setShowDetailPage(true); }}
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
