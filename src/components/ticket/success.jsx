import React from 'react'
import { FaCheckCircle } from 'react-icons/fa'

const Success = ({ onClose }) => {
    return (
        <div className="flex flex-col items-center justify-center p-8 text-center">
            <FaCheckCircle className="text-green-500 mb-6" size={80} />
            <h2 className="text-3xl font-bold text-gray-800 mb-4">Success!</h2>
            <p className="text-lg text-gray-600 mb-8">
                Your report has been submitted successfully.
            </p>
            <button
                onClick={onClose}
                className="px-8 py-3 bg-[#4377E5] text-white rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
                Back to Home
            </button>
        </div>
    )
}

export default Success
