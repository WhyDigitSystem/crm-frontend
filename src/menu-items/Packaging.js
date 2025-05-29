// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Packaging = {
  id: 'packaging',
  title: 'Packaging',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'packaging',
      title: 'Packaging',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'localPackingList',
          title: 'Local Packing List',
          type: 'item',
          url: '/Packaging/LocalPackingList'
        }
      ]
    }
  ]
};

export default Packaging;
