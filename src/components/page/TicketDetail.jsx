import React, { useState, useEffect } from 'react';
import API_BASE from '../../config/api';

const TicketDetail = ({ ticket, onBack, isAdmin, isAssignee }) => {
    const [commentText, setCommentText] = useState('');
    const [commentType, setCommentType] = useState('public'); // 'public' | 'internal'
    const [comments, setComments] = useState([]);
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Fetch real comments when ticket detail opens
    useEffect(() => {
        if (!ticket.groupId) return;
        const fetchComments = async () => {
            const token = localStorage.getItem('authToken');
            if (!token) return;
            setCommentsLoading(true);
            try {
                const res = await fetch(`${API_BASE}/api/comments/group/${ticket.groupId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const raw = data.data?.comments || data.data || [];
                    const canSeeInternal = isAdmin || isAssignee;
                    setComments(
                        raw
                            .map(c => ({
                                id: c.id,
                                email: `User #${c.CreatedBy}`,
                                date: new Date(c.CreateAt || c.CreatedAt).toLocaleString(),
                                message: c.Detail,
                                type: c.isPublic ? 'public' : 'internal'
                            }))
                            .filter(c => c.type === 'public' || canSeeInternal)
                    );
                }
            } catch (e) {
                console.error('Failed to load comments', e);
            } finally {
                setCommentsLoading(false);
            }
        };
        fetchComments();
    }, [ticket.groupId]);

    // ── Edit mode state ──
    const [isEditing, setIsEditing] = useState(false);
    const [editStatus, setEditStatus] = useState(ticket.status);
    const [editAssignees, setEditAssignees] = useState(
        Array.isArray(ticket.assignedTo) ? ticket.assignedTo : []
    );

    // Fetch real assignment records (with IDs) so we can delete them
    useEffect(() => {
        if (!ticket.groupId) return;
        const token = localStorage.getItem('authToken');
        if (!token) return;
        fetch(`${API_BASE}/api/assignments/group/${ticket.groupId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                const records = data.data?.assignees || [];
                if (records.length === 0) return;
                setEditAssignees(prev => prev.map(a => {
                    const rec = records.find(r => r.userId === a.userId);
                    return rec ? { ...a, assignmentId: rec.assignmentId } : a;
                }));
            })
            .catch(() => {});
    }, [ticket.groupId]);

    const [timeline, setTimeline] = useState([]);

    // Fetch ticket logs (timeline) when ticket detail opens
    useEffect(() => {
        if (!ticket.groupId) return;
        const token = localStorage.getItem('authToken');
        if (!token) return;
        fetch(`${API_BASE}/api/tickets/${ticket.groupId}/logs`, {
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
    }, [ticket.groupId]);

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
        fetch(`${API_BASE}/api/tickets/org/${org.id}/stats/members`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(d => setOrgMembers((d.result || []).map(m => ({ userId: m.userId, email: m.email || `User #${m.userId}` }))))
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

        if (ticket.predictionId) {
            setSaving(true);
            try {
                const res = await fetch(`${API_BASE}/api/tickets/prediction/${ticket.predictionId}/status`, {
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

    const removeAssignee = async (userId) => {
        const token = localStorage.getItem('authToken');
        const target = editAssignees.find(a => a.userId === userId);
        setEditAssignees(prev => prev.filter(a => a.userId !== userId));
        if (!target?.assignmentId || !token) return;
        try {
            const res = await fetch(`${API_BASE}/api/assignments/${target.assignmentId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (!res.ok) {
                const err = await res.json();
                alert(err.error || 'Failed to remove assignee');
                setEditAssignees(prev => [...prev, target]);
            }
        } catch (e) {
            console.error('Failed to remove assignee', e);
            setEditAssignees(prev => [...prev, target]);
        }
    };

    const addAssignee = async (member) => {
        setAssigneeSearch('');
        setShowAssigneeDropdown(false);
        const token = localStorage.getItem('authToken');
        const org = JSON.parse(localStorage.getItem('selectedOrganization') || 'null');
        if (!token || !ticket.groupId || !org?.id) {
            setEditAssignees(prev => [...prev, member]);
            return;
        }
        try {
            const res = await fetch(`${API_BASE}/api/assignments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ GroupId: ticket.groupId, AssigneeId: member.userId, OrgId: org.id })
            });
            if (res.ok) {
                const data = await res.json();
                const assignmentId = data.data?.assignment?.id ?? null;
                setEditAssignees(prev => [...prev, { ...member, assignmentId }]);
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to add assignee');
            }
        } catch (e) {
            console.error('Failed to persist assignee', e);
            setEditAssignees(prev => [...prev, member]);
        }
    };

    const handleSend = async () => {
        if (!commentText.trim()) return;
        const token = localStorage.getItem('authToken');
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;

        if (token && ticket.groupId) {
            try {
                const res = await fetch(`${API_BASE}/api/comments`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        GroupId: ticket.groupId,
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
                ) : (isAdmin || isAssignee) ? (
                    <button onClick={() => setIsEditing(true)} className='hover:bg-gray-50 px-4 py-1.5 border border-gray-300 rounded-lg text-gray-700 text-sm'>
                        Edit
                    </button>
                ) : null}
            </div>

            {/* Group ticket info banner */}
            {ticket.groupTitle && (
                <div className='flex flex-wrap items-center gap-2 bg-blue-50 mb-4 px-4 py-2.5 border border-blue-200 rounded-xl'>
                    <span className='font-bold text-blue-800 text-sm'>Group #{ticket.groupId}</span>
                    <span className='font-semibold text-blue-700 text-sm'>— {ticket.groupTitle}</span>
                    {ticket.groupCategory && (
                        <span className='bg-purple-100 px-2.5 py-0.5 rounded-full font-semibold text-purple-700 text-xs'>{ticket.groupCategory}</span>
                    )}
                    {ticket.groupStatus && (
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            ticket.groupStatus === 'Solved' ? 'bg-green-100 text-green-700'
                            : ticket.groupStatus === 'Failed' ? 'bg-red-100 text-red-700'
                            : ticket.groupStatus === 'Solving' ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>{ticket.groupStatus}</span>
                    )}
                    {ticket.groupDeadline && (
                        <span className='ml-auto text-blue-600 text-xs'>
                            Due {new Date(ticket.groupDeadline).toLocaleDateString()}
                        </span>
                    )}
                </div>
            )}

            {/* Two-column body */}
            <div className='flex lg:flex-row flex-col items-stretch gap-6'>
                {/* Left: predict detail */}
                <div className='flex-1'>
                    <p className='mb-4 font-bold text-[#4377E5] text-xl'>Original Request</p>
                    <div className='flex flex-col gap-3 mb-4'>
                        <p className='font-bold text-sm'>TITLE</p>
                        <input readOnly value={ticket.topicName} className='bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg w-full text-sm' />
                        <p className='text-sm'>Request Message</p>
                        <textarea readOnly rows={4} value={ticket.message} className='bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg w-full text-sm resize-none' />
                        {ticket.suggest && (
                            <>
                                <p className='text-sm'>AI Suggestion</p>
                                <div className='bg-blue-50 px-3 py-2 border border-blue-200 rounded-lg text-gray-700 text-sm'>{ticket.suggest}</div>
                            </>
                        )}
                        {ticket.category && (
                            <>
                                <p className='text-sm'>AI Category</p>
                                <div>
                                    <span className='inline-block bg-purple-100 px-3 py-1 rounded-full font-semibold text-purple-700 text-sm'>{ticket.category}</span>
                                </div>
                            </>
                        )}
                        <div className='flex gap-6 text-gray-500 text-xs'>
                            <span>Match Score: <strong className='text-blue-600'>{Math.round((ticket.matchScore || 0) * 100)}%</strong></span>
                            <span>Ticket: <strong>#{String(ticket.predictionId).padStart(5, '0')}</strong></span>
                        </div>
                    </div>

                    <p className='mb-2 font-semibold text-gray-700'>Timeline:</p>
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

                    {/* Status buttons + note — only visible to admins/assignees in edit mode */}
                    <div className={`${(isAdmin || isAssignee) && isEditing ? '' : 'invisible pointer-events-none'}`}>
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
                            {(isAdmin || isAssignee) && (
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

export default TicketDetail;
