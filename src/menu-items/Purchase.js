// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Purchase = {
  id: 'purchase',
  title: 'Purchase',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'purchase',
      title: 'Purchase',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'purchaseIndent',
          title: 'Purchase Indent',
          type: 'item',
          url: '/Operations/Purchase/PurchaseIndent'
        },
        {
          id: 'purchaseEnquiry',
          title: 'Purchase Enquiry',
          type: 'item',
          url: '/Operations/Purchase/PurchaseEnquiry'
        },
        {
          id: 'purchaseQuotation',
          title: 'Purchase Quotation',
          type: 'item',
          url: '/Operations/Purchase/PurchaseQuotation'
        },
        {
          id: 'purchaseOrder',
          title: 'Purchase Order',
          type: 'item',
          url: '/Operations/Purchase/PurchaseOrder'
        },
        {
          id: 'purchaseInvoice',
          title: 'Purchase Invoice',
          type: 'item',
          url: '/Operations/Purchase/PurchaseInvoice'
        },
        {
          id: 'purchaseReturn',
          title: 'Purchase Return',
          type: 'item',
          url: '/Operations/Purchase/PurchaseReturn'
        },
      ]
    }
  ]
};

export default Purchase;
