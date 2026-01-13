// assets
import {
    IconKey,
    IconUser,
    IconTruckDelivery,
    IconUsers,
} from '@tabler/icons-react';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import { IconUserCog } from '@tabler/icons-react';
// screen access utility
const hasScreenAccess = (screenId) => {
    const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
    const access = screenAccess?.[screenId];
    return access?.canRead || access?.canWrite || access?.canDelete;
};

const organizationChildren = [
    hasScreenAccess('EM') && {
        id: 'employee',
        title: 'Employee',
        type: 'item',
        url: '/basicMaster/employee',
        icon: IconUser
    },
    hasScreenAccess('DL') && {
        id: 'dealer',
        title: 'Dealer',
        type: 'item',
        url: '/Dealers/Dealer',
        icon: IconUserCog
    },
    hasScreenAccess('SM') && {
        id: 'SupplierManagement',
        title: 'Supplier',
        type: 'item',
        url: '/Transaction/SupplierManagement',
        icon: IconTruckDelivery
    },
    hasScreenAccess('CD') && {
        id: 'CustomerDetails',
        title: 'Customer Details',
        type: 'item',
        url: '/Transaction/CustomerDetails',
        icon: IconUsers
    },
].filter(Boolean);

const organization =
    organizationChildren.length > 0
        ? {
            id: 'organization',
            type: 'group',
            children: [
                {
                    id: 'organizationCollapse',
                    title: 'Organization',
                    type: 'collapse',
                    icon: IconKey,
                    children: organizationChildren
                }
            ]
        }
        : null;

export default organization;
