import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';

const AdminActivity = () => {
    const { sidebarOpen } = useOutletContext() ?? {};
    const containerClasses = `w-full min-h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'}`;

    const [assignees, setAssignees] = useState([]);
    const [assigneeSearch, setAssigneeSearch] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Placeholder member list — replace with real org members when backend is ready
    const allMembers = ['alice@example.com', 'bob@example.com', 'carol@example.com', 'dave@example.com', 'esssve@example.com', 'bossssb@example.com', 'carosl@example.com', 'dasve@example.com', 'evssse@example.com'];
    const filtered = allMembers.filter(m => m.toLowerCase().includes(assigneeSearch.toLowerCase()) && !assignees.includes(m));

    const addAssignee = (m) => { setAssignees(prev => [...prev, m]); setAssigneeSearch(''); setShowDropdown(false); };
    const removeAssignee = (m) => setAssignees(prev => prev.filter(a => a !== m));

    return (
        <div className={containerClasses}>
            <div className='p-4 sm:p-6 md:p-8 bg-white rounded-lg shadow-md'>
                <div className='mx-2 sm:mx-8 md:mx-16 lg:mx-20'>
                    <p className='text-[#4377E5] mb-6 md:mb-10 font-bold text-xl md:text-2xl'>Original Request</p>
                    <div className='flex flex-col gap-3'>
                        <p className='font-bold text-sm md:text-base'>TITLE</p>
                        <input placeholder="" className='w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm' />
                        <p className='text-sm md:text-base'>Request Message</p>
                        <textarea rows={4} placeholder="" className='w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none' />
                    </div>
                    <hr className='my-8 md:my-10 border-dashed border-gray-500' />
                    <p className='text-[#4377E5] mb-6 md:mb-10 font-bold text-xl md:text-2xl'>EDIT DRAFT TICKET</p>
                    <div className='flex flex-col gap-3 mb-5'>
                        <p className='font-bold text-sm md:text-base'>TITLE</p>
                        <input placeholder="" className='w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm' />
                        <p className='text-sm md:text-base'>Request Message</p>
                        <input placeholder="" className='w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm' />
                        <p className='font-bold text-sm md:text-base'>SUMMARY</p>
                        <textarea rows={4} placeholder="" className='w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none' />
                        <p className='font-bold text-sm md:text-base'>RESOLUTION PATH</p>
                        <textarea rows={4} placeholder="" className='w-full px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm resize-none' />
                        <p className='text-sm md:text-base'>ASSIGNEE</p>
                        <div className='flex flex-wrap gap-2 min-h-6'>
                            {assignees.map((a, i) => (
                                <span key={i} className='flex items-center gap-1 bg-blue-50 border border-blue-300 px-2.5 py-0.5 rounded-full text-blue-700 text-xs font-medium'>
                                    {a}
                                    <button onClick={() => removeAssignee(a)} className='ml-0.5 text-blue-400 hover:text-red-500 font-bold leading-none'>×</button>
                                </span>
                            ))}
                        </div>
                        <div className='relative inline-block'>
                            <button
                                onClick={() => { setShowDropdown(v => !v); setAssigneeSearch(''); }}
                                className='flex items-center gap-1 px-3 py-1.5 border border-[#4377E5] text-[#4377E5] rounded-full text-xs font-semibold hover:bg-blue-50 transition-colors'
                            >
                                + Add
                            </button>
                            {showDropdown && (
                                <div className='absolute z-20 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg'>
                                    <input
                                        autoFocus
                                        type='text'
                                        value={assigneeSearch}
                                        onChange={e => setAssigneeSearch(e.target.value)}
                                        placeholder='Search member...'
                                        className='w-full px-3 py-2 border-b border-gray-200 rounded-t-lg text-xs focus:outline-none'
                                    />
                                    <ul className='max-h-36 overflow-y-auto'>
                                        {filtered.length === 0 ? (
                                            <li className='px-3 py-2 text-gray-400 text-xs'>No members found</li>
                                        ) : filtered.map((m, i) => (
                                            <li key={i} onClick={() => addAssignee(m)} className='px-3 py-2 text-gray-700 text-xs hover:bg-blue-50 cursor-pointer'>{m}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                        <p className='text-sm md:text-base'>DEADLINE</p>
                        <input type='date' className='w-full sm:w-56 px-3 py-2 border bg-gray-100 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 text-sm' />
                    </div>
                    <div className='flex flex-col sm:flex-row sm:justify-between gap-3 mt-5'>
                        <div className='flex flex-row gap-3'>
                            <button className='bg-[#4377E5] text-white rounded-3xl px-6 py-2 hover:bg-blue-700 transition-colors text-sm font-medium'>Save</button>
                            <button className='bg-white border border-[#4377E5] text-[#4377E5] rounded-3xl px-6 py-2 hover:bg-[#4377E5] hover:text-white transition-colors duration-200 text-sm font-medium'>Revert</button>
                        </div>
                        <button className='bg-[#4377E5] text-white rounded-3xl px-6 py-2 hover:bg-blue-700 transition-colors text-sm font-medium'>Submit ticket</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminActivity;

