// assets
import { IconMapSearch } from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
    const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
    const access = screenAccess?.[screenId];
    return access?.canRead || access?.canWrite || access?.canDelete;
};

// constant
const icons = {
    IconMapSearch
};

// ==============================|| Tracking MANAGEMENT MENU ITEMS ||============================== //

const TrackingChilder = [
    hasScreenAccess('LST') && {
        id: 'tracking',
        title: 'Tracking',
        type: 'item',
        url: '/Tracking/LiveStaffTracker',
        icon: icons.IconMapSearch
    }
].filter(Boolean);

const Tracking =
    TrackingChilder.length > 0
        ? {
            id: 'Tracking',
            type: 'group',
            children: [
                {
                    id: 'TrackingCollapse',
                    title: 'Live Staff Tracking',
                    type: 'collapse',
                    icon: icons.IconMapSearch,
                    children: TrackingChilder
                }
            ]
        }
        : null;

export default Tracking;
