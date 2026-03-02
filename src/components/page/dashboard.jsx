import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EXAMPLE_TICKETS } from '../constants/ticketExamples';
import { ROLE_OPTIONS } from '../organization/roleOptions';

const Tracking = () => {
    const { sidebarOpen } = useOutletContext() ?? {};
    const containerClasses = `w-full min-h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'sm:ml-60 md:ml-64' : 'ml-0'
        }`;

    // Sort state: { key: 'created'|'assigned'|'solved', dir: 'asc'|'desc'|null }
    const [sort, setSort] = useState({ key: null, dir: null });

    // Role state: { [email]: 'admin'|'user' }
    const [roles, setRoles] = useState({});

    const getRoleForUser = (email) => roles[email] ?? 'user';
    const handleRoleChange = (email, newRole) => {
        setRoles(prev => ({ ...prev, [email]: newRole }));
    };

    // Aggregate ticket data per user
    const userData = useMemo(() => {
        const map = {};

        EXAMPLE_TICKETS.forEach(ticket => {
            // Count created tickets
            if (ticket.createdBy?.email) {
                const { email, department } = ticket.createdBy;
                if (!map[email]) {
                    map[email] = { email, department, created: 0, assigned: 0, solved: 0 };
                }
                map[email].created += 1;
            }

            // Count assigned & solved tickets
            if (ticket.assignedTo) {
                const email = ticket.assignedTo;
                if (!map[email]) {
                    // Find department from createdBy if same user, else leave blank
                    const dept = EXAMPLE_TICKETS.find(t => t.createdBy?.email === email)?.createdBy?.department || '';
                    map[email] = { email, department: dept, created: 0, assigned: 0, solved: 0 };
                }
                map[email].assigned += 1;
                if (ticket.status === 'Solved') {
                    map[email].solved += 1;
                }
            }
        });

        return Object.values(map);
    }, []);

    // Apply sorting
    const sortedData = useMemo(() => {
        if (!sort.key || !sort.dir) return userData;
        return [...userData].sort((a, b) => {
            const diff = a[sort.key] - b[sort.key];
            return sort.dir === 'asc' ? diff : -diff;
        });
    }, [userData, sort]);

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
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                    <div className='overflow-x-auto'>
                        <table className='w-full min-w-[640px]'>
                            <thead>
                                <tr className='bg-[#DBEAFE]'>
                                    <th className='text-left px-4 md:px-6 py-3 md:py-4 text-gray-700 font-semibold text-xs md:text-sm'>
                                        User
                                    </th>
                                    <th className='text-left px-4 md:px-6 py-3 md:py-4 text-gray-700 font-semibold text-xs md:text-sm'>
                                        Department
                                    </th>
                                    <th
                                        className='px-4 md:px-6 py-3 md:py-4 text-gray-700 font-semibold text-xs md:text-sm text-center cursor-pointer select-none hover:bg-blue-100 transition-colors whitespace-nowrap'
                                        onClick={() => handleSort('created')}
                                    >
                                        Created Tickets <SortIcon colKey='created' />
                                    </th>
                                    <th
                                        className='px-4 md:px-6 py-3 md:py-4 text-gray-700 font-semibold text-xs md:text-sm text-center cursor-pointer select-none hover:bg-blue-100 transition-colors whitespace-nowrap'
                                        onClick={() => handleSort('assigned')}
                                    >
                                        Assigned Tickets <SortIcon colKey='assigned' />
                                    </th>
                                    <th
                                        className='px-4 md:px-6 py-3 md:py-4 text-gray-700 font-semibold text-xs md:text-sm text-center cursor-pointer select-none hover:bg-blue-100 transition-colors whitespace-nowrap'
                                        onClick={() => handleSort('solved')}
                                    >
                                        Solved Tickets <SortIcon colKey='solved' />
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {sortedData.map((user, idx) => (
                                    <tr
                                        key={user.email}
                                        className={`border-t border-gray-100 hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}`}
                                    >
                                        <td className='px-4 md:px-6 py-3 md:py-4'>
                                            <div className='flex flex-col items-start gap-1.5'>
                                                <span className='text-gray-800 text-xs md:text-sm break-all'>{user.email}</span>
                                                <select
                                                    value={getRoleForUser(user.email)}
                                                    onChange={(e) => handleRoleChange(user.email, e.target.value)}
                                                    className='border border-gray-300 rounded-md px-2 py-1 text-xs md:text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-blue-300 cursor-pointer'
                                                >
                                                    {ROLE_OPTIONS.map(role => (
                                                        <option key={role.id} value={role.id}>{role.label}</option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                        <td className='px-4 md:px-6 py-3 md:py-4 text-gray-600 text-xs md:text-sm'>{user.department}</td>
                                        <td className='px-4 md:px-6 py-3 md:py-4 text-gray-800 text-xs md:text-sm text-center'>{user.created}</td>
                                        <td className='px-4 md:px-6 py-3 md:py-4 text-gray-800 text-xs md:text-sm text-center'>{user.assigned}</td>
                                        <td className='px-4 md:px-6 py-3 md:py-4 text-gray-800 text-xs md:text-sm text-center'>{user.solved}</td>
                                    </tr>
                                ))}
                                {sortedData.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className='px-6 py-12 text-center text-gray-400 text-sm'>
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