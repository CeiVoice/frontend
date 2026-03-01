import React, { useState, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { EXAMPLE_TICKETS } from '../constants/ticketExamples';

const Tracking = () => {
    const { sidebarOpen } = useOutletContext() ?? {};
    const containerClasses = `w-full min-h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'
        }`;

    // Sort state: { key: 'created'|'assigned'|'solved', dir: 'asc'|'desc'|null }
    const [sort, setSort] = useState({ key: null, dir: null });

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
            <div className='p-6 md:p-8'>
                <div className='bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden'>
                    <table className='w-full'>
                        <thead>
                            <tr className='bg-[#DBEAFE]'>
                                <th className='text-left px-6 py-4 text-gray-700 font-semibold text-sm w-2/5'>
                                    Username
                                </th>
                                <th className='text-left px-6 py-4 text-gray-700 font-semibold text-sm w-1/5'>
                                    Department
                                </th>
                                <th
                                    className='px-6 py-4 text-gray-700 font-semibold text-sm text-center cursor-pointer select-none hover:bg-blue-100 transition-colors'
                                    onClick={() => handleSort('created')}
                                >
                                    Created Tickets <SortIcon colKey='created' />
                                </th>
                                <th
                                    className='px-6 py-4 text-gray-700 font-semibold text-sm text-center cursor-pointer select-none hover:bg-blue-100 transition-colors'
                                    onClick={() => handleSort('assigned')}
                                >
                                    Assigned Tickets <SortIcon colKey='assigned' />
                                </th>
                                <th
                                    className='px-6 py-4 text-gray-700 font-semibold text-sm text-center cursor-pointer select-none hover:bg-blue-100 transition-colors'
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
                                    <td className='px-6 py-4 text-gray-800 text-sm'>{user.email}</td>
                                    <td className='px-6 py-4 text-gray-600 text-sm'>{user.department}</td>
                                    <td className='px-6 py-4 text-gray-800 text-sm text-center'>{user.created}</td>
                                    <td className='px-6 py-4 text-gray-800 text-sm text-center'>{user.assigned}</td>
                                    <td className='px-6 py-4 text-gray-800 text-sm text-center'>{user.solved}</td>
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
    );
};
export default Tracking;