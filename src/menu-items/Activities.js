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
  hasScreenAccess('AC') && {
    id: 'Active',
    title: 'Activity',
    type: 'item',
    url: '/Activities/Active',
    icon: IconPhoneCall
  },
  hasScreenAccess('SD') && {
    id: 'Schedule',
    title: 'Schedule',
    type: 'item',
    url: '/Activities/Schedule',
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
