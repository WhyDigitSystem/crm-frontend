// assets
import { IconCalendar } from '@tabler/icons-react';

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

// constant
const icons = {
  IconCalendar
};

// ==============================|| CALENDAR MENU ITEMS ||============================== //

const calendarChildren = [
  hasScreenAccess('CALENDAR') && {
    id: 'calendarMaster',
    title: 'Calendar',
    type: 'item',
    url: '/calendar',
    icon: icons.IconCalendar
  }
].filter(Boolean);

const calendar =
  calendarChildren.length > 0
    ? {
      id: 'calendar',
      type: 'group',
      children: calendarChildren
    }
    : null;

export default calendar;
