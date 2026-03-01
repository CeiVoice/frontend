import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { LuSend, LuWrench } from "react-icons/lu";
import { MdAccessTime } from "react-icons/md";
import { IoMdCheckmarkCircleOutline } from "react-icons/io";
import { FiSearch } from "react-icons/fi";
import { COMMENTS } from '../constants/comments';

/* ─── Ticket Detail View ─────────────────────────────────────── */
const ALL_USERS = [
    '67011274@kmitl.ac.th',
    '67011213@kmitl.ac.th',
    '67676767@kmitl.ac.th',
];

const TicketDetail = ({ ticket, onBack }) => {
    const [commentText, setCommentText] = useState('');
    const [commentType, setCommentType] = useState('public'); // 'public' | 'internal'
    const [comments, setComments] = useState(
        COMMENTS.filter(c => c.ticketId === ticket.id)
    );

    // ── Edit mode state ──
    const [isEditing, setIsEditing] = useState(false);
    const [editStatus, setEditStatus] = useState(ticket.status);
    const [editAssignees, setEditAssignees] = useState(
        ticket.assignedTo ? [ticket.assignedTo] : []
    );
    const [timeline, setTimeline] = useState(ticket.timeline ?? []);
    const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
    const [assigneeSearch, setAssigneeSearch] = useState('');

    const filteredUsers = ALL_USERS.filter(
        u => u.toLowerCase().includes(assigneeSearch.toLowerCase()) && !editAssignees.includes(u)
    );

    const handleSave = () => {
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        const newStep = { status: editStatus.toUpperCase(), date: dateStr };
        setTimeline(prev => [...prev, newStep]);
        ticket.status = editStatus;
        ticket.assignedTo = editAssignees[0] ?? '';
        ticket.timeline = [...timeline, newStep];
        setIsEditing(false);
        setShowAssigneeDropdown(false);
    };

    const handleRevert = () => {
        setEditStatus(ticket.status);
        setEditAssignees(ticket.assignedTo ? [ticket.assignedTo] : []);
        setShowAssigneeDropdown(false);
        setAssigneeSearch('');
    };

    const handleCancel = () => {
        handleRevert();
        setIsEditing(false);
    };

    const removeAssignee = (email) => setEditAssignees(prev => prev.filter(a => a !== email));

    const addAssignee = (email) => {
        setEditAssignees(prev => [...prev, email]);
        setAssigneeSearch('');
        setShowAssigneeDropdown(false);
    };

    const handleSend = () => {
        if (!commentText.trim()) return;
        const now = new Date();
        const pad = n => String(n).padStart(2, '0');
        const dateStr = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())} ${now.getHours() >= 12 ? 'PM' : 'AM'}`;
        setComments(prev => [...prev, { email: 'me@kmitl.ac.th', date: dateStr, message: commentText.trim(), type: commentType }]);
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
        <div className='bg-white rounded-2xl shadow-lg border border-gray-200 p-6 md:p-8'>
            {/* Back / Edit bar */}
            <div className='flex items-center justify-between mb-4'>
                <button onClick={onBack} className='text-sm text-gray-500 hover:text-gray-800 flex items-center gap-1'>
                    ← Back
                </button>
                {isEditing ? (
                    <div className='flex items-center gap-2'>
                        <button onClick={handleSave} className='px-4 py-1.5 rounded-lg bg-blue-500 text-white text-sm font-semibold hover:bg-blue-600'>
                            Save
                        </button>
                        <button onClick={handleRevert} className='px-4 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50'>
                            Revert
                        </button>
                        <button onClick={handleCancel} className='px-4 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50'>
                            Cancel
                        </button>
                    </div>
                ) : (
                    <button onClick={() => setIsEditing(true)} className='px-4 py-1.5 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50'>
                        Edit
                    </button>
                )}
            </div>

            {/* Two-column body */}
            <div className='flex flex-col lg:flex-row gap-8 items-stretch'>
                {/* Left: title + timeline */}
                <div className='flex-1'>
                    {/* Title row */}
                    <div className='flex flex-wrap items-center gap-2 mb-1'>
                        <span className='font-bold text-gray-800 text-lg'>#{ticket.id.toString().padStart(5, '0')}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusBadge(isEditing ? editStatus : ticket.status)}`}>
                            {isEditing ? editStatus : ticket.status}
                        </span>
                        <span className='px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700'>{ticket.organization}</span>
                    </div>
                    <p className='text-gray-700 font-semibold mb-0.5'>{ticket.topicName}</p>
                    <p className='text-gray-600 text-sm mb-1'>{ticket.message}</p>
                    <p className='text-xs text-gray-500 mb-4'>Assignee: <span className='text-gray-700'>{ticket.assignedTo}</span></p>

                    <p className='font-semibold text-gray-700 mb-3'>Tickets:</p>
                    <div className='space-y-4'>
                        {timeline.map((step, i) => (
                            <div key={i} className='flex items-start gap-3'>
                                <div className={`mt-1 w-3 h-3 rounded-full shrink-0 ${timelineDot(step.status)}`} />
                                <div>
                                    <p className='text-sm font-bold text-gray-700 uppercase'>{step.status}
                                        <span className='font-normal text-gray-400 ml-2 text-xs'>{step.date}</span>
                                    </p>
                                    <p className='text-gray-600 mt-1 text-sm'>Details</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: People + Status (edit) + Comments */}
                <div className='flex-1 flex flex-col gap-6'>
                    {/* People */}
                    <div>
                        <p className='font-bold text-gray-800 text-base mb-2'>People</p>
                        <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>Creator</p>
                        <p className='text-sm text-gray-700 mb-2'>{ticket.createdBy?.email}</p>

                        {(ticket.followers ?? []).length > 0 && (
                            <>
                                <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide'>followers</p>
                                {ticket.followers.map((f, i) => (
                                    <p key={i} className='text-sm text-gray-700'>{f}</p>
                                ))}
                            </>
                        )}

                        <p className='text-xs font-semibold text-gray-500 uppercase tracking-wide mt-2 mb-1'>Assignees</p>
                        <div>
                            {/* Assignee pills — always visible; × button only active in edit mode */}
                            <div className='flex flex-wrap gap-1.5 mb-2 min-h-[24px]'>
                                {(isEditing ? editAssignees : (ticket.assignedTo ? [ticket.assignedTo] : [])).map((a, i) => (
                                    <span key={i} className='flex items-center gap-1 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-300 text-xs text-gray-700'>
                                        {a}
                                        {isEditing && (
                                            <button
                                                onClick={() => removeAssignee(a)}
                                                className='ml-0.5 text-gray-400 hover:text-red-500 font-bold leading-none'
                                            >
                                                ×
                                            </button>
                                        )}
                                    </span>
                                ))}
                            </div>
                            {/* +Add button — invisible but space-reserved when not editing */}
                            <div className={`relative inline-block ${isEditing ? '' : 'invisible pointer-events-none'}`}>
                                <button
                                    onClick={() => { setShowAssigneeDropdown(v => !v); setAssigneeSearch(''); }}
                                    className='text-xs text-blue-600 hover:text-blue-800 font-semibold border border-gray-300 rounded-full px-2.5 py-0.5 hover:bg-gray-50'
                                >
                                    + Add
                                </button>
                                {showAssigneeDropdown && (
                                    <div className='absolute z-20 mt-1 w-52 bg-white border border-gray-200 rounded-lg shadow-lg'>
                                        <input
                                            autoFocus
                                            type='text'
                                            value={assigneeSearch}
                                            onChange={e => setAssigneeSearch(e.target.value)}
                                            placeholder='Enter the assignee...'
                                            className='w-full px-3 py-2 text-xs border-b border-gray-200 focus:outline-none rounded-t-lg'
                                        />
                                        <ul className='max-h-36 overflow-y-auto'>
                                            {filteredUsers.length === 0 ? (
                                                <li className='px-3 py-2 text-xs text-gray-400'>No users found</li>
                                            ) : (
                                                filteredUsers.map((u, i) => (
                                                    <li
                                                        key={i}
                                                        onClick={() => addAssignee(u)}
                                                        className='px-3 py-2 text-xs text-gray-700 hover:bg-blue-50 cursor-pointer'
                                                    >
                                                        {u}
                                                    </li>
                                                ))
                                            )}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Status buttons — always rendered to reserve space */}
                    <div className={`flex flex-wrap gap-2 ${isEditing ? '' : 'invisible pointer-events-none'}`}>
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

                    {/* Comments */}
                    <div>
                        <p className='font-bold text-gray-800 text-base mb-3'>comment</p>
                        <div className='space-y-3 mb-4 h-64 overflow-y-auto pr-1'>
                            {comments.length === 0 && (
                                <p className='text-xs text-gray-400'>No comments yet.</p>
                            )}
                            {comments.map((c, i) => (
                                <div key={i} className={`rounded-lg px-3 py-2 ${c.type === 'internal' ? 'bg-yellow-50 border border-yellow-200' : ''}`}>
                                    <div className='flex flex-wrap items-center gap-2 mb-0.5'>
                                        <span className='text-xs font-semibold text-gray-800'>{c.email}</span>
                                        {c.type === 'internal' && (
                                            <span className='px-1.5 py-0.5 text-[10px] rounded bg-yellow-400 text-white font-semibold'>Internal</span>
                                        )}
                                        <span className='text-[10px] text-gray-400'>{c.date}</span>
                                    </div>
                                    <p className='text-sm text-gray-700'>{c.message}</p>
                                </div>
                            ))}
                        </div>

                        {/* Comment input */}
                        <div className='flex items-center gap-2 flex-wrap'>
                            {/* Public / Internal toggle */}
                            <button
                                onClick={() => setCommentType(t => t === 'public' ? 'internal' : 'public')}
                                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${commentType === 'internal'
                                    ? 'bg-yellow-400 text-white border-yellow-400'
                                    : 'bg-red-500 text-white border-red-500'}`}
                            >
                                <span className='w-2 h-2 rounded-full bg-white inline-block' />
                                {commentType === 'public' ? 'Public' : 'Internal'}
                            </button>
                            <input
                                type='text'
                                value={commentText}
                                onChange={e => setCommentText(e.target.value)}
                                onKeyDown={e => e.key === 'Enter' && handleSend()}
                                placeholder='write a comment...'
                                className='flex-1 min-w-0 px-3 py-1.5 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400'
                            />
                            <button
                                onClick={handleSend}
                                className='text-sm text-blue-600 font-semibold hover:text-blue-800 px-1'
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
    const { reports = [], sidebarOpen } = useOutletContext() ?? {};
    const containerClasses = `w-full min-h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'
        }`;

    const [search, setSearch] = useState('');
    const [selectedTicket, setSelectedTicket] = useState(null);

    const activeTickets = reports.filter(r => r.status === 'Pending' || r.status === 'In Progress').length;
    const pendingTickets = reports.filter(r => r.status === 'Pending').length;
    const inProgressTickets = reports.filter(r => r.status === 'In Progress').length;
    const solvedTickets = reports.filter(r => r.status === 'Solved').length;

    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'Pending':
                return 'bg-red-100 text-red-700';
            case 'In Progress':
                return 'bg-yellow-100 text-yellow-700';
            case 'Solved':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-blue-100 text-blue-700';
        }
    };

    const StatCard = ({ label, count, icon }) => (
        <div className='bg-white rounded-2xl p-6 shadow-md border-2 border-blue-200'>
            <p className='text-gray-600 text-lg mb-3'>{label}</p>
            <div className='flex items-center justify-between'>
                <p className='text-4xl font-bold text-gray-800'>{count}</p>
                <span className='text-3xl'>{icon}</span>
            </div>
        </div>
    );

    const filtered = reports.filter(r =>
        r.topicName?.toLowerCase().includes(search.toLowerCase()) ||
        r.message?.toLowerCase().includes(search.toLowerCase()) ||
        r.topic?.toLowerCase().includes(search.toLowerCase())
    );

    // Group tickets by organization
    const groupedByOrg = filtered.reduce((acc, report) => {
        const org = report.organization || 'Uncategorized';
        if (!acc[org]) acc[org] = [];
        acc[org].push(report);
        return acc;
    }, {});

    return (
        <div className={containerClasses}>
            <div className='p-6 md:p-8'>
                {selectedTicket ? (
                    <div className='h-200'>
                        <TicketDetail ticket={selectedTicket} onBack={() => setSelectedTicket(null)} />
                    </div>
                ) : (
                    <>
                        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10 select-none'>
                            <StatCard label="Active Tickets" count={activeTickets} icon={<LuSend />} />
                            <StatCard label="Pending" count={pendingTickets} icon={<MdAccessTime />} />
                            <StatCard label="In Progress" count={inProgressTickets} icon={<LuWrench />} />
                            <StatCard label="Solved" count={solvedTickets} icon={<IoMdCheckmarkCircleOutline />} />
                        </div>

                        <div className='flex gap-4 mb-8'>
                            <div className='relative flex-1'>
                                <input
                                    type="text"
                                    placeholder="Search"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className='select-none w-full px-4 py-2 rounded-3xl border bg-white border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500'
                                />
                                <span className='absolute right-3 top-3 text-gray-400'><FiSearch /></span>
                            </div>
                        </div>

                        {filtered.length === 0 ? (
                            <div className='bg-gray-50 rounded-lg p-8 text-center'>
                                <p className='text-gray-500 text-lg'>No submissions yet. Create a report to get started.</p>
                            </div>
                        ) : (
                            <div className='space-y-6'>
                                {Object.entries(groupedByOrg).map(([organization, orgReports], orgIndex) => (
                                    <div key={orgIndex} className='bg-blue-50 rounded-xl overflow-hidden border border-blue-200'>
                                        <div className='bg-blue-100 px-6 py-3 border-b border-blue-200'>
                                            <h2 className='text-lg font-bold text-blue-900'>Group {orgIndex + 1}</h2>
                                        </div>
                                        <div className='space-y-3 p-4'>
                                            {orgReports.map((report, reportIndex) => (
                                                <div
                                                    key={reportIndex}
                                                    onClick={() => setSelectedTicket(report)}
                                                    className='bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer'
                                                >
                                                    <div className='flex justify-between items-start mb-2'>
                                                        <div>
                                                            <h3 className='text-lg font-bold text-gray-800'>{report.topicName}</h3>
                                                            <p className='text-gray-600 mt-1 text-sm'>{report.message}</p>
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
                    </>
                )}
            </div>
        </div>
    );
};

export default Tracking;
