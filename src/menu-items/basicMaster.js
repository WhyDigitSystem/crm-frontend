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

// constant
const icons = {
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
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const basicMaster = {
  id: 'basicMasters',
  type: 'group',
  children: [
    {
      id: 'basicMasters',
      title: 'Basic Master',
      type: 'collapse',
      icon: icons.IconKey,
      children: [
        {
          id: 'employee',
          title: 'Employee',
          type: 'item',
          url: '/basicMaster/employee',
          icon: icons.IconUser
        },
        {
          id: 'country',
          title: 'Country',
          type: 'item',
          url: '/basicMaster/country',
          icon: icons.IconWorld
        },
        {
          id: 'state',
          title: 'State',
          type: 'item',
          url: '/basicMaster/state',
          icon: icons.IconMap
        },
        {
          id: 'city',
          title: 'City',
          type: 'item',
          url: '/basicMaster/city',
          icon: icons.IconHome
        },
        {
          id: 'currency',
          title: 'Currency',
          type: 'item',
          url: '/basicMaster/currency',
          icon: icons.IconCurrencyDollar
        },
        {
          id: 'region',
          title: 'Region',
          type: 'item',
          url: '/basicMaster/RegionMaster',
          icon: icons.IconMap
        },
        {
          id: 'finYear',
          title: 'FinYear',
          type: 'item',
          url: '/basicMaster/finYear',
          icon: icons.IconCalendarStats
        },
        {
          id: 'department',
          title: 'Department',
          type: 'item',
          url: '/basicMaster/department',
          icon: icons.IconHierarchy
        },
        {
          id: 'designation',
          title: 'Designation',
          type: 'item',
          url: '/basicMaster/designation',
          icon: icons.IconIdBadge
        },
        {
          id: 'roles',
          title: 'Roles',
          type: 'item',
          url: '/basicMaster/roles',
          icon: icons.IconShieldLock
        },
        {
          id: 'screenNames',
          title: 'Screen Names',
          type: 'item',
          url: '/basicMaster/ScreenNames',
          icon: icons.IconLayoutDashboard
        },
        {
          id: 'UnitMaster',
          title: 'Unit Master',
          type: 'item',
          url: '/basicMaster/UnitMaster',
          icon: icons.IconRulerMeasure
        },
        {
          id: 'CategoryMaster',
          title: 'Category Master',
          type: 'item',
          url: '/basicMaster/CategoryMaster',
          icon: icons.IconTags
        },
        {
          id: 'SubCategory',
          title: 'Sub Category',
          type: 'item',
          url: '/basicMaster/SubCategory',
          icon: icons.IconTag
        },
        {
          id: 'Product',
          title: 'Product',
          type: 'item',
          url: '/basicMaster/Product',
          icon: icons.IconBox
        },
        {
          id: 'PriceMaster',
          title: 'Price Master',
          type: 'item',
          url: '/basicMaster/PriceMaster',
          icon: icons.IconCurrencyRupee
        }
      ]
    }
  ]
};

export default basicMaster;
