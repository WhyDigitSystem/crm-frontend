import { IconBell } from '@tabler/icons-react';
import { IconLayoutDashboard } from '@tabler/icons-react';
// screen access utility
const hasScreenAccess = (screenId) => {
  const userType = localStorage.getItem('userType');

  if (userType === 'ADMIN') {
    return true;
  }

  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];

  return access?.canRead || access?.canWrite || access?.canDelete;
};

const announcementChildren = [
    hasScreenAccess('ANN') &&
    {
        id: 'announcement',
        title: 'Announcements',
        type: 'item',
        url: '/dashboard/announcement',
        icon: IconBell,
        breadcrumbs: false
    }
].filter(Boolean);

const announcement =
    announcementChildren.length > 0
        ? {
            id: 'announcement',
            type: 'group',
            children: announcementChildren
        }
        : null;

export default announcement;
