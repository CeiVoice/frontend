import { PiSidebarSimpleThin } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import { LuBell } from "react-icons/lu";
import { GoGear } from "react-icons/go";


function Top({ onToggleMenu }) {
    return (
        <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white h-16 md:h-20 flex items-center px-3 sm:px-4 md:px-6 gap-2 sm:gap-3 md:gap-4 border border-gray-200">
            <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-1 sm:ml-0">
                <PiSidebarSimpleThin
                    size={28}
                    className="cursor-pointer hover:text-gray-400"
                    onClick={onToggleMenu}
                />
                <div className="flex flex-row items-center">
                    <p className="text-black text-xl sm:text-2xl font-serif">CEI</p>
                    <p className="ml-1 text-[#4377E5] text-xl sm:text-2xl font-serif">Voice</p>
                </div>
            </div>
            <div className="flex items-center sm:flex-1 mx-2 ml-1 sm:mx-5 max-w-30 sm:max-w-[18rem] md:max-w-md relative">
                <input
                    type="search"
                    placeholder="Search..."
                    className="w-full rounded-full border border-gray-300 px-2 sm:px-4 py-2 pr-8 text-base focus:outline-none focus:ring-2 focus:ring-[#4377E5]"
                />
                <FiSearch className="absolute right-2 text-gray-500" size={18} />
            </div>

            <div className="ml-auto flex items-center gap-1 sm:gap-5 shrink-0">
                <div className='flex pointer-fine:hover:bg-blue-700 sm:ml-3 sm:mr-6 items-center justify-center gap-2 border rounded-3xl px-3 sm:px-4 h-9 sm:h-10 cursor-pointer bg-[#4377E5] text-white shrink-0'>
                    <p className="text-base">+</p>
                    <p className='hidden sm:block'>Create</p>
                </div>
                <LuBell size={24} className="text-black cursor-pointer" />
                <GoGear size={24} className="text-black cursor-pointer" />
            </div>
        </header>
    )
}
export default Top
