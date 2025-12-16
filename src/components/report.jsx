import React from 'react'
import { RxCross1 } from "react-icons/rx";

const Report = ({ userEmail, sidebarOpen, setReportRef, onBack, isModal = false }) => {
    const containerClasses = isModal
        ? 'w-full h-auto bg-transparent'
        : `w-full h-screen bg-transparent pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'}`;

    const contentPadding = isModal ? 'p-4 sm:p-6 md:p-8' : 'p-6 md:p-8';

    return (
        <div ref={setReportRef} className={containerClasses}>
            <div className={`w-full h-full ${contentPadding} bg-transparent`}>
                <div className='flex justify-end'>
                    <RxCross1
                        size={24}
                        className='cursor-pointer'
                        onClick={() => onBack?.()}
                    />
                </div>
                <div className='mt-4 p-8 rounded-3xl bg-gray-50 shadow-none border-none'>
                    <h2 className='text-2xl font-bold mb-4 sm:mb-6 lg:mb-8'>Report</h2>
                    {userEmail && (
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-4'>
                            <p className='text-gray-700'>
                                <span className='font-semibold'>Logged in as:</span> {userEmail}
                            </p>
                        </div>
                    )}
                    <p className='text-2xl font-bold mt-4 sm:mt-6 lg:mt-8'>Request Message</p>
                    <textarea
                        name="message"
                        placeholder="Type your message here..."
                        rows={6}
                        className="w-full mt-2 p-4 rounded-lg border border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#4377E5] min-h-32 resize-y"
                    />
                    <button className='mt-5 px-6 h-10 bg-[#4377E5] text-white rounded-lg pointer-fine:hover:bg-blue-700 cursor-pointer'>Submit</button>
                </div>
            </div>
        </div>
    )
}

export default Report