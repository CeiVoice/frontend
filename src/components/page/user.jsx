import React, { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DEPARTMENTS } from '../constants/departments';
import API_BASE from '../../config/api';

const Tracking = () => {
    const { sidebarOpen } = useOutletContext() ?? {};
    const containerClasses = `w-full min-h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'sm:ml-60 md:ml-64' : 'ml-0'
        }`;

    const [sort, setSort] = useState({ key: null, dir: null });
    const [userData, setUserData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedOrg, setSelectedOrg] = useState(null);
    const [currentUserId, setCurrentUserId] = useState(null);

    const isAdmin = selectedOrg?.isAdmin === true;
    const [viewMode, setViewMode] = useState('user'); // 'user' | 'admin' — only admins can toggle

    // Decode current user id from token (same as tracking.jsx — used to show own row when not admin)
    useEffect(() => {
        try {
            const token = localStorage.getItem('authToken');
            if (token) {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setCurrentUserId(payload.id ?? null);
            }
        } catch { }
    }, []);

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
        if (!selectedOrg?.id) { setUserData([]); return; }
        const token = localStorage.getItem('authToken');
        if (!token) return;
        setLoading(true);
        fetch(`${API_BASE}/api/tickets/org/${selectedOrg.id}/stats/members`, {
            headers: { 'Authorization': `Bearer ${token}` }
        })
            .then(r => r.json())
            .then(data => setUserData(data.result || []))
            .catch(e => console.error(e))
            .finally(() => setLoading(false));
    }, [selectedOrg?.id]);

    // Non-admins always see only their own row.
    // Admins see their own row in 'user' mode, all members in 'admin' mode.
    const sortedData = useMemo(() => {
        const showAll = isAdmin && viewMode === 'admin';
        let data = (!showAll && currentUserId !== null)
            ? userData.filter(u => u.userId === currentUserId)
            : userData;
        if (!sort.key || !sort.dir) return data;
        return [...data].sort((a, b) => {
            const diff = (a[sort.key] || 0) - (b[sort.key] || 0);
            return sort.dir === 'asc' ? diff : -diff;
        });
    }, [userData, sort, isAdmin, viewMode, currentUserId]);

    const [toggling, setToggling] = useState(null); // memberId being toggled
    const [updatingDept, setUpdatingDept] = useState(null); // memberId being updated

    const handleChangeDept = async (user, dept) => {
        const token = localStorage.getItem('authToken');
        if (!token || !user.memberId) return;
        setUpdatingDept(user.memberId);
        try {
            const res = await fetch(`${API_BASE}/api/organizations/member/${user.memberId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ DeptName: dept })
            });
            if (res.ok) {
                setUserData(prev => prev.map(u =>
                    u.memberId === user.memberId ? { ...u, department: dept } : u
                ));
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to update department');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setUpdatingDept(null);
        }
    };

    const handleToggleAdmin = async (user) => {
        const token = localStorage.getItem('authToken');
        if (!token || !user.memberId) return;
        setToggling(user.memberId);
        try {
            const res = await fetch(`${API_BASE}/api/organizations/member/${user.memberId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ isAdmin: !user.isAdmin })
            });
            if (res.ok) {
                setUserData(prev => prev.map(u =>
                    u.memberId === user.memberId ? { ...u, isAdmin: !u.isAdmin } : u
                ));
            } else {
                const err = await res.json();
                alert(err.error || 'Failed to update admin status');
            }
        } catch (e) {
            console.error(e);
        } finally {
            setToggling(null);
        }
    };

    const handleSort = (key) => {
        setSort(prev => {
            if (prev.key !== key) return { key, dir: 'asc' };
            if (prev.dir === 'asc') return { key, dir: 'desc' };
            return { key: null, dir: null };
        });
    };

    const SortIcon = ({ colKey }) => {
        if (sort.key !== colKey) return <span className='ml-1 text-gray-400'>▼</span>;
        return <span className='ml-1 text-blue-600'>{sort.dir === 'asc' ? '▲' : '▼'}</span>;
    };

    return (
        <div className={containerClasses}>
            <div className='p-3 sm:p-6 md:p-8'>
                {/* Toggle only visible to admins */}
                {isAdmin && (
                    <div className='flex gap-2 mb-4'>
                        <button
                            onClick={() => setViewMode('user')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'user'
                                    ? 'bg-[#4377E5] text-white shadow'
                                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            User
                        </button>
                        <button
                            onClick={() => setViewMode('admin')}
                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${viewMode === 'admin'
                                    ? 'bg-[#4377E5] text-white shadow'
                                    : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
                                }`}
                        >
                            Admin
                        </button>
                    </div>
                )}
                <div className='bg-white shadow-sm border border-gray-200 rounded-2xl overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full min-w-160'>
                            <thead>
                                <tr className='bg-[#DBEAFE]'>
                                    <th className='px-4 md:px-6 py-3 md:py-4 font-semibold text-gray-700 text-xs md:text-sm text-left'>
                                        User
                                    </th>
                                    <th className='px-4 md:px-6 py-3 md:py-4 font-semibold text-gray-700 text-xs md:text-sm text-left'>Department</th>
                                    <th
                                        className='hover:bg-blue-100 px-4 md:px-6 py-3 md:py-4 font-semibold text-gray-700 text-xs md:text-sm text-center whitespace-nowrap transition-colors cursor-pointer select-none'
                                        onClick={() => handleSort('created')}
                                    >
                                        Created Tickets <SortIcon colKey='created' />
                                    </th>
                                    <th
                                        className='hover:bg-blue-100 px-4 md:px-6 py-3 md:py-4 font-semibold text-gray-700 text-xs md:text-sm text-center whitespace-nowrap transition-colors cursor-pointer select-none'
                                        onClick={() => handleSort('assigned')}
                                    >
                                        Assigned Tickets <SortIcon colKey='assigned' />
                                    </th>
                                    <th className='px-4 md:px-6 py-3 md:py-4 font-semibold text-gray-700 text-xs md:text-sm text-center whitespace-nowrap transition-colors cursor-pointer select-none'
                                        onClick={() => handleSort('solved')}
                                    >
                                        Solved Tickets <SortIcon colKey='solved' />
                                    </th>
                                    {isAdmin && viewMode === 'admin' && (
                                        <th className='px-4 md:px-6 py-3 md:py-4 font-semibold text-gray-700 text-xs md:text-sm text-center'>Role</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {!selectedOrg ? (
                                    <tr><td colSpan={5} className='px-6 py-12 text-gray-400 text-sm text-center'>Please select an organization.</td></tr>
                                ) : loading ? (
                                    <tr><td colSpan={5} className='px-6 py-12 text-gray-400 text-sm text-center'>Loading member stats...</td></tr>
                                ) : sortedData.map((user, idx) => (
                                    <tr
                                        key={user.userId}
                                        className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                    >
                                        <td className='px-4 md:px-6 py-3 md:py-4'>
                                            <div className='flex flex-col items-start gap-1.5'>
                                                <span className='text-gray-800 text-xs md:text-sm break-all'>
                                                    {user.email || `User #${user.userId}`}{user.isAdmin ? ' (Admin)' : ''}
                                                </span>
                                            </div>
                                        </td>
                                        <td className='px-4 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm'>
                                            {isAdmin && viewMode === 'admin' ? (
                                                <select
                                                    value={user.department || ''}
                                                    disabled={updatingDept === user.memberId}
                                                    onChange={e => handleChangeDept(user, e.target.value)}
                                                    className='bg-white disabled:opacity-50 px-2 py-1 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 max-w-[180px] text-xs'
                                                >
                                                    <option value=''>— Select dept —</option>
                                                    {DEPARTMENTS.map(d => (
                                                        <option key={d} value={d}>{d}</option>
                                                    ))}
                                                </select>
                                            ) : (
                                                user.department || '—'
                                            )}
                                        </td>
                                        <td className='px-4 md:px-6 py-3 md:py-4 text-gray-800 text-xs md:text-sm text-center'>{user.created}</td>
                                        <td className='px-4 md:px-6 py-3 md:py-4 text-gray-800 text-xs md:text-sm text-center'>{user.assigned}</td>
                                        <td className='px-4 md:px-6 py-3 md:py-4 text-gray-800 text-xs md:text-sm text-center'>{user.solved}</td>
                                        {isAdmin && viewMode === 'admin' && (
                                            <td className='px-4 md:px-6 py-3 md:py-4 text-center'>
                                                {user.userId === currentUserId ? (
                                                    <span className='text-gray-400 text-xs italic'>you</span>
                                                ) : (
                                                    <button
                                                        disabled={toggling === user.memberId}
                                                        onClick={() => handleToggleAdmin(user)}
                                                        className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${user.isAdmin
                                                            ? 'bg-blue-100 text-blue-700 border-blue-300 hover:bg-red-100 hover:text-red-700 hover:border-red-300'
                                                            : 'bg-gray-100 text-gray-600 border-gray-300 hover:bg-blue-100 hover:text-blue-700 hover:border-blue-300'
                                                        } disabled:opacity-50`}
                                                    >
                                                        {toggling === user.memberId ? '…' : user.isAdmin ? 'Admin' : 'User'}
                                                    </button>
                                                )}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                                {sortedData.length === 0 && selectedOrg && !loading && (
                                    <tr>
                                        <td colSpan={5} className='px-6 py-12 text-gray-400 text-sm text-center'>
                                            No user data available.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Tracking;