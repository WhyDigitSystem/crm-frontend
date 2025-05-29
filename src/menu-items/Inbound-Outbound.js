// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const InboundOutbound = {
  id: 'inboundOutbound',
  title: 'Inbound / Outbound',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'inboundOutbound',
      title: 'Inbound/Outbound',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'gateInwardEntry',
          title: 'Gate Inward Entry',
          type: 'item',
          url: '/Inbound-Outbound/Gate-Inward-Entry'
        },
        {
          id: 'gateOutwardEntry',
          title: 'Gate Outward Entry',
          type: 'item',
          url: '/Inbound-Outbound/Gate-Outward-Entry'
        },
      ]
    }
  ]
};

export default InboundOutbound;
