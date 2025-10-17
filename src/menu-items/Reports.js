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
  IconUsers
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
    icon: () => <IconUserExclamation color="#ff1744" /> // red
  },
  hasScreenAccess('LDR') && {
    id: 'LeadReport',
    title: 'Lead Report',
    type: 'item',
    url: '/Report/LeadReport',
    icon: () => <IconPhone color="#3f51b5" /> // indigo
  },
  hasScreenAccess('OPR') && {
    id: 'OpportunityReport',
    title: 'Opportunity Report',
    type: 'item',
    url: '/Report/OpportunityReport',
    icon: () => <IconWorld color="#0288d1" /> // light blue
  },
  hasScreenAccess('QR') && {
    id: 'QuotationReport',
    title: 'Quotation Report',
    type: 'item',
    url: '/Report/QuotationReport',
    icon: () => <IconFileText color="#6a1b9a" /> // purple
  },
  hasScreenAccess('SOR') && {
    id: 'SaleOrderReport',
    title: 'Sales Order Report',
    type: 'item',
    url: '/Report/SalesOrderReport',
    icon: () => <IconShoppingCart color="#43a047" /> // green
  },
  hasScreenAccess('ACR') && {
    id: 'ActiveReport',
    title: 'Active Report',
    type: 'item',
    url: '/Report/ActiveReport',
    icon: () => <IconUsers color="#00897b" /> // teal
  },
  hasScreenAccess('SDR') && {
    id: 'ScheduleReport',
    title: 'Schedule Report',
    type: 'item',
    url: '/Report/ScheduleReport',
    icon: () => <IconClipboardText color="#f57c00" /> // orange
  },
  hasScreenAccess('DLR') && {
    id: 'DealerReport',
    title: 'Dealer Report',
    type: 'item',
    url: '/Report/DealerReport',
    icon: () => <IconWorld color="#7b1fa2" /> // deep purple
  },
  hasScreenAccess('LJ') && {
    id: 'LeadJourney',
    title: 'Lead Journey',
    type: 'item',
    url: '/Report/LeadJourney',
    icon: () => <IconTimeline color="#1976d2" /> // blue
  },
  hasScreenAccess('PMR') && {
    id: 'ProductionManagementReport',
    title: 'Production Report',
    type: 'item',
    url: '/Report/ProductionManagementReport',
    icon: () => <IconBuildingFactory2 color="#ff9800" /> // amber
  },
  hasScreenAccess('IMR') && {
    id: 'InventoryManagementReport',
    title: 'Inventory Report',
    type: 'item',
    url: '/Report/InventoryManagementReport',
    icon: () => <IconPackages color="#388e3c" /> // dark green
  },
  hasScreenAccess('QTR') && {
    id: 'QualityTestReport',
    title: 'Quality Report',
    type: 'item',
    url: '/Report/QualityTestReport',
    icon: () => <IconFlask color="#8e24aa" /> // violet
  },
  hasScreenAccess('SMR') && {
    id: 'SupplierManagementReport',
    title: 'Supplier Report',
    type: 'item',
    url: '/Report/SupplierManagementReport',
    icon: () => <IconTruckDelivery color="#d32f2f" /> // red
  },
  hasScreenAccess('SR') && {
    id: 'StaticReport',
    title: 'Static Report',
    type: 'item',
    url: '/Report/StaticReport',
    icon: () => <IconTimeline color="#607d8b" /> // grey-blue
  },
  hasScreenAccess('SRT') && {
    id: 'StaticReportT',
    title: 'Static Report 2',
    type: 'item',
    url: '/Report/StaticReportT',
    icon: () => <IconTimeline color="#455a64" /> // darker grey
  }
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
            icon: () => <IconArrowsExchange color="#009688" />, // teal
            children: reportChildren
          }
        ]
      }
    : null;

export default Reports;
