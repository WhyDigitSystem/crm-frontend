// assets
import {
  IconUsers,
  IconPhoneCall,
  IconCalendarEvent,
  IconMap
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// activity children menu
const activityChildren = [
  hasScreenAccess('CAL') && {
    id: 'Calls',
    title: 'Calls',
    type: 'item',
    url: '/Activities/Calls',
    icon: IconPhoneCall
  },
  hasScreenAccess('MET') && {
    id: 'Meeting',
    title: 'Meeting',
    type: 'item',
    url: '/Activities/Meeting',
    icon: IconCalendarEvent
  },
  hasScreenAccess('TASK') && {
    id: 'Task',
    title: 'Task',
    type: 'item',
    url: '/Activities/Task',
    icon: IconMap
  }
].filter(Boolean);

const Activities =
  activityChildren.length > 0
    ? {
        id: 'Activities',
        type: 'group',
        children: [
          {
            id: 'Activities',
            title: 'Activities',
            type: 'collapse',
            icon: IconUsers,
            children: activityChildren
          }
        ]
      }
    : null;

export default Activities;
