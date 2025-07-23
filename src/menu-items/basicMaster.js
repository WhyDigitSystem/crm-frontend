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
          id: 'region',
          title: 'Region',
          type: 'item',
          url: '/basicMaster/RegionMaster',
          icon: icons.IconMap
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
          id: 'employee',
          title: 'Employee',
          type: 'item',
          url: '/basicMaster/employee',
          icon: icons.IconUser
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
          title: 'Price',
          type: 'item',
          url: '/basicMaster/PriceMaster',
          icon: icons.IconCurrencyRupee
        },
        {
          id: 'UnitMaster',
          title: 'Unit',
          type: 'item',
          url: '/basicMaster/UnitMaster',
          icon: icons.IconRulerMeasure
        },
        {
          id: 'CategoryMaster',
          title: 'Category',
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
          id: 'currency',
          title: 'Currency',
          type: 'item',
          url: '/basicMaster/currency',
          icon: icons.IconCurrencyDollar
        },
        {
          id: 'roles',
          title: 'Roles',
          type: 'item',
          url: '/basicMaster/roles',
          icon: icons.IconShieldLock
        },
      ]
    }
  ]
};

export default basicMaster;
