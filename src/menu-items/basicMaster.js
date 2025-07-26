// assets 
import {
  IconKey,
  IconUser,
  IconWorld,
  IconBuilding,
  IconHome,
  IconCurrencyDollar,
  IconMap,
  IconCalendarStats,
  IconHierarchy,
  IconIdBadge,
  IconShieldLock,
  IconLayoutDashboard,
  IconRulerMeasure,
  IconTags,
  IconTag,
  IconBox,
  IconCurrencyRupee
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

const basicMasterChildren = [
  hasScreenAccess('CO') && {
    id: 'country',
    title: 'Country',
    type: 'item',
    url: '/basicMaster/country',
    icon: IconWorld
  },
  hasScreenAccess('ST') && {
    id: 'state',
    title: 'State',
    type: 'item',
    url: '/basicMaster/state',
    icon: IconMap
  },
  hasScreenAccess('CY') && {
    id: 'city',
    title: 'City',
    type: 'item',
    url: '/basicMaster/city',
    icon: IconHome
  },
  hasScreenAccess('RG') && {
    id: 'region',
    title: 'Region',
    type: 'item',
    url: '/basicMaster/RegionMaster',
    icon: IconMap
  },
  hasScreenAccess('DP') && {
    id: 'department',
    title: 'Department',
    type: 'item',
    url: '/basicMaster/department',
    icon: IconHierarchy
  },
  hasScreenAccess('DS') && {
    id: 'designation',
    title: 'Designation',
    type: 'item',
    url: '/basicMaster/designation',
    icon: IconIdBadge
  },
  hasScreenAccess('EM') && {
    id: 'employee',
    title: 'Employee',
    type: 'item',
    url: '/basicMaster/employee',
    icon: IconUser
  },
  hasScreenAccess('PRD') && {
    id: 'Product',
    title: 'Product',
    type: 'item',
    url: '/basicMaster/Product',
    icon: IconBox
  },
  hasScreenAccess('PRI') && {
    id: 'PriceMaster',
    title: 'Price',
    type: 'item',
    url: '/basicMaster/PriceMaster',
    icon: IconCurrencyRupee
  },
  hasScreenAccess('UN') && {
    id: 'UnitMaster',
    title: 'Unit',
    type: 'item',
    url: '/basicMaster/UnitMaster',
    icon: IconRulerMeasure
  },
  hasScreenAccess('CAT') && {
    id: 'CategoryMaster',
    title: 'Category',
    type: 'item',
    url: '/basicMaster/CategoryMaster',
    icon: IconTags
  },
  hasScreenAccess('SUB') && {
    id: 'SubCategory',
    title: 'Sub Category',
    type: 'item',
    url: '/basicMaster/SubCategory',
    icon: IconTag
  },
  hasScreenAccess('CU') && {
    id: 'currency',
    title: 'Currency',
    type: 'item',
    url: '/basicMaster/currency',
    icon: IconCurrencyDollar
  },
  hasScreenAccess('RL') && {
    id: 'roles',
    title: 'Roles',
    type: 'item',
    url: '/basicMaster/roles',
    icon: IconShieldLock
  }
].filter(Boolean);

const basicMaster =
  basicMasterChildren.length > 0
    ? {
        id: 'basicMasters',
        type: 'group',
        children: [
          {
            id: 'basicMastersCollapse',
            title: 'Basic Master',
            type: 'collapse',
            icon: IconKey,
            children: basicMasterChildren
          }
        ]
      }
    : null;

export default basicMaster;
