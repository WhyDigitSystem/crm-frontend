// assets
import {
  IconArrowsExchange,
  IconPhone,
  IconWorld,
  IconFileText,
  IconShoppingCart,
  IconUsers
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
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
    icon: IconPhone
  },
  hasScreenAccess('OPTY') && {
    id: 'Opportunity',
    title: 'Opportunity',
    type: 'item',
    url: '/Transaction/Opportunity',
    icon: IconWorld
  },
  hasScreenAccess('QT') && {
    id: 'Quotation',
    title: 'Quotation',
    type: 'item',
    url: '/Transaction/Quotation',
    icon: IconFileText
  },
  hasScreenAccess('SO') && {
    id: 'SaleOrder',
    title: 'Sales Order',
    type: 'item',
    url: '/Transaction/SaleOrder',
    icon: IconShoppingCart
  },
  hasScreenAccess('CD') && {
    id: 'CustomerDetails',
    title: 'Customer Details',
    type: 'item',
    url: '/Transaction/CustomerDetails',
    icon: IconUsers
  }
].filter(Boolean);

const Transaction =
  transactionChildren.length > 0
    ? {
        id: 'Transaction',
        type: 'group',
        children: [
          {
            id: 'Transaction',
            title: 'Transaction',
            type: 'collapse',
            icon: IconArrowsExchange,
            children: transactionChildren
          }
        ]
      }
    : null;

export default Transaction;
