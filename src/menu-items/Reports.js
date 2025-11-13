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
  IconReportMoney
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
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
    title: 'Lead Report',
    type: 'item',
    url: '/Report/LeadReport',
    icon: () => <IconPhone />
  },
  hasScreenAccess('OPR') && {
    id: 'OpportunityReport',
    title: 'Opportunity Report',
    type: 'item',
    url: '/Report/OpportunityReport',
    icon: () => <IconWorld />
  },
  hasScreenAccess('QR') && {
    id: 'QuotationReport',
    title: 'Quotation Report',
    type: 'item',
    url: '/Report/QuotationReport',
    icon: () => <IconFileText />
  },
  hasScreenAccess('SOR') && {
    id: 'SaleOrderReport',
    title: 'Sales Order Report',
    type: 'item',
    url: '/Report/SalesOrderReport',
    icon: () => <IconShoppingCart />
  },
  hasScreenAccess('ACR') && {
    id: 'ActiveReport',
    title: 'Active Report',
    type: 'item',
    url: '/Report/ActiveReport',
    icon: () => <IconUsers />
  },
  hasScreenAccess('SDR') && {
    id: 'ScheduleReport',
    title: 'Schedule Report',
    type: 'item',
    url: '/Report/ScheduleReport',
    icon: () => <IconClipboardText />
  },
  hasScreenAccess('DLR') && {
    id: 'DealerReport',
    title: 'Dealer Report',
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
    title: 'Production Report',
    type: 'item',
    url: '/Report/ProductionManagementReport',
    icon: () => <IconBuildingFactory2 />
  },
  hasScreenAccess('IMR') && {
    id: 'InventoryManagementReport',
    title: 'Inventory Report',
    type: 'item',
    url: '/Report/InventoryManagementReport',
    icon: () => <IconPackages />
  },
  hasScreenAccess('QTR') && {
    id: 'QualityTestReport',
    title: 'Quality Report',
    type: 'item',
    url: '/Report/QualityTestReport',
    icon: () => <IconFlask />
  },
  hasScreenAccess('SMR') && {
    id: 'SupplierManagementReport',
    title: 'Supplier Report',
    type: 'item',
    url: '/Report/SupplierManagementReport',
    icon: () => <IconTruckDelivery />
  },
  hasScreenAccess('SR') && {
    id: 'StaticReport',
    title: 'Static Report',
    type: 'item',
    url: '/Report/StaticReport',
    icon: () => <IconTimeline />
  },
  hasScreenAccess('SRT') && {
    id: 'StaticReportT',
    title: 'Static Report 2',
    type: 'item',
    url: '/Report/StaticReportT',
    icon: () => <IconTimeline />
  },
  hasScreenAccess('EXR') && {
    id: 'ExpenseReport',
    title: 'Expense Report',
    type: 'item',
    url: '/Report/ExpenseReport',
    icon: () => <IconReportMoney />
  },
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
