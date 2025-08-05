// assets
import { IconCurrencyRupee } from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
    const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
    const access = screenAccess?.[screenId];
    return access?.canRead || access?.canWrite || access?.canDelete;
};

// constant
const icons = {
    IconCurrencyRupee
};

// ==============================|| RATE MANAGEMENT MENU ITEMS ||============================== //

const rateChildren = [
    hasScreenAccess('RA') && {
        id: 'rateManagement',
        title: 'Rate',
        type: 'item',
        url: '/RateManagement/Rate',
        icon: icons.IconCurrencyRupee
    }
].filter(Boolean);

const rate =
    rateChildren.length > 0
        ? {
            id: 'rate',
            type: 'group',
            children: [
                {
                    id: 'rateCollapse',
                    title: 'Rate Management',
                    type: 'collapse',
                    icon: icons.IconCurrencyRupee, 
                    children: rateChildren
                }
            ]
        }
        : null;

export default rate;
