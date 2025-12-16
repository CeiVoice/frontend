import React from 'react'
import { RxCross1 } from "react-icons/rx";
const Report = ({ userEmail, sidebarOpen, setReportRef, onBack }) => {
    return (
        <div
            ref={setReportRef}
            className={`w-full h-screen bg-gray-100 pt-16 md:pt-20 transition-all duration-300 ${sidebarOpen ? 'ml-56 sm:ml-60 md:ml-64' : 'ml-0'}`}
        >
            <div className='w-full h-full p-6 md:p-8 bg-transparent'>
                <RxCross1
                    size={24}
                    className='cursor-pointer ml-1'
                    onClick={() => onBack?.()}
                />
                <div className='mt-8 p-8 rounded-3xl bg-gray-50 shadow-lg border border-gray-200'>
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
                        className="w-full mt-2 p-4 rounded-lg border  border-black bg-white focus:outline-none focus:ring-2 focus:ring-[#4377E5] min-h-32 resize-y"
                    />
                    <button className='mt-5 w-25 h-10 bg-[#4377E5] rounded-lg pointer-fine:hover:bg-blue-700 cursor-pointer'>Submit</button>
                </div>
            </div>
        </div>
    )
}

export default Report