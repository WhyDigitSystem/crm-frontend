// assets
import {
    IconArrowsExchange,
    IconPhone,
    IconWorld,
    IconFileText,
    IconShoppingCart,
    IconPhoneCall,
    IconMap
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
    const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
    const access = screenAccess?.[screenId];
    return access?.canRead || access?.canWrite || access?.canDelete;
};

// transaction children menu
const reportChildren = [
    hasScreenAccess('LDR') && {
        id: 'LeadReport',
        title: 'Lead Report',
        type: 'item',
        url: '/Report/LeadReport',
        icon: IconPhone
    },
    hasScreenAccess('OPR') && {
        id: 'OpportunityReport',
        title: 'Opportunity Report',
        type: 'item',
        url: '/Report/OpportunityReport',
        icon: IconWorld
    },
    hasScreenAccess('QTR') && {
        id: 'QuotationReport',
        title: 'Quotation Report',
        type: 'item',
        url: '/Report/QuotationReport',
        icon: IconFileText
    },
    hasScreenAccess('SOR') && {
        id: 'SaleOrderReport',
        title: 'Sales Order Report',
        type: 'item',
        url: '/Report/SalesOrderReport',
        icon: IconShoppingCart
    },
    hasScreenAccess('ACR') && {
        id: 'ActiveReport',
        title: 'Active Report',
        type: 'item',
        url: '/Report/ActiveReport',
        icon: IconPhoneCall
    },
    hasScreenAccess('SDR') && {
        id: 'ScheduleReport',
        title: 'Schedule Report',
        type: 'item',
        url: '/Report/ScheduleReport',
        icon: IconMap
    },
    hasScreenAccess('DLR') && {
        id: 'DealerReport',
        title: 'Dealer Report',
        type: 'item',
        url: '/Report/DealerReport',
        icon: IconMap
    },
].filter(Boolean);

const Reports =
    reportChildren.length > 0
        ? {
            id: 'Reports',
            type: 'group',
            children: [
                {
                    id: 'Reports',
                    title: 'Reports',
                    type: 'collapse',
                    icon: IconArrowsExchange,
                    children: reportChildren
                }
            ]
        }
        : null;

export default Reports;
