import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { IoSettingsOutline } from "react-icons/io5";
import { TiUserAddOutline } from "react-icons/ti";

export default function Dropbar({ className = '' }) {
  return (
    <Menu as="div" className={`relative inline-block ${className}`}>
      <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 select-none">
        No organization
      </MenuButton>

      <MenuItems
        transition
        className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
      >
        <div className="py-1">
          <div className='ml-5 mt-5 mb-5 space-y-2'>
            <div>Group Name</div>
            <div className='flex flex-row justify-between mr-5 select-none'>
              <p>Role</p>
              <p>Members</p>
            </div>
            <div className='flex flex-row justify-between mr-5'>
              <button className='flex flex-row border-2 rounded-2xl px-2 py-1 gap-2 items-center cursor-pointer select-none hover:bg-gray-100'>
                <IoSettingsOutline size={20} />
                <p>Setting</p>
              </button>
              <button className='flex flex-row border-2 rounded-2xl px-2 py-1 gap-2 items-center cursor-pointer select-none hover:bg-gray-100'>
                <TiUserAddOutline size={20} />
                <p>Invite members</p>
              </button>
            </div>
          </div>
        </div>
      </MenuItems>
    </Menu>
  )
}
