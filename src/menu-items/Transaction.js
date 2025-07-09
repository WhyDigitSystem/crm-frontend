// assets
import {
    IconKey,
    IconPhone,
    IconWorld,
    IconMap,
    IconFileText,
    IconShoppingCart,
    IconUsers
} from '@tabler/icons-react';

// constant
const icons = {
    IconKey,
    IconPhone,
    IconWorld,
    IconMap,
    IconFileText,
    IconShoppingCart,
    IconUsers
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Transaction = {
    id: 'Transaction',
    type: 'group',
    children: [
        {
            id: 'Transaction',
            title: 'Transaction',
            type: 'collapse',
            icon: icons.IconKey,
            children: [
                {
                    id: 'Lead',
                    title: 'Lead',
                    type: 'item',
                    url: '/Transaction/Lead',
                    icon: icons.IconPhone
                },
                {
                    id: 'Opportunity',
                    title: 'Opportunity',
                    type: 'item',
                    url: '/Transaction/Opportunity',
                    icon: icons.IconWorld
                },
                {
                    id: 'Quotation',
                    title: 'Quotation',
                    type: 'item',
                    url: '/Transaction/Quotation',
                    icon: icons.IconFileText
                },
                {
                    id: 'SaleOrder',
                    title: 'Sale Order',
                    type: 'item',
                    url: '/Transaction/SaleOrder',
                    icon: icons.IconShoppingCart
                },
                {
                    id: 'CustomerDetails',
                    title: 'Customer Details',
                    type: 'item',
                    url: '/Transaction/CustomerDetails',
                    icon: icons.IconUsers
                }
            ]
        }
    ]
};

export default Transaction;
