// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Inventory = {
  id: 'inventory',
  title: 'Inventory',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'inventory',
      title: 'Inventory',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'grn',
          title: 'Goods Received Note',
          type: 'item',
          url: '/Inventory/GRN'
        },
        {
          id: 'putaway',
          title: 'Putaway',
          type: 'item',
          url: '/Inventory/Putaway'
        },
        {
          id: 'thirdPartyReportDetails',
          title: 'Third Party Report Details',
          type: 'item',
          url: '/Inventory/Third-Party-Report-Details'
        },
        {
          id: 'routeCardEntry',
          title: 'Route Card Entry',
          type: 'item',
          url: '/Inventory/Route-Card-Entry'
        },
        {
          id: 'itemIssueToProduction',
          title: 'Item Issue To Production',
          type: 'item',
          url: '/Inventory/Item-Issue-To-Production'
        },
        {
          id: 'pickList',
          title: 'Pick List',
          type: 'item',
          url: '/Inventory/Pick-List'
        }
        // {
        //   id: 'identificationTag',
        //   title: 'Identification Tag',
        //   type: 'item',
        //   url: '/Inventory/Identification-Tag'
        // }
      ]
    }
  ]
};

export default Inventory;
