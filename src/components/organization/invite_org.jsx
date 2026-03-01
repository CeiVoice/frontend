import { useState } from 'react'
import { ROLE_OPTIONS } from './roleOptions'
import { DEPARTMENTS } from '../constants/departments'

function InviteOrg({ onClose, onInviteSuccess }) {
    const [roleOpen, setRoleOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0])
    const [deptOpen, setDeptOpen] = useState(false)
    const [selectedDept, setSelectedDept] = useState('')
    const [deptSearch, setDeptSearch] = useState('')
    const [emails, setEmails] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')

    const handleInvite = async () => {
        setError('')
        setSuccess('')

        if (!emails.trim()) {
            setError('Please enter at least one email')
            return
        }

        const selectedOrg = JSON.parse(localStorage.getItem('selectedOrganization'))
        if (!selectedOrg) {
            setError('No organization selected')
            return
        }

        const authToken = localStorage.getItem('authToken')
        if (!authToken) {
            setError('No authentication token found')
            return
        }

        setLoading(true)
        const emailList = emails.split(',').map(e => e.trim()).filter(e => e)
        const isAdmin = selectedRole.id === 'admin'

        try {
            for (const email of emailList) {
                const response = await fetch('http://localhost/api/organizations/member', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authToken}`
                    },
                    body: JSON.stringify({
                        OrganizationId: selectedOrg.id,
                        email: email,
                        isAdmin: isAdmin,
                        department: selectedDept || null
                    })
                })

                if (!response.ok) {
                    const errorData = await response.json()
                    throw new Error(errorData.error || `Failed to invite ${email}`)
                }
            }

            setSuccess(`Successfully invited ${emailList.length} member(s)`)
            setEmails('')

            // Refresh the organizations list
            if (onInviteSuccess) {
                onInviteSuccess()
            }

            setTimeout(() => {
                onClose()
            }, 1500)
        } catch (err) {
            setError(err.message || 'Failed to invite members')
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
                        <span className="text-base">+</span>
                    </div>
                </div>
                <h2 className="mt-3 font-semibold text-lg text-center">Add members</h2>
                <p className="mt-1 text-white/60 text-xs text-center">
                    Type or paste emails below, separated by commas
                </p>

                <label className="block mt-4 text-white/60 text-xs">Emails</label>
                <input
                    type="text"
                    placeholder="Search names or emails"
                    value={emails}
                    onChange={(e) => setEmails(e.target.value)}
                    className="bg-white/5 mt-2 px-3 py-2 border border-white/10 focus:border-white/30 rounded-lg outline-none w-full text-white text-sm placeholder-white/40"
                />

                <div className="mt-4">
                    <p className="text-white/60 text-xs">Department</p>
                    <div className="relative mt-2">
                        <button
                            type="button"
                            className="bg-white/5 px-3 py-2 border border-white/10 rounded-lg w-full text-sm text-left cursor-pointer"
                            onClick={() => { setDeptOpen((v) => !v); setDeptSearch('') }}
                        >
                            <span className={selectedDept ? 'text-white' : 'text-white/40'}>
                                {selectedDept || 'Select a department'}
                            </span>
                        </button>
                        {deptOpen && (
                            <div className="z-50 absolute bg-[#18181a] mt-1 border border-white/10 rounded-lg w-full max-h-48 overflow-y-auto">
                                <div className="top-0 sticky bg-[#18181a] px-3 pt-2 pb-1">
                                    <input
                                        type="text"
                                        placeholder="Search department..."
                                        value={deptSearch}
                                        onChange={(e) => setDeptSearch(e.target.value)}
                                        className="bg-white/5 px-2 py-1 border border-white/10 rounded w-full text-white text-xs placeholder-white/40 outline-none"
                                        autoFocus
                                    />
                                </div>
                                {DEPARTMENTS
                                    .filter((d) => d.toLowerCase().includes(deptSearch.toLowerCase()))
                                    .map((dept) => (
                                        <button
                                            key={dept}
                                            type="button"
                                            className="hover:bg-white/5 px-3 py-2 w-full text-sm text-left"
                                            onClick={() => {
                                                setSelectedDept(dept)
                                                setDeptOpen(false)
                                            }}
                                        >
                                            {dept}
                                        </button>
                                    ))
                                }
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-4">
                    <p className="text-white/60 text-xs">Select role</p>
                    <button
                        type="button"
                        className="bg-white/5 mt-2 px-3 py-2 border border-white/10 rounded-lg w-full text-sm text-left cursor-pointer"
                        onClick={() => setRoleOpen((v) => !v)}
                    >
                        <span className="font-medium">{selectedRole.label}</span>
                        <span className="block mt-1 text-white/60 text-xs">
                            {selectedRole.description}
                        </span>
                    </button>
                    {roleOpen && (
                        <div className="bg-[#18181a] mt-2 border border-white/10 rounded-lg">
                            {ROLE_OPTIONS.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    className="hover:bg-white/5 px-3 py-2 w-full text-sm text-left"
                                    onClick={() => {
                                        setSelectedRole(role)
                                        setRoleOpen(false)
                                    }}
                                >
                                    <span className="font-medium">{role.label}</span>
                                    <span className="block mt-1 text-white/60 text-xs">
                                        {role.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                {error && (
                    <div className="bg-red-500/20 mt-3 p-2 border border-red-500/50 rounded-lg">
                        <p className="text-red-200 text-xs">{error}</p>
                    </div>
                )}

                {success && (
                    <div className="bg-green-500/20 mt-3 p-2 border border-green-500/50 rounded-lg">
                        <p className="text-green-200 text-xs">{success}</p>
                    </div>
                )}

                <div className="flex justify-between items-center mt-4">
                    <button
                        type="button"
                        className="bg-white disabled:opacity-50 px-4 py-2 rounded-lg font-semibold text-black text-xs disabled:cursor-not-allowed"
                        onClick={handleInvite}
                        disabled={loading}
                    >
                        {loading ? 'Inviting...' : 'Invite'}
                    </button>
                </div>
            </div>
        </div>

    )
}

export default InviteOrg
