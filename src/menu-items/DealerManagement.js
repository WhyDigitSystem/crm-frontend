// assets
import { IconUserCog } from '@tabler/icons-react';

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

// constant
const icons = {
    IconUserCog
};

// ==============================|| DEALER MANAGEMENT MENU ITEMS ||============================== //

const DealerChilder = [
    hasScreenAccess('DL') && {
        id: 'dealer',
        title: 'Dealer',
        type: 'item',
        url: '/Dealers/Dealer',
        icon: icons.IconUserCog
    }
].filter(Boolean);

const DealerManagement =
    DealerChilder.length > 0
        ? {
            id: 'dealer',
            type: 'group',
            children: [
                {
                    id: 'dealerCollapse',
                    title: 'Dealers',
                    type: 'collapse',
                    icon: icons.IconUserCog, // <-- Added icon here
                    children: DealerChilder
                }
            ]
        }
        : null;

export default DealerManagement;
