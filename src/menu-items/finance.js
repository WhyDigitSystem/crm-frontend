// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const finance = {
  id: 'finance',
  // title: 'Finance Master',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'finance',
      title: 'Finance Master',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'finYear',
          title: 'FinYear',
          type: 'item',
          url: '/basicMaster/finYear'
        },
      ]
    }
  ]
};

export default finance;
