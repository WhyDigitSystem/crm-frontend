// assets
import {
    IconKey,
    IconPhone,
    IconWorld,
    IconMap
} from '@tabler/icons-react';

// constant
const icons = {
    IconKey,
    IconPhone,
    IconWorld,
    IconMap
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Activities = {
    id: 'Activities',
    type: 'group',
    children: [
        {
            id: 'Activities',
            title: 'Activities',
            type: 'collapse',
            icon: icons.IconKey,
            children: [
                {
                    id: 'Calls',
                    title: 'Calls',
                    type: 'item',
                    url: '/Activities/Calls',
                    icon: icons.IconPhone
                },
                {
                    id: 'Meeting',
                    title: 'Meeting',
                    type: 'item',
                    url: '/Activities/Meeting',
                    icon: icons.IconWorld
                },
                {
                    id: 'Task',
                    title: 'Task',
                    type: 'item',
                    url: '/Activities/Task',
                    icon: icons.IconMap
                }
            ]
        }
    ]
};

export default Activities;
