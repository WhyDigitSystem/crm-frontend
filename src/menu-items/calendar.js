// assets
import { IconCalendar  } from '@tabler/icons-react';

// constant
const icons = {
  IconCalendar 
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const calendar = {
  id: 'calendar',
  // title: 'Calendar',
  type: 'group',
  children: [
        {
          id: 'calendarMaster',
          title: 'Calendar',
          type: 'item',
          url: '/calendar',
          icon: icons.IconCalendar,
        }
  ]
};

export default calendar;
