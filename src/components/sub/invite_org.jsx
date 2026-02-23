import { useState } from 'react'
import { ROLE_OPTIONS } from './roleOptions'

function InviteOrg({ onClose }) {
    const [roleOpen, setRoleOpen] = useState(false)
    const [selectedRole, setSelectedRole] = useState(ROLE_OPTIONS[0])
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
                        <span className="text-base">+</span>
                    </div>
                </div>
                <h2 className="mt-3 text-center text-lg font-semibold">Add members</h2>
                <p className="mt-1 text-center text-xs text-white/60">
                    Type or paste emails below, separated by commas
                </p>

                <label className="mt-4 block text-xs text-white/60">Emails</label>
                <input
                    type="text"
                    placeholder="Search names or emails"
                    className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-white/30"
                />

                <div className="mt-4">
                    <p className="text-xs text-white/60">Select role</p>
                    <button
                        type="button"
                        className="mt-2 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-sm cursor-pointer"
                        onClick={() => setRoleOpen((v) => !v)}
                    >
                        <span className="font-medium">{selectedRole.label}</span>
                        <span className="mt-1 block text-xs text-white/60">
                            {selectedRole.description}
                        </span>
                    </button>
                    {roleOpen && (
                        <div className="mt-2 rounded-lg border border-white/10 bg-[#18181a]">
                            {ROLE_OPTIONS.map((role) => (
                                <button
                                    key={role.id}
                                    type="button"
                                    className="w-full px-3 py-2 text-left text-sm hover:bg-white/5"
                                    onClick={() => {
                                        setSelectedRole(role)
                                        setRoleOpen(false)
                                    }}
                                >
                                    <span className="font-medium">{role.label}</span>
                                    <span className="mt-1 block text-xs text-white/60">
                                        {role.description}
                                    </span>
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between">
                    <button
                        type="button"
                        className="rounded-lg bg-white px-4 py-2 text-xs font-semibold text-black"
                    >
                        Invite
                    </button>
                </div>
            </div>
        </div>

    )
}

export default InviteOrg
