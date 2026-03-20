import {
    IconBuildingFactory,     // Production
    IconBuildingWarehouse,   // Inventory
    IconShieldCheck,         // Quality
    IconSettingsAutomation  // Operations (folder)
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

// operations children menu
const operationsChildren = [
    hasScreenAccess('PM') && {
        id: 'production',
        title: 'Production',
        type: 'item',
        url: '/Transaction/ProductionManagement',
        icon: IconBuildingFactory
    },
    hasScreenAccess('IM') && {
        id: 'inventory',
        title: 'Inventory',
        type: 'item',
        url: '/Transaction/InventoryManagement',
        icon: IconBuildingWarehouse
    },
    hasScreenAccess('QM') && {
        id: 'quality',
        title: 'Quality',
        type: 'item',
        url: '/Transaction/QualityManagement',
        icon: IconShieldCheck
    }
].filter(Boolean);

const Operations =
    operationsChildren.length > 0
        ? {
            id: 'operationsGroup',
            type: 'group',
            children: [
                {
                    id: 'operationsCollapse',
                    title: 'Operations',
                    type: 'collapse',
                    icon: IconSettingsAutomation,
                    children: operationsChildren
                }
            ]
        }
        : null;

export default Operations;
