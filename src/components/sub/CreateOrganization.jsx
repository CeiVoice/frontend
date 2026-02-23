import { useState } from 'react'

function CreateOrganization({ onClose, onCreate }) {
    const [orgName, setOrgName] = useState('')
    const [error, setError] = useState('')

    const handleSubmit = () => {
        if (!orgName.trim()) {
            setError('Organization name is required')
            return
        }

        // Create new organization object
        const newOrg = {
            id: Date.now(),
            name: orgName,
            members: [
                {
                    id: 1,
                    name: 'You',
                    role: 'owner'
                }
            ]
        }

        // Call the onCreate callback
        onCreate(newOrg)
        setOrgName('')
        setError('')
        onClose()
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={onClose}
            role="presentation"
        >
            <div
                className="w-88 max-w-[90vw] rounded-2xl border border-white/10 bg-[#1b1b1d]/95 p-5 text-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-center">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-white/5">
                        <span className="text-base font-bold">+</span>
                    </div>
                </div>
                <h2 className="mt-3 text-center text-lg font-semibold">Create Organization</h2>
                <p className="mt-1 text-center text-xs text-white/60">
                    Enter your organization name
                </p>

                <label className="mt-4 block text-xs text-white/60">Organization Name</label>
                <input
                    type="text"
                    placeholder="Enter organization name"
                    value={orgName}
                    onChange={(e) => {
                        setOrgName(e.target.value)
                        setError('')
                    }}
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
                />
                {error && <p className="mt-2 text-xs text-red-400">{error}</p>}

                <div className="mt-6 flex items-center justify-between gap-3">
                    <button
                        type="button"
                        className="flex-1 rounded-lg border border-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/5"
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="flex-1 rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black hover:bg-gray-100"
                        onClick={handleSubmit}
                    >
                        Create
                    </button>
                </div>
            </div>
        </div>
    )
}

export default CreateOrganization
