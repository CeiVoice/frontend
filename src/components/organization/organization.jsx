import { useEffect, useState } from 'react'
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { IoSettingsOutline } from "react-icons/io5";
import { TiUserAddOutline } from "react-icons/ti";
import { jwtDecode } from 'jwt-decode'
import InviteOrg from './invite_org'
import CreateOrganization from './CreateOrganization'
import { ORGANIZATIONS } from '../constants/organizationMembers'

export default function Dropbar({ className = '' }) {
  const [showInvite, setShowInvite] = useState(false)
  const [showCreateOrg, setShowCreateOrg] = useState(false)
  const [organizations, setOrganizations] = useState(ORGANIZATIONS)
  const [selectedOrg, setSelectedOrg] = useState(null)

  const fetchUserOrganizations = async () => {
    const token = localStorage.getItem('authToken')
    if (!token) {
      console.log('No auth token found')
      return
    }

    try {
      const decoded = jwtDecode(token)
      console.log('Decoded token:', decoded)

      // Fetch user's memberships
      const url = `http://localhost/api/organizations/member/user/${decoded.id}`
      console.log('Fetching from:', url)

      const res = await fetch(url, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
      })

      if (res.ok) {
        const data = await res.json()
        console.log('Member data received:', data)

        const members = data.result || []
        console.log('Members:', members)

        if (!Array.isArray(members) || members.length === 0) {
          console.log('No memberships found')
          setOrganizations([])
          return
        }

        const orgsWithMembers = await Promise.all(
          members.map(async (member) => {
            // Fetch member count for each organization
            let memberCount = 0
            try {
              const memberRes = await fetch(`http://localhost/api/organizations/member/org/${member.OrganizationId}`, {
                method: "GET",
                headers: {
                  "Content-Type": "application/json",
                  "Authorization": `Bearer ${token}`
                },
              })
              if (memberRes.ok) {
                const memberData = await memberRes.json()
                memberCount = memberData.result?.length || 0
              }
            } catch (err) {
              console.error('Error fetching member count:', err)
            }

            return {
              id: member.OrganizationId,
              name: member.OrgName,
              memberCount: memberCount,
              isAdmin: member.isAdmin,
            }
          })
        )

        console.log('Final organizations:', orgsWithMembers)
        setOrganizations(orgsWithMembers)
        localStorage.setItem('organizations', JSON.stringify(orgsWithMembers))
      } else {
        const errorData = await res.json()
        console.error('Failed to fetch organizations:', res.status, errorData)
      }
    } catch (err) {
      console.error('Error fetching organizations:', err);
    }
  }

  const handleCreateOrganization = () => {
    // Just refetch the organizations list
    fetchUserOrganizations()
  }

  const handleSelectOrganization = (org) => {
    setSelectedOrg(org)
    localStorage.setItem('selectedOrganization', JSON.stringify(org))
    console.log('Organization selected:', org)
  }

  const handleDeleteOrganization = (orgId) => {
    const updatedOrgs = organizations.filter(org => org.id !== orgId)
    setOrganizations(updatedOrgs)
    localStorage.setItem('organizations', JSON.stringify(updatedOrgs))

    // Clear selection if deleted org was selected
    if (selectedOrg?.id === orgId) {
      setSelectedOrg(null)
      localStorage.removeItem('selectedOrganization')
    }
    console.log('Organization deleted:', orgId)
  }

  const handleOrganize_change = async (e) => {
    const url = `http://localhost/organization/${e}`
    try {
      const res = await fetch(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      })

      const data = await res.json()
      const message = data?.error || 'Invalid Organization.'
      alert(message)
    } catch (err) {
      console.log(err);
      alert('Something went wrong. Please try again.');
    }
  }
  useEffect(() => {
    // Load organizations and selected org from localStorage on mount
    const savedOrgs = localStorage.getItem('organizations')
    if (savedOrgs) {
      setOrganizations(JSON.parse(savedOrgs))
    }

    const savedSelectedOrg = localStorage.getItem('selectedOrganization')
    if (savedSelectedOrg) {
      setSelectedOrg(JSON.parse(savedSelectedOrg))
    }
  }, [])

  useEffect(() => {
    fetchUserOrganizations()
  }, [])

  return (
    <>
      {showInvite && <InviteOrg onClose={() => setShowInvite(false)} onInviteSuccess={fetchUserOrganizations} />}
      {showCreateOrg && <CreateOrganization onClose={() => setShowCreateOrg(false)} onCreate={handleCreateOrganization} />}
      <Menu as="div" className={`relative inline-block ${className}`}>
        <MenuButton className="inline-flex justify-center gap-x-1.5 bg-white px-3 py-2 rounded-md w-full font-semibold text-gray-900 text-sm select-none">
          {selectedOrg ? selectedOrg.name : 'No organization'}
        </MenuButton>

        <MenuItems
          transition
          className="right-0 z-10 absolute bg-white data-closed:opacity-0 shadow-lg mt-2 rounded-md outline-1 outline-black/5 w-80 data-closed:scale-95 origin-top-right transition data-enter:duration-100 data-leave:duration-75 data-leave:ease-in data-enter:ease-out data-closed:transform"
        >
          <div className="mr-5 py-1">
            <div className='space-y-3 mt-5 mb-5 ml-5'>
              <div className='font-semibold text-gray-800'>Organizations ({organizations.length})</div>
              <div className='space-y-2 max-h-64 overflow-y-auto'>
                {organizations.length === 0 ? (
                  <p className='text-gray-500 text-xs'>No organizations yet</p>
                ) : (
                  organizations.map((org) => (
                    <div
                      key={org.id}
                      className='flex flex-row items-center gap-2 hover:bg-gray-50 p-2 border rounded-lg'
                    >
                      <div
                        className='flex-1 cursor-pointer'
                        onClick={() => handleSelectOrganization(org)}
                      >
                        <p className='font-semibold text-gray-800 text-sm'>{org.name}</p>
                        <div className='flex justify-between text-gray-500 text-xs'>
                          <p>Members: {org.memberCount || 0}</p>
                          <p>{org.isAdmin ? 'Admin' : 'Member'}</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className='text-gray-400 hover:text-red-600 transition-colors shrink-0'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteOrganization(org.id)
                        }}
                        title="Delete organization"
                      >
                        <span className='font-bold text-xl'>×</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className='pt-3 border-t'>
                <div className='flex flex-row justify-between gap-2 mr-2'>
                  <MenuItem>
                    <button
                      type="button"
                      className='flex flex-row flex-1 justify-center items-center gap-2 hover:bg-gray-100 px-2 py-1 border-2 rounded-2xl cursor-pointer select-none'
                      onClick={() => setShowInvite(true)}
                    >
                      <TiUserAddOutline size={20} />
                      <p className='text-sm'>Invite</p>
                    </button>
                  </MenuItem>
                </div>
                <button
                  type="button"
                  className='hover:bg-gray-100 mt-2 px-3 py-2 border border-gray-300 rounded-lg w-full font-semibold text-sm cursor-pointer select-none'
                  onClick={() => setShowCreateOrg(true)}
                >
                  + Create Organization
                </button>
              </div>
            </div>
          </div>
        </MenuItems>
      </Menu>
    </>
  )
}
