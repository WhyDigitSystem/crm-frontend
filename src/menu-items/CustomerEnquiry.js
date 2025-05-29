// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const CustomerEnquiry = {
  id: 'customerEnquiry',
  title: 'Customer Enquiry',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'customerEnquiry',
      title: 'Customer Enquiry',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'enquiry',
          title: 'Enquiry',
          type: 'item',
          url: '/Operations/Customer-Enquiry/Enquiry'
        },
        {
          id: 'quotation',
          title: 'Quotation',
          type: 'item',
          url: '/Operations/Customer-Enquiry/Quotation'
        },
        {
          id: 'workOrder',
          title: 'Work Order',
          type: 'item',
          url: '/Operations/Customer-Enquiry/WorkOrder'
        }
      ]
    }
  ]
};

export default CustomerEnquiry;
