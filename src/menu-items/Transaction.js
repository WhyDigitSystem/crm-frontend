import {
    IconArrowsExchange,
    IconPhone,
    IconWorld,
    IconFileText,
    IconShoppingCart,
    IconUsers
} from '@tabler/icons-react';

const icons = {
    IconArrowsExchange,
    IconPhone,
    IconWorld,
    IconFileText,
    IconShoppingCart,
    IconUsers
};

const Transaction = {
    id: 'Transaction',
    type: 'group',
    children: [
        {
            id: 'Transaction',
            title: 'Transaction',
            type: 'collapse',
            icon: icons.IconArrowsExchange, // Transaction icon added
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
                    title: 'Sales Order',
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
