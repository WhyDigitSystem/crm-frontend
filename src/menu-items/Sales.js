// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Sales = {
  id: 'sales',
  title: 'Sales',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'sales',
      title: 'Sales',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'dcForFG',
          title: 'Delivery Challan For FG',
          type: 'item',
          url: '/Sales/DcForFG'
        },
        {
          id: 'salesOrder',
          title: 'Sales Order',
          type: 'item',
          url: '/Sales/SalesOrder'
        },
        {
          id: 'detailsToBank',
          title: 'Details Submissions To Bank',
          type: 'item',
          url: '/Sales/DetailsToBank'
        },
        {
          id: 'exportPackingList',
          title: 'Export Packing List',
          type: 'item',
          url: '/Sales/ExportPackingList'
        },
        {
          id: 'salesInvoiceLocal',
          title: 'Sales Invoice Local',
          type: 'item',
          url: '/Sales/SalesInvoiceLocal'
        },
        {
          id: 'salesInvoiceExport',
          title: 'Sales Invoice Exports',
          type: 'item',
          url: '/Sales/SalesInvoiceExport'
        }
      ]
    }
  ]
};

export default Sales;
