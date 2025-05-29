// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const basicMaster = {
  id: 'basicMaster',
  title: 'Setup',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'ar',
      title: 'Basic Master',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        // {
        //   id: 'branch',
        //   title: 'Branch',
        //   type: 'item',
        //   url: '/company/branch'
        // },
        {
          id: 'employee',
          title: 'Employee',
          type: 'item',
          url: '/basicMaster/employee'
        },
        {
          id: 'country',
          title: 'Country',
          type: 'item',
          url: '/basicMaster/country'
        },
        {
          id: 'state',
          title: 'State',
          type: 'item',
          url: '/basicMaster/state'
        },
        {
          id: 'city',
          title: 'City',
          type: 'item',
          url: '/basicMaster/city'
        },
        {
          id: 'currency',
          title: 'Currency',
          type: 'item',
          url: '/basicMaster/currency'
        },
        {
          id: 'region',
          title: 'Region',
          type: 'item',
          url: '/basicMaster/RegionMaster'
        }
        // {
        //   id: 'finYear',
        //   title: 'FinYear',
        //   type: 'item',
        //   url: '/basicMaster/finYear'
        // },
        // {
        //   id: 'roles',
        //   title: 'Roles',
        //   type: 'item',
        //   url: '/basicMaster/roles'
        // }
      ]
    }
  ]
};

export default basicMaster;
