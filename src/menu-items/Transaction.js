// assets
import {
  IconArrowsExchange,
  IconPhoneCall,        // Lead, Activity
  IconBulb,             // Opportunity
  IconFileText,         // Quotation
  IconShoppingCart,     // Sales Order
  IconCalendarTime      // Schedule
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const userType = localStorage.getItem('userType');

  if (userType === 'ADMIN') {
    return true;
  }

  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];

  return access?.canRead || access?.canWrite || access?.canDelete;
};

// transaction children menu
const transactionChildren = [
  hasScreenAccess('LEAD') && {
    id: 'Lead',
    title: 'Lead',
    type: 'item',
    url: '/Transaction/Lead',
    icon: IconPhoneCall
  },
  hasScreenAccess('OPTY') && {
    id: 'Opportunity',
    title: 'Opportunity',
    type: 'item',
    url: '/Transaction/Opportunity',
    icon: IconBulb
  },
  hasScreenAccess('QT') && {
    id: 'Quotation',
    title: 'Quotation',
    type: 'item',
    url: '/Transaction/Quotation',
    icon: IconFileText
  },
  hasScreenAccess('SO') && {
    id: 'SalesOrder',
    title: 'Sales Order',
    type: 'item',
    url: '/Transaction/SaleOrder',
    icon: IconShoppingCart
  },
  hasScreenAccess('AC') && {
    id: 'Activity',
    title: 'Activity',
    type: 'item',
    url: '/Activities/Active',
    icon: IconPhoneCall
  },
  hasScreenAccess('SD') && {
    id: 'Schedule',
    title: 'Schedule',
    type: 'item',
    url: '/Activities/Schedule',
    icon: IconCalendarTime
  }
].filter(Boolean);

const Transaction =
  transactionChildren.length > 0
    ? {
      id: 'Transaction',
      type: 'group',
      children: [
        {
          id: 'SalesDistribution',
          title: 'Sales & Dist',
          type: 'collapse',
          icon: IconArrowsExchange,
          children: transactionChildren
        }
      ]
    }
    : null;

export default Transaction;
