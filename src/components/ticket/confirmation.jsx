import React from 'react'
import { MdWarning } from 'react-icons/md'

const Confirmation = ({ onConfirm, onCancel }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <MdWarning className="text-yellow-500 mb-6" size={80} />
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Confirm Submission</h2>
            <p className="text-lg text-gray-600 mb-8">
                Are you sure you want to submit this report?
            </p>
            <div className="flex gap-4">
                <button
                    onClick={onCancel}
                    className="px-8 py-3 bg-gray-300 text-gray-800 rounded-lg hover:bg-gray-400 cursor-pointer transition-colors"
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    className="px-8 py-3 bg-[#4377E5] text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
                >
                    Confirm
                </button>
            </div>
        </div>
    )
}

export default Confirmation
