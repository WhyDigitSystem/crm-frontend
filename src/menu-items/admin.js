// assets
import {
  IconSettings,
  IconDatabase,
  IconFileDescription,
  IconUser,
  IconUsers,
  IconBuilding,
  IconWorld,
  IconMap,
  IconBuildingCommunity,
  IconHierarchy,
  IconIdBadge,
  IconIdBadge2,
  IconShieldLock,
  IconTags,
  IconTag,
  IconBox,
  IconCurrencyRupee,
  IconCurrencyDollar,
  IconCalendarStats,
  IconLayoutDashboard,
  IconRulerMeasure,
  IconFileText,
  IconFileSymlink,
  IconAnchor,
  IconListDetails,
  IconSpeakerphone,
  IconBuildingWarehouse
} from '@tabler/icons-react';

/* ---------- USER TYPE ---------- */
const userType = localStorage.getItem('userType');
const isSAdmin = userType === 'SADMIN';

/* ---------- SCREEN ACCESS ---------- */
const hasScreenAccess = (screenId) => {
  // ❌ SADMIN should not access anything except Create Company
  if (isSAdmin) return false;

  // ✅ ADMIN full access
  if (userType === 'ADMIN') return true;

  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];

  return access?.canRead || access?.canWrite || access?.canDelete;
};

/* ================= SETUP ================= */
const setupChildren = [
  // ✅ Only SADMIN sees this
  isSAdmin && {
    id: 'createCompany',
    title: 'Create Company',
    type: 'item',
    url: '/companysetup/createcompany',
    icon: IconBuilding
  },

  // ❌ Hide for SADMIN
  !isSAdmin &&
    hasScreenAccess('CS') && {
      id: 'companySetup',
      title: 'Company Setup',
      type: 'item',
      url: '/companysetup/companysetup',
      icon: IconSettings
    }
].filter(Boolean);

/* ================= BASIC MASTER ================= */
const basicMasterChildren = !isSAdmin
  ? [
      { id: 'country', title: 'Country', url: '/basicMaster/country', icon: IconWorld, screen: 'CO' },
      { id: 'state', title: 'State', url: '/basicMaster/state', icon: IconMap, screen: 'ST' },
      { id: 'city', title: 'City', url: '/basicMaster/city', icon: IconBuildingCommunity, screen: 'CY' },
      { id: 'region', title: 'Region', url: '/basicMaster/RegionMaster', icon: IconHierarchy, screen: 'RG' },
      { id: 'currency', title: 'Currency', url: '/basicMaster/currency', icon: IconCurrencyDollar, screen: 'CU' },
      { id: 'finYear', title: 'Financial Year', url: '/basicMaster/FinYear', icon: IconCalendarStats, screen: 'FY' },
      { id: 'department', title: 'Department', url: '/basicMaster/department', icon: IconHierarchy, screen: 'DP' },
      { id: 'designation', title: 'Designation', url: '/basicMaster/designation', icon: IconIdBadge, screen: 'DS' },
      { id: 'unit', title: 'Unit', url: '/basicMaster/UnitMaster', icon: IconRulerMeasure, screen: 'UN' },
      { id: 'category', title: 'Category', url: '/basicMaster/CategoryMaster', icon: IconTags, screen: 'CAT' },
      { id: 'subCategory', title: 'Sub Category', url: '/basicMaster/SubCategory', icon: IconTag, screen: 'SUB' },
      { id: 'product', title: 'Product', url: '/basicMaster/Product', icon: IconBox, screen: 'PRD' },
      { id: 'priceMaster', title: 'Price Master', url: '/basicMaster/PriceMaster', icon: IconCurrencyRupee, screen: 'PRI' },
      { id: 'roles', title: 'Roles', url: '/basicMaster/roles', icon: IconShieldLock, screen: 'RL' },
      { id: 'port', title: 'Port', url: '/basicMaster/port', icon: IconAnchor, screen: 'PT' },
      { id: 'lov', title: 'List Of Values', url: '/basicMaster/listOfValues', icon: IconListDetails, screen: 'LOV' },
      { id: 'warehouse', title: 'Warehouse', url: '/basicMaster/warehouse', icon: IconBuildingWarehouse, screen: 'WH' },
      { id: 'roleName', title: 'Role Name', url: '/basicMaster/roleName', icon: IconIdBadge2, screen: 'RN' },
      { id: 'advertisement', title: 'Advertisement', url: '/basicMaster/Advertisement', icon: IconSpeakerphone, screen: 'AM' }
    ]
      .filter(({ screen }) => hasScreenAccess(screen))
      .map(({ screen, ...rest }) => ({ ...rest, type: 'item' }))
  : [];

/* ================= DOCUMENTS ================= */
const documentChildren = !isSAdmin
  ? [
      { id: 'documentType', title: 'Document Type', url: '/Documents/documentType', icon: IconFileText, screen: 'DT' },
      { id: 'documentTypeMapping', title: 'Document Type Mapping', url: '/Documents/documentTypeMapping', icon: IconFileSymlink, screen: 'DTM' },
      { id: 'multiDocId', title: 'Multiple Document ID Generation', url: '/Documents/multipleDocumentIdGeneration', icon: IconIdBadge2, screen: 'MDIG' },
      { id: 'screenNames', title: 'Screen Names', url: '/basicMaster/ScreenNames', icon: IconLayoutDashboard, screen: 'SN' },
      { id: 'screenAccess', title: 'Screen Access', url: '/basicMaster/ScreenAccess', icon: IconShieldLock, screen: 'SA' }
    ]
      .filter(({ screen }) => hasScreenAccess(screen))
      .map(({ screen, ...rest }) => ({ ...rest, type: 'item' }))
  : [];

/* ================= USER MANAGEMENT ================= */
const userChildren = !isSAdmin
  ? [
      hasScreenAccess('UC') && {
        id: 'userCreation',
        title: 'User Creation',
        type: 'item',
        url: '/admin/user-creation/userCreation',
        icon: IconUser
      }
    ].filter(Boolean)
  : [];

/* ================= FINAL ADMIN MENU ================= */
const admin =
  setupChildren.length ||
  basicMasterChildren.length ||
  documentChildren.length ||
  userChildren.length
    ? {
        id: 'admin',
        type: 'group',
        children: [
          {
            id: 'adminCollapse',
            title: 'Admin',
            type: 'collapse',
            icon: IconUsers,
            children: [
              setupChildren.length && {
                id: 'setup',
                title: 'Setup',
                type: 'collapse',
                icon: IconSettings,
                children: setupChildren
              },

              basicMasterChildren.length && {
                id: 'basicMaster',
                title: 'Basic Master',
                type: 'collapse',
                icon: IconDatabase,
                children: basicMasterChildren
              },

              documentChildren.length && {
                id: 'documents',
                title: 'Documents',
                type: 'collapse',
                icon: IconFileDescription,
                children: documentChildren
              },

              userChildren.length && {
                id: 'users',
                title: 'User Management',
                type: 'collapse',
                icon: IconUser,
                children: userChildren
              }
            ].filter(Boolean)
          }
        ]
      }
    : null;

export default admin;