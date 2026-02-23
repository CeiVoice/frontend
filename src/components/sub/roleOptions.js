export const ROLE_OPTIONS = [
    {
        id: 'owner',
        label: 'Workspace owner',
        description: 'Can change workspace settings and invite new members'
    },
    {
        id: 'member',
        label: 'Member',
        description: 'Cannot change workspace settings or invite new members'
    },
    {
        id: 'restricted',
        label: 'Restricted member',
        description: 'Can only see and edit content they created or were shared with'
    }
]
