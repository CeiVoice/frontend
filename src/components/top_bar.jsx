import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiSidebarSimpleThin } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import Dropbar from './organization/organization'

function Top({ onToggleMenu, onCreate, onSignout }) {
    const [showSignout, setShowSignout] = useState(false);
    const [userEmail, setUserEmail] = useState('');

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) return;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setUserEmail(payload.email || '');
        } catch {
            setUserEmail('');
        }
    }, []);
    const navigate = useNavigate();
    return (
        <header className="top-0 right-0 left-0 z-50 fixed flex items-center gap-2 sm:gap-3 md:gap-4 bg-white px-3 sm:px-4 md:px-6 border border-gray-200 w-full h-16 md:h-20">
            <div className="flex items-center gap-2 sm:gap-3 ml-1 sm:ml-0 shrink-0">
                <PiSidebarSimpleThin
                    size={28}
                    className="hover:text-gray-400 cursor-pointer"
                    onClick={onToggleMenu}
                />
                <div className="flex flex-row items-center">
                    <button
                        type="button"
                        className="flex flex-row cursor-pointer"
                        onClick={() => navigate('/home')}
                    >
                        <p className="font-serif text-black text-xl sm:text-2xl select-none">CEI</p>
                        <p className="ml-1 font-serif text-[#4377E5] text-xl sm:text-2xl select-none">Voice</p>
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-5 ml-auto shrink-0">
                <button
                    type="button"
                    onClick={onCreate}
                    className='flex justify-center items-center gap-2 bg-[#4377E5] pointer-fine:hover:bg-blue-700 sm:mr-2 sm:ml-3 px-3 sm:px-4 border rounded-3xl w-10 sm:w-25 h-10 sm:h-10 text-white cursor-pointer shrink-0'
                >
                    <p className="text-base select-none">+</p>
                    <p className='hidden sm:block select-none'>Create</p>
                </button>
                {userEmail && (
                    <div className="hidden md:block relative">
                        <button
                            type="button"
                            className="max-w-45 text-gray-700 text-sm truncate"
                            title={userEmail}
                            onClick={() => setShowSignout((v) => !v)}
                        >
                            {userEmail}
                        </button>
                        {showSignout && (
                            <button
                                type="button"
                                className="right-0 absolute bg-white hover:bg-gray-100 shadow-sm mt-8 px-3 py-2 border border-gray-200 rounded-md w-28 text-gray-700 text-sm"
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
