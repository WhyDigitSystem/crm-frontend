// assets
import {
  IconUsers,
  IconPhoneCall,
  IconCalendarEvent,
  IconMap
} from '@tabler/icons-react';

// centralized icon object
const icons = {
  IconUsers,
  IconPhoneCall,
  IconCalendarEvent,
  IconMap
};

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// activity children menu
const activityChildren = [
  hasScreenAccess('NA') && {
    id: 'NominationEnquiries',
    title: 'All Nomination Enquiries',
    type: 'item',
    url: '/NominationEnquiries/AllNominationEnquiries',
    icon: icons.IconPhoneCall
  }
].filter(Boolean);

const NominationEnquiries =
  activityChildren.length > 0
    ? {
        id: 'nomination-enquiries-group',
        type: 'group',
        children: [
          {
            id: 'nomination-enquiries-collapse',
            title: 'Nomination Enquiries',
            type: 'collapse',
            icon: icons.IconUsers,
            children: activityChildren
          }
        ]
      }
    : null;

export default NominationEnquiries;
