import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PiSidebarSimpleThin } from "react-icons/pi";
import Dropbar from './organization/organization'
import frameLogo from '../assets/Frame_7.png';
function Top({ onToggleMenu, onCreate }) {
    const navigate = useNavigate();
    const [selectedOrg, setSelectedOrg] = useState(null);

    useEffect(() => {
        const load = () => {
            const saved = localStorage.getItem('selectedOrganization');
            setSelectedOrg(saved ? JSON.parse(saved) : null);
        };
        load();
        const iv = setInterval(load, 500);
        return () => clearInterval(iv);
    }, []);

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
                        <img src={frameLogo} alt="Frame" className='w-auto h-auto' />
                    </button>
                </div>
            </div>
            <div className="flex items-center gap-1 sm:gap-5 ml-auto shrink-0">
                {selectedOrg && (
                <button
                    type="button"
                    onClick={onCreate}
                    className='flex justify-center items-center gap-2 bg-[#4377E5] pointer-fine:hover:bg-blue-700 sm:mr-2 sm:ml-3 px-3 sm:px-4 border rounded-3xl w-10 sm:w-25 h-10 sm:h-10 text-white cursor-pointer shrink-0'
                >
                    <p className="text-base select-none">+</p>
                    <p className='hidden sm:block select-none'>Create</p>
                </button>
                )}
                <Dropbar className="mr-5" />

            </div>
        </header>
    )
}
export default Top
