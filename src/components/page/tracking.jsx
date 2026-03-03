import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuSend, LuWrench } from "react-icons/lu";
import { MdAccessTime } from "react-icons/md";
import { IoMdCheckmarkCircleOutline, IoMdCloseCircle } from "react-icons/io";
import { FiSearch } from "react-icons/fi";

/* ─── Ticket Detail View ─────────────────────────────────────── */

const TicketDetail = ({ ticket, onBack, isAdmin }) => {
    const [commentText, setCommentText] = useState('');
    const [commentType, setCommentType] = useState('public'); // 'public' | 'internal'
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch real comments when ticket detail opens
    useEffect(() => {
        if (!ticket.predictionId) return;
        const fetchComments = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            setCommentsLoading(true);
            try {
                const res = await fetch(`http://localhost/api/comments/group/${ticket.predictionId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const raw = data.data?.comments || data.data || [];
                    setComments(raw.map(c => ({
                        id: c.id,
                        email: `User #${c.CreatedBy}`,
                        date: new Date(c.CreateAt || c.CreatedAt).toLocaleString(),
                        message: c.Detail,
                        type: c.isPublic ? 'public' : 'internal'
                    })));
                }
            } catch (e) {
                console.error('Failed to load comments', e);
            } finally {
                setCommentsLoading(false);
            }
        };
        fetchComments();
    }, [ticket.predictionId]);

    // ── Edit mode state ──
    const [isEditing, setIsEditing] = useState(false);
    const [editStatus, setEditStatus] = useState(ticket.status);
    const [editAssignees, setEditAssignees] = useState(
        Array.isArray(ticket.assignedTo) ? ticket.assignedTo : []
    );
    const [timeline, setTimeline] = useState([]);

    // Fetch ticket logs (timeline) when ticket detail opens
    useEffect(() => {
        if (!ticket.ticketId) return;
        const token = localStorage.getItem('authToken');
        if (!token) return;
        fetch(`http://localhost/api/tickets/${ticket.predictionId}/logs`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                const logs = data.result || [];
                setTimeline(logs.map(l => ({
                    status: String(l.status).toUpperCase(),
                    date: new Date(l.CreatedAt).toLocaleString(),
                    detail: ''
                })));
            })
            .catch(e => console.error('Failed to load ticket logs', e));
    }, [ticket.ticketId]);
    const [editNote, setEditNote] = useState('');
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [assigneeSearch, setAssigneeSearch] = useState('');
    const [orgMembers, setOrgMembers] = useState([]);

    // Fetch org members for assignee dropdown — store {userId, email}
    useEffect(() => {
        const org = JSON.parse(localStorage.getItem('selectedOrganization') || 'null');
        if (!org) return;
        const token = localStorage.getItem('authToken');
        if (!token) return;
        fetch(`http://localhost/api/tickets/org/${org.id}/stats/members`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => setOrgMembers((d.result || []).map(m => ({ userId: m.userId, email: `User #${m.userId}` }))))
            .catch(() => {});
    }, []);

    const filteredUsers = orgMembers.filter(
        u => u.email.toLowerCase().includes(assigneeSearch.toLowerCase()) &&
            !editAssignees.find(a => a.userId === u.userId)
    );

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        const apiStatus = editStatus.toLowerCase();
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        const newStep = { status: editStatus.toUpperCase(), date: dateStr, detail: editNote.trim() };

        // Persist status change for all statuses (not just solved/failed)
        if (ticket.predictionId) {
            setSaving(true);
            try {
                const res = await fetch(`http://localhost/api/tickets/prediction/${ticket.predictionId}/status`, {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ status: apiStatus })
                });
                if (!res.ok) {
                    const err = await res.json();
                    alert(err.error || 'Failed to update status');
                    setSaving(false);
                    return;
                }
            } catch (e) {
                console.error('Status update error', e);
                alert('Failed to update status. Please try again.');
                setSaving(false);
                return;
            } finally {
                setSaving(false);
            }
        }

        setTimeline(prev => [...prev, newStep]);
        ticket.status = editStatus;
        ticket.assignedTo = editAssignees;
        ticket.timeline = [...timeline, newStep];
        setEditNote('');
        setIsEditing(false);
        setShowAssigneeDropdown(false);
    };

    const handleRevert = () => {
        setEditStatus(ticket.status);
        setEditAssignees(Array.isArray(ticket.assignedTo) ? ticket.assignedTo : []);
        setEditNote('');
        setShowAssigneeDropdown(false);
        setAssigneeSearch('');
    };

    const handleCancel = () => {
        handleRevert();
        setIsEditing(false);
    };

    const removeAssignee = (userId) => setEditAssignees(prev => prev.filter(a => a.userId !== userId));

    const addAssignee = async (member) => {
        setEditAssignees(prev => [...prev, member]);
        setAssigneeSearch('');
        setShowAssigneeDropdown(false);
        // Persist: call API with predictionId scoped assignment
        const token = localStorage.getItem('authToken');
        const org = JSON.parse(localStorage.getItem('selectedOrganization') || 'null');
        if (!token || !ticket.predictionId || !org?.id) return;
        try {
            await fetch('http://localhost/api/assignments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ GroupId: ticket.predictionId, AssigneeId: member.userId, OrgId: org.id })
            });
        } catch (e) {
            console.error('Failed to persist assignee', e);
        }
    };

    const handleSend = async () => {
        if (!commentText.trim()) return;
        const token = localStorage.getItem('authToken');
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

        if (token && ticket.predictionId) {
            try {
                const res = await fetch('http://localhost/api/comments', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        GroupId: ticket.predictionId,
                        Detail: commentText.trim(),
                        isPublic: commentType === 'public'
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    const c = data.data;
                    setComments(prev => [...prev, {
                        id: c?.id,
                        email: `User #${c?.CreatedBy}`,
                        date: dateStr,
                        message: commentText.trim(),
                        type: commentType
                    }]);
                } else {
                    // Fallback: add optimistically
                    setComments(prev => [...prev, { email: 'me', date: dateStr, message: commentText.trim(), type: commentType }]);
                }
            } catch (e) {
                setComments(prev => [...prev, { email: 'me', date: dateStr, message: commentText.trim(), type: commentType }]);
            }
        } else {
            setComments(prev => [...prev, { email: 'me', date: dateStr, message: commentText.trim(), type: commentType }]);
        }
        setCommentText('');
    };

    const statusBadge = (s) => {
        switch (s) {
            case 'Solved': return 'bg-green-100 text-green-700';
            case 'In Progress': return 'bg-yellow-100 text-yellow-700';
            case 'Pending': return 'bg-red-100 text-red-700';
            default: return 'bg-blue-100 text-blue-700';
        }
    };

    const timelineDot = (s) => {
        switch (s) {
            case 'SOLVED': return 'bg-green-500';
            case 'FAILED': return 'bg-red-500';
            case 'PENDING': return 'bg-yellow-400';
            case 'SOLVING': return 'bg-yellow-400';
            case 'ASSIGNED': return 'bg-blue-400';
            default: return 'bg-gray-400';
        }
    };

    const STATUS_OPTIONS = ['Assigned', 'Solving', 'Solved', 'Failed'];

    const statusButtonStyle = (s) => {
        if (editStatus === s) {
            switch (s) {
                case 'Solved': return 'bg-green-500 text-white border-green-500';
                case 'Failed': return 'bg-red-500 text-white border-red-500';
                case 'Solving': return 'bg-yellow-400 text-white border-yellow-400';
                default: return 'bg-blue-500 text-white border-blue-500';
            }
        }
        return 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50';
    };

    return (
        <div className='bg-white shadow-lg p-5 md:p-6 border border-gray-200 rounded-2xl'>
            {/* Back / Edit bar */}
            <div className='flex justify-between items-center mb-3'>
                <button onClick={onBack} className='flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm'>
                    ← Back
                </button>
                {isEditing ? (
                    <div className='flex items-center gap-2'>
                        <button onClick={handleSave} disabled={saving} className='bg-[#4377E5] hover:bg-blue-700 disabled:opacity-60 px-4 py-1.5 rounded-lg font-semibold text-white text-sm'>
                            {saving ? 'Saving…' : 'Save'}
                        </button>
                        <button onClick={handleRevert} className='hover:bg-gray-50 px-4 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm'>
                            Revert
                        </button>
                        <button onClick={handleCancel} className='hover:bg-gray-50 px-4 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm'>
                            Cancel
                        </button>
                    </div>
                ) : isAdmin ? (
                    <button onClick={() => setIsEditing(true)} className='hover:bg-gray-50 px-4 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm'>
                        Edit
                    </button>
                ) : null}
            </div>

            {/* Two-column body */}
            <div className='flex lg:flex-row flex-col items-stretch gap-6'>
                {/* Left: title + timeline */}
                <div className='flex-1'>
                    {/* Title row */}
                    <div className='flex flex-wrap items-center gap-2 mb-1'>
                        <span className='font-bold text-gray-800 text-lg'>#{ticket.id.toString().padStart(5, '0')}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(isEditing ? editStatus : ticket.status)}`}>
                            {isEditing ? editStatus : ticket.status}
                        </span>
                        <span className='bg-blue-100 px-2.5 py-0.5 rounded-full font-semibold text-blue-700 text-xs'>{ticket.organization}</span>
                    </div>
                    <p className='mb-0.5 font-semibold text-gray-700'>{ticket.topicName}</p>
                    <p className='mb-1 text-gray-600 text-sm'>{ticket.message}</p>
                    <p className='mb-3 text-gray-500 text-xs'>Assignee: <span className='text-gray-700'>{(Array.isArray(ticket.assignedTo) ? ticket.assignedTo : []).map(a => a.email).join(', ')}</span></p>

                    <p className='mb-2 font-semibold text-gray-700'>Tickets:</p>
                    <div className='space-y-3 max-h-64 overflow-y-auto'>
                        {timeline.map((step, i) => (
                            <div key={i} className='flex items-start gap-3'>
                                <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${timelineDot(step.status)}`} />
                                <div>
                                    <p className='font-bold text-gray-700 text-sm uppercase'>{step.status}
                                        <span className='ml-2 font-normal text-gray-400 text-xs'>{step.date}</span>
                                    </p>
                                    {step.detail && <p className='mt-1 text-gray-600 text-sm'>{step.detail}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: People + Status (edit) + Comments */}
                <div className='flex flex-col flex-1 gap-4'>
                    {/* People */}
                    <div>
                        <p className='mb-2 font-bold text-gray-800 text-base'>People</p>
                        <p className='font-semibold text-gray-500 text-xs uppercase tracking-wide'>Creator</p>
                        <p className='mb-2 text-gray-700 text-sm'>{ticket.createdBy?.email}</p>

                        {(ticket.followers ?? []).length > 0 && (
                            <>
                                <p className='font-semibold text-gray-500 text-xs uppercase tracking-wide'>followers</p>
                                {ticket.followers.map((f, i) => (
                                    <p key={i} className='text-gray-700 text-sm'>{f}</p>
                                ))}
                            </>
                        )}

                        <p className='mt-2 mb-1 font-semibold text-gray-500 text-xs uppercase tracking-wide'>Assignees</p>
                        <div>
                            {/* Assignee pills */}
                            <div className='flex flex-wrap gap-1.5 mb-2 min-h-6'>
                                {(isEditing ? editAssignees : (ticket.assignedTo || [])).map((a, i) => (
                                    <span key={i} className='flex items-center gap-1 bg-gray-100 px-2 py-0.5 border border-gray-300 rounded-full text-gray-700 text-xs'>
                                        {a.email}
                                        {isEditing && (
                                            <button
                                                onClick={() => removeAssignee(a.userId)}
                                                className='ml-0.5 font-bold text-gray-400 hover:text-red-500 leading-none'
                                            >
                                                ×
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                            {/* +Add button — only visible to admins in edit mode */}
                            <div className={`relative inline-block ${isAdmin && isEditing ? '' : 'invisible pointer-events-none'}`}>
                                <button
                                    onClick={() => { setShowAssigneeDropdown(v => !v); setAssigneeSearch(''); }}
                                    className='hover:bg-gray-50 px-2.5 py-0.5 border border-gray-300 rounded-full font-semibold text-blue-600 hover:text-blue-800 text-xs'
                                >
                                    + Add
                                </button>
                                {showAssigneeDropdown && (
                                    <div className='z-20 absolute bg-white shadow-lg mt-1 border border-gray-200 rounded-lg w-52'>
                                        <input
                                            autoFocus
                                            type='text'
                                            value={assigneeSearch}
                                            onChange={e => setAssigneeSearch(e.target.value)}
                                            placeholder='Enter the assignee...'
                                            className='px-3 py-2 border-gray-200 border-b rounded-t-lg focus:outline-none w-full text-xs'
                                        />
                                        <ul className='max-h-36 overflow-y-auto'>
                                            {filteredUsers.length === 0 ? (
                                                <li className='px-3 py-2 text-gray-400 text-xs'>No users found</li>
                                            ) : (
                                                filteredUsers.map((u, i) => (
                                                    <li
                                                        key={i}
                                                        onClick={() => addAssignee(u)}
                                                        className='hover:bg-blue-50 px-3 py-2 text-gray-700 text-xs cursor-pointer'
                                                    >
                                                        {u.email}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status buttons + note — only visible to admins in edit mode */}
                    <div className={`${isAdmin && isEditing ? '' : 'invisible pointer-events-none'}`}>
                        <div className='flex flex-wrap gap-2 mb-2'>
                            {STATUS_OPTIONS.map(s => (
                                <button
                                    key={s}
                                    onClick={() => setEditStatus(s)}
                                    className={`px-4 py-1.5 rounded-full text-sm font-semibold border transition-colors ${statusButtonStyle(s)}`}
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                        <textarea
                            rows={2}
                            value={editNote}
                            onChange={e => setEditNote(e.target.value)}
                            placeholder='Add a note for this status update...'
                            className='px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-gray-700 text-sm resize-none'
                        />
                    </div>

                    {/* Comments */}
                    <div>
                        <p className='mb-3 font-bold text-gray-800 text-base'>comment</p>
                        <div className='space-y-3 mb-3 pr-1 h-56 overflow-y-auto'>
                            {commentsLoading && (
                                <p className='text-gray-400 text-xs'>Loading comments...</p>
                            )}
                            {!commentsLoading && comments.length === 0 && (
                                <p className='text-gray-400 text-xs'>No comments yet.</p>
                            )}
                            {comments.map((c, i) => (
                                <div key={i} className={`rounded-lg px-3 py-2 ${c.type === 'internal' ? 'bg-yellow-50 border border-yellow-200' : ''}`}>
                                    <div className='flex flex-wrap items-center gap-2 mb-0.5'>
                                        <span className='font-semibold text-gray-800 text-xs'>{c.email}</span>
                                        {c.type === 'internal' && (
                                            <span className='bg-yellow-400 px-1.5 py-0.5 rounded font-semibold text-[10px] text-white'>Internal</span>
                                        )}
                                        <span className='text-[10px] text-gray-400'>{c.date}</span>
                                    </div>
                                    <p className='text-gray-700 text-sm'>{c.message}</p>
                                </div>
                            ))}
                        </div>

                        {/* Comment input */}
                        <div className='flex flex-wrap items-center gap-2'>
                            {/* Public / Internal toggle — admin only */}
                            {isAdmin && (
                                <button
                                    onClick={() => setCommentType(t => t === 'public' ? 'internal' : 'public')}
                                    className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${commentType === 'internal'
                                        ? 'bg-yellow-400 text-white border-yellow-400'
                                        : 'bg-red-500 text-white border-red-500'}`}
                                >
                                    <span className='inline-block bg-white rounded-full w-2 h-2' />
                                    {commentType === 'public' ? 'Public' : 'Internal'}
                                </button>
                            )}
                            <input
                                type='text'
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder='write a comment...'
                                className='flex-1 px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 min-w-0 text-sm'
                            />
                            <button
                                onClick={handleSend}
                                className='px-1 font-semibold text-blue-600 hover:text-blue-800 text-sm'
                            >
                                send
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

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

    const isAdmin = selectedOrg?.isAdmin === true;

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

    // Fetch enriched group tickets
    useEffect(() => {
        if (!selectedOrg?.id) { setReports([]); return; }
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setLoading(true);
        fetch(`http://localhost/api/tickets/org/${selectedOrg.id}/groups/enriched`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                const normalizeStatus = s => {
                    if (!s) return 'Assigned';
                    const m = { assigned: 'Assigned', solving: 'Solving', solved: 'Solved', failed: 'Failed', draft: 'Draft' };
                    return m[s.toLowerCase()] || s;
                };
                // Each group = one GroupTicket; predictions = TicketPredictions inside it
                const mapped = (data.result || []).map(g => ({
                    id: g.id,
                    title: g.Title,
                    status: normalizeStatus(g.status),
                    date: g.CreateAt ? new Date(g.CreateAt).toLocaleDateString() : '',
                    assignees: g.assignees || [],
                    timeline: g.timeline || [],
                    predictions: (g.predictions || []).map(p => {
                        const matchedTicket = (g.tickets || []).find(t => t.id === p.TicketId);
                        return {
                            id: p.TicketId || p.id,
                            groupId: g.id,
                            ticketId: p.TicketId,
                            predictionId: p.id,
                            topicName: p.Title || g.Title,
                            message: p.Detail || matchedTicket?.Detail || '',
                            organization: selectedOrg.name || `Org #${g.OrganizationId}`,
                            orgId: g.OrganizationId,
                            status: normalizeStatus(p.status),
                            date: g.CreateAt ? new Date(g.CreateAt).toLocaleDateString() : '',
                            topic: g.Title,
                            assignedTo: (p.assignees || []).map(a => ({ userId: a.id, email: a.email })),
                            timeline: g.timeline || [],
                            createdBy: { email: matchedTicket?.CreatedByEmail || (matchedTicket ? `User #${matchedTicket.CreatedBy}` : 'Unknown') },
                            followers: []
                        };
                    })
                }));
                setReports(mapped);
            })
            .catch(e => console.error('Fetch enriched groups error', e))
            .finally(() => setLoading(false));
    }, [selectedOrg?.id]);

    // Stats: count all predictions by status
    const allPredictions = reports.flatMap(g => g.predictions || []);
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
                return matchSearch && matchStatus;
            })
        }))
        .filter(g =>
            (statusFilter === 'All' || g.predictions.length > 0) &&
            (g.title?.toLowerCase().includes(search.toLowerCase()) || g.predictions.length > 0)
        );

    return (
        <div className={containerClasses}>
            <div className='p-6 md:p-8'>
                {selectedTicket ? (
                    <TicketDetail ticket={selectedTicket} onBack={() => setSelectedTicket(null)} isAdmin={isAdmin} />
                ) : (
                    <>
                        <div className='gap-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 mb-10 select-none'>
                            <StatCard label="Active Tickets" count={activeTickets} icon={<LuSend />} />
                            <StatCard label="Assigned" count={assignedTickets} icon={<MdAccessTime />} />
                            <StatCard label="Solving" count={solvingTickets} icon={<LuWrench />} />
                            <StatCard label="Solved" count={solvedTickets} icon={<IoMdCheckmarkCircleOutline />} />
                            <StatCard label="Failed" count={failedTickets} icon={<IoMdCloseCircle />} />
                        </div>

                        <div className='flex gap-4 mb-8'>
                            <div className='relative flex-1'>
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
                                            <div className='flex items-center gap-3'>
                                                <h2 className='font-bold text-blue-900 text-lg'>Group #{group.id}</h2>
                                                <span className='font-semibold text-blue-700 text-base'>— {group.title}</span>
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
                                                                <span className='font-mono text-gray-400 text-xs'>#{String(prediction.ticketId || prediction.id).padStart(5, '0')}</span>
                                                                <h3 className='font-bold text-gray-800'>{prediction.topicName}</h3>
                                                            </div>
                                                            <p className='text-gray-600 text-sm'>{prediction.message}</p>
                                                        </div>
                                                        <span className={`ml-3 shrink-0 px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusBadgeColor(prediction.status)}`}>
                                                            {prediction.status}
                                                        </span>
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
