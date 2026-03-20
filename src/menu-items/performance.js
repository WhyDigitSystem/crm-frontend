// assets
import {
  IconTarget,        // Company Target
  IconGift,          // Reward Policy
  IconUserStar,      // Employee Reward Mapping
  IconTrophy         // Performance (folder)
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

const performanceChildren = [
  hasScreenAccess('AM') && {
    id: 'companyTarget',
    title: 'Company Target',
    type: 'item',
    url: '/basicMaster/CompanyTarget',
    icon: IconTarget
  },
  hasScreenAccess('RPS') && {
    id: 'rewardPolicySetup',
    title: 'Reward Policy Setup',
    type: 'item',
    url: '/basicMaster/RewardPolicySetup',
    icon: IconGift
  },
  hasScreenAccess('ERM') && {
    id: 'EmployeeRewardMapping',
    title: 'Employee Reward Mapping',
    type: 'item',
    url: '/basicMaster/EmployeeRewardMapping',
    icon: IconUserStar
  }
].filter(Boolean);

const performance =
  performanceChildren.length > 0
    ? {
      id: 'performance',
      type: 'group',
      children: [
        {
          id: 'performanceCollapse',
          title: 'Performance',
          type: 'collapse',
          icon: IconTrophy,
          children: performanceChildren
        }
      ]
    }
    : null;

export default performance;
