// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Assembly = {
  id: 'assembly',
  title: 'Assembly',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'assembly',
      title: 'Assembly',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'finalFgPart',
          title: 'Final FG Part Stock Update',
          type: 'item',
          url: '/Assembly/FinalFgPart'
        },
        {
          id: 'fgIssue',
          title: 'FG Issue To Packing',
          type: 'item',
          url: '/Assembly/FgIssue'
        }
      ]
    }
  ]
};

export default Assembly;
