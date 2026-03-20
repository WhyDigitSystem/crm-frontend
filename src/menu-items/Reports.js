// assets
import {
  IconArrowsExchange,
  IconPhone,
  IconWorld,
  IconFileText,
  IconShoppingCart,
  IconClipboardText,
  IconTimeline,
  IconUserExclamation,
  IconBuildingFactory2,
  IconPackages,
  IconFlask,
  IconTruckDelivery,
  IconUsers,
  IconReportMoney,
  IconRoute,
  IconAward
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

// transaction children menu
const reportChildren = [
  hasScreenAccess('UAL') && {
    id: 'UnAssignedLeads',
    title: 'UnAssigned Leads',
    type: 'item',
    url: '/Report/UnAssignedLeads',
    icon: () => <IconUserExclamation />
  },
  hasScreenAccess('LDR') && {
    id: 'LeadReport',
    title: 'Lead',
    type: 'item',
    url: '/Report/LeadReport',
    icon: () => <IconPhone />
  },
  hasScreenAccess('OPR') && {
    id: 'OpportunityReport',
    title: 'Opportunity',
    type: 'item',
    url: '/Report/OpportunityReport',
    icon: () => <IconWorld />
  },
  hasScreenAccess('QR') && {
    id: 'QuotationReport',
    title: 'Quotation',
    type: 'item',
    url: '/Report/QuotationReport',
    icon: () => <IconFileText />
  },
  hasScreenAccess('SOR') && {
    id: 'SaleOrderReport',
    title: 'Sales Order',
    type: 'item',
    url: '/Report/SalesOrderReport',
    icon: () => <IconShoppingCart />
  },
  hasScreenAccess('ACR') && {
    id: 'ActiveReport',
    title: 'Active',
    type: 'item',
    url: '/Report/ActiveReport',
    icon: () => <IconUsers />
  },
  hasScreenAccess('SDR') && {
    id: 'ScheduleReport',
    title: 'Schedule',
    type: 'item',
    url: '/Report/ScheduleReport',
    icon: () => <IconClipboardText />
  },
  hasScreenAccess('DLR') && {
    id: 'DealerReport',
    title: 'Dealer',
    type: 'item',
    url: '/Report/DealerReport',
    icon: () => <IconWorld />
  },
  hasScreenAccess('LJ') && {
    id: 'LeadJourney',
    title: 'Lead Journey',
    type: 'item',
    url: '/Report/LeadJourney',
    icon: () => <IconTimeline />
  },
  hasScreenAccess('PMR') && {
    id: 'ProductionManagementReport',
    title: 'Production',
    type: 'item',
    url: '/Report/ProductionManagementReport',
    icon: () => <IconBuildingFactory2 />
  },
  hasScreenAccess('IMR') && {
    id: 'InventoryManagementReport',
    title: 'Inventory',
    type: 'item',
    url: '/Report/InventoryManagementReport',
    icon: () => <IconPackages />
  },
  hasScreenAccess('QTR') && {
    id: 'QualityTestReport',
    title: 'Quality',
    type: 'item',
    url: '/Report/QualityTestReport',
    icon: () => <IconFlask />
  },
  hasScreenAccess('SMR') && {
    id: 'SupplierManagementReport',
    title: 'Supplier',
    type: 'item',
    url: '/Report/SupplierManagementReport',
    icon: () => <IconTruckDelivery />
  },
  hasScreenAccess('SR') && {
    id: 'StaticReport',
    title: 'Static',
    type: 'item',
    url: '/Report/StaticReport',
    icon: () => <IconTimeline />
  },
  hasScreenAccess('SRT') && {
    id: 'StaticReportT',
    title: 'Static 2',
    type: 'item',
    url: '/Report/StaticReportT',
    icon: () => <IconTimeline />
  },
  hasScreenAccess('EXR') && {
    id: 'ExpenseReport',
    title: 'Expense',
    type: 'item',
    url: '/Report/ExpenseReport',
    icon: () => <IconReportMoney />
  },
  hasScreenAccess('KML') && {
    id: 'KmSummaryList',
    title: 'KM Summary',
    type: 'item',
    url: '/Report/KmSummaryList',
    icon: () => <IconRoute />
  },
  hasScreenAccess('RD') && {
    id: 'Rewards',
    title: 'Rewards',
    type: 'item',
    url: '/Report/Rewards',
    icon: () => <IconAward />
  },
  hasScreenAccess('AR') && {
    id: 'AdvertisingReport',
    title: 'Advertising Report',
    type: 'item',
    url: '/Report/AdvertisingReport',
    icon: () => <IconAward />
  },
  // hasScreenAccess('RR') && {
  //   id: 'RewardReport',
  //   title: 'Reward Report',
  //   type: 'item',
  //   url: '/Report/RewardReport',
  //   icon: () => <IconAward />
  // }
].filter(Boolean);

const Reports =
  reportChildren.length > 0
    ? {
      id: 'Reports',
      type: 'group',
      children: [
        {
          id: 'Reports',
          title: 'Reports',
          type: 'collapse',
          icon: () => <IconArrowsExchange />,
          children: reportChildren
        }
      ]
    }
    : null;

export default Reports;
