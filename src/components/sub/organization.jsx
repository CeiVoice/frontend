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

  const handleCreateOrganization = (newOrg) => {
    const updatedOrgs = [...organizations, newOrg]
    setOrganizations(updatedOrgs)
    // Save to localStorage for persistence
    localStorage.setItem('organizations', JSON.stringify(updatedOrgs))
    console.log('Organization created:', newOrg)
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
        const url = `http://localhost/api/organizations/member/user/${decoded.userId}`
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

          // Extract members array from response
          const members = data.result || []
          console.log('Members:', members)

          if (!Array.isArray(members) || members.length === 0) {
            console.log('No memberships found')
            setOrganizations([])
            return
          }

          // Fetch organization details for each membership
          const orgPromises = members.map(member =>
            fetch(`http://localhost/api/organizations/organization/${member.OrganizationId}`, {
              headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
              }
            }).then(r => r.json())
          )

          const orgResults = await Promise.all(orgPromises)
          console.log('Organization results:', orgResults)

          // Combine organization data with member data
          const orgsWithMembers = orgResults.map((orgData, index) => ({
            id: orgData.id,
            name: orgData.Orgname,
            members: [], // You can fetch members per org if needed
            isAdmin: members[index].isAdmin,
            createdAt: orgData.CreateAt
          }))

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

    fetchUserOrganizations()
  }, [])

  return (
    <>
      {showInvite && <InviteOrg onClose={() => setShowInvite(false)} />}
      {showCreateOrg && <CreateOrganization onClose={() => setShowCreateOrg(false)} onCreate={handleCreateOrganization} />}
      <Menu as="div" className={`relative inline-block ${className}`}>
        <MenuButton className="inline-flex w-full justify-center gap-x-1.5 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 select-none">
          {selectedOrg ? selectedOrg.name : 'No organization'}
        </MenuButton>

        <MenuItems
          transition
          className="absolute right-0 z-10 mt-2 w-80 origin-top-right rounded-md bg-white shadow-lg outline-1 outline-black/5 transition data-closed:scale-95 data-closed:transform data-closed:opacity-0 data-enter:duration-100 data-enter:ease-out data-leave:duration-75 data-leave:ease-in"
        >
          <div className="py-1 mr-5">
            <div className='ml-5 mt-5 mb-5 space-y-3'>
              <div className='font-semibold text-gray-800'>Organizations ({organizations.length})</div>
              <div className='max-h-64 overflow-y-auto space-y-2'>
                {organizations.length === 0 ? (
                  <p className='text-xs text-gray-500'>No organizations yet</p>
                ) : (
                  organizations.map((org) => (
                    <div
                      key={org.id}
                      className='flex flex-row items-center gap-2 border rounded-lg p-2 hover:bg-gray-50'
                    >
                      <div
                        className='flex-1 cursor-pointer'
                        onClick={() => handleSelectOrganization(org)}
                      >
                        <p className='font-semibold text-sm text-gray-800'>{org.name}</p>
                        <div className='flex justify-between text-xs text-gray-500'>
                          <p>Members: {org.members.length}</p>
                          <p>Owner</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        className='shrink-0 text-gray-400 hover:text-red-600 transition-colors'
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteOrganization(org.id)
                        }}
                        title="Delete organization"
                      >
                        <span className='text-xl font-bold'>×</span>
                      </button>
                    </div>
                  ))
                )}
              </div>

              <div className='border-t pt-3'>
                <div className='flex flex-row justify-between mr-2 gap-2'>
                  <button className='flex-1 flex flex-row border-2 rounded-2xl px-2 py-1 gap-2 items-center cursor-pointer select-none hover:bg-gray-100 justify-center'>
                    <IoSettingsOutline size={20} />
                    <p className='text-sm'>Setting</p>
                  </button>
                  <MenuItem>
                    <button
                      type="button"
                      className='flex-1 flex flex-row border-2 rounded-2xl px-2 py-1 gap-2 items-center cursor-pointer select-none hover:bg-gray-100 justify-center'
                      onClick={() => setShowInvite(true)}
                    >
                      <TiUserAddOutline size={20} />
                      <p className='text-sm'>Invite</p>
                    </button>
                  </MenuItem>
                </div>
                <button
                  type="button"
                  className='w-full mt-2 px-3 py-2 rounded-lg border border-gray-300 text-sm font-semibold hover:bg-gray-100 cursor-pointer select-none'
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
