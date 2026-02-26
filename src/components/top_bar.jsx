import { useState } from 'react';
import { PiSidebarSimpleThin } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import Dropbar from './organization/organization'

function Top({ onToggleMenu, onCreate, onHome, onSignout, userEmail }) {
    const [showSignout, setShowSignout] = useState(false);
    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white h-16 md:h-20 flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-3 md:gap-4 border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-1 sm:ml-0">
                <PiSidebarSimpleThin
                    size={28}
                    className="cursor-pointer hover:text-gray-400"
                    onClick={onToggleMenu}
                />
                <div className="flex flex-row items-center">
                    <button
                        type="button"
                        className="flex flex-row cursor-pointer"
                        onClick={() => onHome ? onHome() : window.location.assign('/')}
                    >
                        <p className="text-black text-xl sm:text-2xl font-serif select-none">CEI</p>
                        <p className="ml-1 text-[#4377E5] text-xl sm:text-2xl font-serif select-none">Voice</p>
                    </button>
                </div>
            </div>
            <div className="ml-auto flex items-center gap-1 sm:gap-5 shrink-0">
                <button
                    type="button"
                    onClick={onCreate}
                    className='flex pointer-fine:hover:bg-blue-700 sm:ml-3 sm:mr-2 items-center justify-center gap-2 border rounded-3xl px-3 sm:px-4 h-10 w-10 sm:h-10 sm:w-25  cursor-pointer bg-[#4377E5] text-white shrink-0'
                >
                    <p className="text-base select-none">+</p>
                    <p className='hidden sm:block select-none'>Create</p>
                </button>
                {userEmail && (
                    <div className="relative hidden md:block">
                        <button
                            type="button"
                            className="text-sm text-gray-700 max-w-45 truncate"
                            title={userEmail}
                            onClick={() => setShowSignout((v) => !v)}
                        >
                            {userEmail}
                        </button>
                        {showSignout && (
                            <button
                                type="button"
                                className="absolute right-0 mt-8 w-28 rounded-md border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm hover:bg-gray-100"
                                onClick={() => {
                                    setShowSignout(false);
                                    onSignout?.();
                                }}
                            >
                                Sign out
                            </button>
                        )}
                    </div>
                )}
                <Dropbar className="mr-5" />

            </div>
        </header>
    )
}
export default Top
