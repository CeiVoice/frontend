import { useState } from 'react'
import API_BASE from '../../config/api'

function CreateOrganization({ onClose, onCreate }) {
    const [orgName, setOrgName] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async () => {
        if (!orgName.trim()) {
            setError('Organization name is required')
            return
        }

        const token = localStorage.getItem('authToken')
        if (!token) {
            setError('No authentication token found')
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch(`${API_BASE}/api/organizations/organization`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    Orgname: orgName
                })
            })

            const data = await response.json()

            if (!response.ok) {
                throw new Error(data.error || 'Failed to create organization')
            }

            // Call the onCreate callback to refresh the list
            if (onCreate) {
                onCreate()
            }
            
            setOrgName('')
            onClose()
        } catch (err) {
            setError(err.message || 'Failed to create organization')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div
            className="z-50 fixed inset-0 flex justify-center items-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="bg-[#1b1b1d]/95 shadow-2xl p-5 border border-white/10 rounded-2xl w-88 max-w-[90vw] text-white"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-center items-center">
                    <div className="flex justify-center items-center bg-white/5 border border-white/15 rounded-full w-11 h-11">
                        <span className="font-bold text-base">+</span>
                    </div>
                </div>
                <h2 className="mt-3 font-semibold text-lg text-center">Create Organization</h2>
                <p className="mt-1 text-white/60 text-xs text-center">
                    Enter your organization name
                </p>

                <label className="block mt-4 text-white/60 text-xs">Organization Name</label>
                <input
                    type="text"
                    placeholder="Enter organization name"
                    value={orgName}
                    onChange={(e) => {
                        setOrgName(e.target.value)
                        setError('')
                    }}
                    className="bg-white/5 mt-2 px-3 py-2 border border-white/10 focus:border-white/30 rounded-lg outline-none w-full text-white text-sm placeholder-white/40"
                />
                {error && <p className="mt-2 text-red-400 text-xs">{error}</p>}

                <div className="flex justify-between items-center gap-3 mt-6">
                    <button
                        type="button"
                        className="flex-1 hover:bg-white/5 px-4 py-2 border border-white/20 rounded-lg font-semibold text-white text-xs"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="flex-1 bg-white hover:bg-gray-100 disabled:opacity-50 px-4 py-2 rounded-lg font-semibold text-black text-xs disabled:cursor-not-allowed"
                        onClick={handleSubmit}
                        disabled={loading}
                    >
                        {loading ? 'Creating...' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateOrganization
