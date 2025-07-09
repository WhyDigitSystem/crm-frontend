// assets
import {
    IconUsers,
    IconPhoneCall,
    IconCalendarEvent,
    IconMap
,
} from '@tabler/icons-react';

// constant
const icons = {
    IconUsers,
    IconPhoneCall,
    IconCalendarEvent,
    IconMap,
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
            icon: icons.IconUsers, // Group icon
            children: [
                {
                    id: 'Calls',
                    title: 'Calls',
                    type: 'item',
                    url: '/Activities/Calls',
                    icon: icons.IconPhoneCall
                },
                {
                    id: 'Meeting',
                    title: 'Meeting',
                    type: 'item',
                    url: '/Activities/Meeting',
                    icon: icons.IconCalendarEvent
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
