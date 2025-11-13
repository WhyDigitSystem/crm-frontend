// assets
import { IconMapSearch } from '@tabler/icons-react';
import { IconMapPin } from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
    const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
    const access = screenAccess?.[screenId];
    return access?.canRead || access?.canWrite || access?.canDelete;
};

// constant
const icons = {
    IconMapSearch,
    IconMapPin
};

// ==============================|| Tracking MANAGEMENT MENU ITEMS ||============================== //

const TrackingChilder = [
    // hasScreenAccess('LST') && {
    //     id: 'tracking',
    //     title: 'Tracking',
    //     type: 'item',
    //     url: '/Tracking/LiveStaffTracker',
    //     icon: icons.IconMapSearch
    // },
    hasScreenAccess('DGV') && {
        id: 'dealerGeoView',
        title: 'Dealer GeoView',
        type: 'item',
        url: '/Tracking/DealerGeoView',
        icon: icons.IconMapPin
    },
    hasScreenAccess('RT') && {
        id: 'routeTracking',
        title: 'Route Tracking',
        type: 'item',
        url: '/Tracking/RouteTracking',
        icon: icons.IconMapPin
    },
    hasScreenAccess('FSL') && {
        id: 'fieldStaffLive',
        title: 'Field Staff Live',
        type: 'item',
        url: '/Tracking/FieldStaffLive',
        icon: icons.IconMapPin
    },
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
