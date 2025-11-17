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
import Inventory2Icon from '@mui/icons-material/Inventory2';

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
  hasScreenAccess('FY') && {
    id: 'finYear',
    title: 'FinYear',
    type: 'item',
    url: '/basicMaster/FinYear',
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
  },
  hasScreenAccess('PT') && {
    id: 'port',
    title: 'Port',
    type: 'item',
    url: '/basicMaster/port',
    icon: IconShieldLock
  },
  hasScreenAccess('LOV') && {
    id: 'listOfValues',
    title: 'List Of Values',
    type: 'item',
    url: '/basicMaster/listOfValues',
    icon: IconShieldLock
  },
  hasScreenAccess('WH') && {
    id: 'warehouse',
    title: 'Warehouse',
    type: 'item',
    url: '/basicMaster/warehouse',
    icon: Inventory2Icon
  },
  hasScreenAccess('RN') && {
    id: 'roleName',
    title: 'RoleName',
    type: 'item',
    url: '/basicMaster/roleName',
    icon: IconShieldLock
  },
  hasScreenAccess('RPS') && {
    id: 'rewardPolicySetup',
    title: 'Reward Policy Setup',
    type: 'item',
    url: '/basicMaster/RewardPolicySetup',
    icon: IconShieldLock
  },
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
