// assets
import { IconCopyright } from '@tabler/icons-react';
import { IconSquareRoundedPlus, IconSettingsPlus } from '@tabler/icons-react';

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

// constants
const icons = {
  IconCopyright,
  IconSquareRoundedPlus,
  IconSettingsPlus
};

// ==============================|| COMPANY SETUP MENU ITEMS ||============================== //

const setupChildren = [
  hasScreenAccess('CC') && {
    id: 'createCompany',
    title: 'Create Company',
    type: 'item',
    url: '/companysetup/createcompany',
    icon: icons.IconSquareRoundedPlus
  },
  hasScreenAccess('CS') && {
    id: 'company',
    title: 'Company Setup',
    type: 'item',
    url: '/companysetup/companysetup',
    icon: icons.IconSettingsPlus
  }
  // Uncomment below if needed
  // hasScreenAccess('BRANCH_SETUP') && {
  //   id: 'branch',
  //   title: 'Branch',
  //   type: 'item',
  //   url: '/companysetup/branch',
  //   icon: icons.IconSettingsPlus
  // }
].filter(Boolean);

const companySetup =
  setupChildren.length > 0
    ? {
      id: 'companySetup',
      type: 'group',
      children: [
        {
          id: 'companySetup',
          title: 'Setup',
          type: 'collapse',
          icon: icons.IconCopyright,
          children: setupChildren
        }
      ]
    }
    : null;

export default companySetup;
