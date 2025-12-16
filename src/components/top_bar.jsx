import { PiSidebarSimpleThin } from "react-icons/pi";
import { FiSearch } from "react-icons/fi";
import { LuBell } from "react-icons/lu";
import { GoGear } from "react-icons/go";
function Top() {

    return (
        <header className="w-full bg-white h-16 md:h-20 flex items-center px-4 md:px-6 gap-3 md:gap-4 shadow-sm">
            <div className="flex items-center gap-3 shrink-0">
                <PiSidebarSimpleThin size={32} className="text-black cursor-pointer" />
                <div className="flex flex-row items-center">
                    <p className="text-black text-2xl" style={{ fontFamily: '"Young Serif", serif' }}>CEI</p>
                    <p className="ml-1 text-[#4377E5] text-2xl">Voice</p>
                </div>
            </div>
            <div className="flex items-center justify-center ml-auto w-full max-w-200 min-w-1 relative">
                <input
                    type="search"
                    placeholder="Search"
                    className="w-full rounded-full border border-gray-300 px-4 py-2 pr-10 text-base focus:outline-none focus:ring-2 focus:ring-[#4377E5]"
                />
                <FiSearch className="absolute right-2 text-gray-500" size={18} />
            </div>
            <div className='pointer-fine:hover:bg-blue-700 ml-5 mr-10 flex items-center justify-center gap-2 border rounded-3xl w-25 h-10 cursor-pointer bg-[#4377E5] text-white font-sans'>
                <p>+</p>
                <p>Create</p>
            </div>
            <div className="ml-auto flex items-center gap-6">
                <LuBell size={24} className="text-black cursor-pointer" />
                <GoGear size={24} className="text-black cursor-pointer" />
            </div>
        </header>
    )
}

export default Top
