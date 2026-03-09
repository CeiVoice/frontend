import React, { useState, useEffect } from 'react';
import { useOutletContext, useLocation, useNavigate } from 'react-router-dom';
import API_BASE from '../../config/api';

const AdminActivity = () => {
    const { sidebarOpen } = useOutletContext() ?? {};
    const { state } = useLocation();
    const navigate = useNavigate();

    const draft = state?.draft ?? null;
    const org = state?.org ?? JSON.parse(localStorage.getItem('selectedOrganization') || 'null');

    const containerClasses = `w-full min-h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'}`;

    const [title, setTitle] = useState(draft?.Title ?? '');
    const [detail, setDetail] = useState(draft?.Detail ?? '');
    const [summary, setSummary] = useState(draft?.Suggest ?? '');
    const [category, setCategory] = useState(draft?.Category ?? '');
    const [resolutionPath, setResolutionPath] = useState('');
    const [deadline, setDeadline] = useState('');
    const [assignees, setAssignees] = useState([]);
    const [assigneeSearch, setAssigneeSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [allMembers, setAllMembers] = useState([]);
    const [submitting, setSubmitting] = useState(false);
    const [saving, setSaving] = useState(false);
    const [groups, setGroups] = useState([]);
    // null = create new group; number = merge into that group id
    const [selectedGroupId, setSelectedGroupId] = useState(draft?.GroupId ?? null);

    useEffect(() => {
        if (!org?.id) return;
        const token = localStorage.getItem('authToken');
        fetch(`${API_BASE}/api/organizations/member/org/${org.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => {
                const members = (data.result || []).map(m => ({
                    UserId: m.UserId,
                    Email: m.User?.Email ?? m.Email ?? `User #${m.UserId}`
                }));
                setAllMembers(members);
            })
            .catch(console.error);
    }, [org?.id]);

    // Load existing groups for the org so admin can choose which to merge into
    useEffect(() => {
        if (!org?.id) return;
        const token = localStorage.getItem('authToken');
        fetch(`${API_BASE}/api/tickets/org/${org.id}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setGroups(data.result || []))
            .catch(console.error);
    }, [org?.id]);

    // Pre-populate with the AI-suggested assignee once members are loaded
    useEffect(() => {
        if (allMembers.length === 0 || !draft?.assignee) return;
        const suggested = allMembers.find(m => m.UserId === draft.assignee);
        if (suggested) {
            setAssignees(prev =>
                prev.find(a => a.UserId === suggested.UserId) ? prev : [...prev, suggested]
            );
        }
    }, [allMembers, draft?.assignee]);

    const filtered = allMembers.filter(
        m => m.Email.toLowerCase().includes(assigneeSearch.toLowerCase()) &&
            !assignees.find(a => a.UserId === m.UserId)
    );

    const addAssignee = (m) => {
        setAssignees(prev => [...prev, m]);
        setAssigneeSearch('');
        setShowDropdown(false);
    };
    const removeAssignee = (userId) => setAssignees(prev => prev.filter(a => a.UserId !== userId));

    const handleSave = async () => {
        const token = localStorage.getItem('authToken');
        setSaving(true);
        try {
            const res = await fetch(`${API_BASE}/api/tickets/${draft.TicketId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify({ Title: title, Detail: detail })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Saved successfully!');
            } else {
                alert(data?.error || 'Failed to save.');
            }
        } catch (err) {
            console.error(err);
            alert('Network error. Please try again.');
        } finally {
            setSaving(false);
        }
    };

    const handleRevert = () => {
        setTitle(draft?.Title ?? '');
        setDetail(draft?.Detail ?? '');
        setSummary(draft?.Suggest ?? '');
        setCategory(draft?.Category ?? '');
        setResolutionPath('');
        setDeadline('');
        setAssignees([]);
        setSelectedGroupId(draft?.GroupId ?? null);
    };

    const handleSubmit = async () => {
        if (!draft?.TicketId || !draft?.id) {
            alert('Missing ticket or prediction data.');
            return;
        }
        if (assignees.length === 0) {
            alert('Please add at least one assignee.');
            return;
        }
        if (!deadline) {
            alert('Please set a deadline.');
            return;
        }
        const token = localStorage.getItem('authToken');
        setSubmitting(true);
        try {
            const res = await fetch(`${API_BASE}/api/tickets/${draft.TicketId}/accept`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    predictionId: draft.id,
                    assignees: assignees.map(a => a.UserId),
                    deadline: new Date(deadline).toISOString(),
                    orgId: org?.id,
                    groupId: selectedGroupId,  // null = create new group
                    category: category.trim() || 'Uncategorized'
                })
            });
            const data = await res.json();
            if (res.ok) {
                alert('Ticket submitted and assigned successfully!');
                navigate('/admin');
            } else {
                alert(data?.error || 'Failed to submit ticket.');
            }
        } catch (err) {
            console.error(err);
            alert('Network error. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (!draft) {
        return (
            <div className={containerClasses}>
                <div className='flex justify-center items-center h-full'>
                    <div className='bg-white shadow-md p-8 rounded-xl text-center'>
                        <p className='text-gray-500'>No draft selected. Go back and pick a ticket.</p>
                        <button onClick={() => navigate('/admin')} className='mt-4 text-[#4377E5] text-sm underline'>← Back to Admin</button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={containerClasses}>
            <div className='bg-white shadow-md p-4 sm:p-6 md:p-8 rounded-lg'>
                <button
                    onClick={() => navigate('/admin')}
                    className='flex items-center gap-1 mb-6 text-gray-500 hover:text-gray-800 text-sm'
                >
                    ← Back
                </button>
                <div className='mx-2 sm:mx-8 md:mx-16 lg:mx-20'>
                    <p className='mb-6 md:mb-10 font-bold text-[#4377E5] text-xl md:text-2xl'>Original Request</p>
                    <div className='flex flex-col gap-3'>
                        <p className='font-bold text-sm md:text-base'>TITLE</p>
                        <input readOnly value={draft.Title ?? ''} className='bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg w-full text-sm' />
                        <p className='text-sm md:text-base'>Request Message</p>
                        <textarea readOnly rows={4} value={draft.Detail ?? ''} className='bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg w-full text-sm resize-none' />
                        {draft.Suggest && (
                            <>
                                <p className='text-sm md:text-base'>AI Suggestion</p>
                                <div className='bg-blue-50 px-3 py-2 border border-blue-200 rounded-lg w-full text-gray-700 text-sm'>{draft.Suggest}</div>
                            </>
                        )}
                        {draft.Category && (
                            <>
                                <p className='text-sm md:text-base'>AI Category</p>
                                <div className='flex items-center gap-2'>
                                    <span className='inline-block bg-purple-100 px-3 py-1 rounded-full font-semibold text-purple-700 text-sm'>{draft.Category}</span>
                                </div>
                            </>
                        )}
                        <div className='flex gap-6 mt-1 text-gray-500 text-xs'>
                            <span>Match Score: <strong className='text-blue-600'>{Math.round((draft.MatchScore || 0) * 100)}%</strong></span>
                            <span>Ticket: <strong>#{String(draft.TicketId).padStart(5, '0')}</strong></span>
                        </div>

                        {/* Group selector */}
                        <div className='mt-4'>
                            <p className='mb-2 font-semibold text-gray-700 text-sm'>Assign to Group</p>
                            <div className='flex flex-wrap gap-2'>
                                <button
                                    onClick={() => setSelectedGroupId(null)}
                                    className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                        selectedGroupId === null
                                            ? 'bg-[#4377E5] text-white border-[#4377E5]'
                                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                    }`}
                                >
                                    + New Group
                                </button>
                                {groups.map(g => (
                                    <button
                                        key={g.id}
                                        onClick={() => setSelectedGroupId(g.id)}
                                        className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                            selectedGroupId === g.id
                                                ? 'bg-[#4377E5] text-white border-[#4377E5]'
                                                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
                                        }`}
                                    >
                                        #{g.id} {g.Title}
                                        {draft.GroupId === g.id && (
                                            <span className='opacity-75 ml-1 text-[10px]'>(AI)</span>
                                        )}
                                    </button>
                                ))}
                            </div>
                            <p className='mt-1.5 text-gray-400 text-xs'>
                                {selectedGroupId === null
                                    ? 'A new group will be created for this ticket.'
                                    : `Merging into Group #${selectedGroupId}: ${groups.find(g => g.id === selectedGroupId)?.Title ?? ''}`
                                }
                            </p>
                        </div>
                    </div>

                    <hr className='my-8 md:my-10 border-gray-500 border-dashed' />

                    <p className='mb-6 md:mb-10 font-bold text-[#4377E5] text-xl md:text-2xl'>EDIT DRAFT TICKET</p>
                    <div className='flex flex-col gap-3 mb-5'>
                        <p className='font-bold text-sm md:text-base'>TITLE</p>
                        <input value={title} onChange={e => setTitle(e.target.value)} className='bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm' />
                        <p className='text-sm md:text-base'>Request Message</p>
                        <textarea rows={3} value={detail} onChange={e => setDetail(e.target.value)} className='bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm resize-none' />
                        <p className='font-bold text-sm md:text-base'>SUMMARY</p>
                        <textarea rows={4} value={summary} onChange={e => setSummary(e.target.value)} className='bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm resize-none' />
                        <p className='font-bold text-sm md:text-base'>CATEGORY</p>
                        <input
                            type='text'
                            value={category}
                            onChange={e => setCategory(e.target.value)}
                            placeholder='e.g. Bug, Feature Request, Network...'
                            className='bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm'
                        />
                        <p className='font-bold text-sm md:text-base'>RESOLUTION PATH</p>
                        <textarea rows={4} value={resolutionPath} onChange={e => setResolutionPath(e.target.value)} className='bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full text-sm resize-none' />

                        <p className='text-sm md:text-base'>ASSIGNEE</p>
                        <div className='flex flex-wrap gap-2 min-h-6'>
                            {assignees.map((a) => (
                                <span key={a.UserId} className='flex items-center gap-1 bg-blue-50 px-2.5 py-0.5 border border-blue-300 rounded-full font-medium text-blue-700 text-xs'>
                                    {a.Email}
                                    {a.UserId === draft?.assignee && (
                                        <span className='bg-purple-100 ml-0.5 px-1 rounded text-[10px] text-purple-600'>AI</span>
                                    )}
                                    <button onClick={() => removeAssignee(a.UserId)} className='ml-0.5 font-bold text-blue-400 hover:text-red-500 leading-none'>×</button>
                                </span>
                            ))}
                        </div>
                        <div className='inline-block relative'>
                            <button
                                onClick={() => { setShowDropdown(v => !v); setAssigneeSearch(''); }}
                                className='flex items-center gap-1 hover:bg-blue-50 px-3 py-1.5 border border-[#4377E5] rounded-full font-semibold text-[#4377E5] text-xs transition-colors'
                            >
                                + Add
                            </button>
                            {showDropdown && (
                                <div className='z-20 absolute bg-white shadow-lg mt-1 border border-gray-200 rounded-lg w-64'>
                                    <input
                                        autoFocus
                                        type='text'
                                        value={assigneeSearch}
                                        onChange={e => setAssigneeSearch(e.target.value)}
                                        placeholder='Search member...'
                                        className='px-3 py-2 border-gray-200 border-b rounded-t-lg focus:outline-none w-full text-xs'
                                    />
                                    <ul className='max-h-36 overflow-y-auto'>
                                        {filtered.length === 0 ? (
                                            <li className='px-3 py-2 text-gray-400 text-xs'>No members found</li>
                                        ) : filtered.map((m) => (
                                            <li key={m.UserId} onClick={() => addAssignee(m)} className='hover:bg-blue-50 px-3 py-2 text-gray-700 text-xs cursor-pointer'>{m.Email}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <p className='text-sm md:text-base'>DEADLINE</p>
                        <input
                            type='date'
                            value={deadline}
                            onChange={e => setDeadline(e.target.value)}
                            className='bg-gray-100 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 w-full sm:w-56 text-sm'
                        />
                    </div>

                    <div className='flex sm:flex-row flex-col sm:justify-between gap-3 mt-5'>
                        <div className='flex gap-3'>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className='bg-[#4377E5] hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-3xl font-medium text-white text-sm transition-colors'
                            >
                                {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button
                                onClick={handleRevert}
                                className='bg-white hover:bg-[#4377E5] px-6 py-2 border border-[#4377E5] rounded-3xl font-medium text-[#4377E5] hover:text-white text-sm transition-colors duration-200'
                            >
                                Revert
                            </button>
                        </div>
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className='bg-[#4377E5] hover:bg-blue-700 disabled:opacity-50 px-6 py-2 rounded-3xl font-medium text-white text-sm transition-colors'
                        >
                            {submitting ? 'Submitting...' : 'Submit ticket'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminActivity;

