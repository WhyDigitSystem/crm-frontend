import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));
const Department = Loadable(lazy(() => import('views/Operations/opsTransaction/Department')));
const Designation = Loadable(lazy(() => import('views/Operations/opsTransaction/Designation')));
const RackMaster = Loadable(lazy(() => import('views/Operations/opsTransaction/RackMaster')));
const BillOfMaterial = Loadable(lazy(() => import('views/Operations/opsTransaction/BillOfMaterial')));
const DrawingMaster = Loadable(lazy(() => import('views/Operations/opsTransaction/DrawingMaster')));
const Gst = Loadable(lazy(() => import('views/Operations/opsTransaction/Gst')));
const ItemMaster = Loadable(lazy(() => import('views/Operations/opsTransaction/ItemMaster')));
const MachineMaster = Loadable(lazy(() => import('views/Operations/opsTransaction/MachineMaster')));
const MeasuringInstrument = Loadable(lazy(() => import('views/Operations/opsTransaction/MeasuringInstrument')));
const StockLocation = Loadable(lazy(() => import('views/Operations/opsTransaction/StockLocation')));
const Uom = Loadable(lazy(() => import('views/Operations/opsTransaction/Uom')));
const ItemWiseProcess = Loadable(lazy(() => import('views/Operations/opsTransaction/ItemWiseProcess')));
const ShiftMaster = Loadable(lazy(() => import('views/Operations/opsTransaction/ShiftMaster')));
const ProcessMaster = Loadable(lazy(() => import('views/Operations/opsTransaction/ProcessMaster')));
const MaterialType = Loadable(lazy(() => import('views/Operations/opsTransaction/MaterialType')));
const Enquiry = Loadable(lazy(() => import('views/Operations/Customer-Enquiry/Enquiry')));
const Quotation = Loadable(lazy(() => import('views/Operations/Customer-Enquiry/Quotation')));
const WorkOrder = Loadable(lazy(() => import('views/Operations/Customer-Enquiry/WorkOrder')));
const PurchaseEnquiry = Loadable(lazy(() => import('views/Operations/Purchase/PurchaseEnquiry')));
const PurChaseIndent = Loadable(lazy(() => import('views/Operations/Purchase/PurchaseIndent')));
const PurchaseQuotation = Loadable(lazy(() => import('views/Operations/Purchase/PurchaseQuotation')));
const PurchaseOrder = Loadable(lazy(() => import('views/Operations/Purchase/PurchaseOrder')));
const PurchaseInvoice = Loadable(lazy(() => import('views/Operations/Purchase/PurchaseInvoice')));
const PurchaseReturn = Loadable(lazy(() => import('views/Operations/Purchase/PurchaseReturn')));
const GateInwardEntry = Loadable(lazy(() => import('views/Operations/Inbound-Outbound/GateInwardEntry')));
const GateOutwardEntry = Loadable(lazy(() => import('views/Operations/Inbound-Outbound/GateOutwardEntry')));
const GRN = Loadable(lazy(() => import('views/Operations/Inventory/GRN')));
const PutAway = Loadable(lazy(() => import('views/Operations/Inventory/Putaway')));
const ThirdPartyReportDetails = Loadable(lazy(() => import('views/Operations/Inventory/ThirdPartyReportDetails')));
const RouteCardEntry = Loadable(lazy(() => import('views/Operations/Inventory/RouteCardEntry')));
const ItemIssueToProduction = Loadable(lazy(() => import('views/Operations/Inventory/ItemIssueToProduction')));
const PickList = Loadable(lazy(() => import('views/Operations/Inventory/PickList')));
const IdentificationTag = Loadable(lazy(() => import('views/Operations/Inventory/IdentificationTag')));
const DispatchPlan = Loadable(lazy(() => import('views/Operations/Production/DispatchPlan')));
const JobOrder = Loadable(lazy(() => import('views/Operations/Production/JobOrder')));
const ProcessDone = Loadable(lazy(() => import('views/Operations/Production/ProcessDone')));
const ProductionPlan = Loadable(lazy(() => import('views/Operations/Production/ProductionPlan')));
const DcForSubContractor = Loadable(lazy(() => import('views/Operations/SubContractor/DcForSubContractor')));
const IssueToSubContractor = Loadable(lazy(() => import('views/Operations/SubContractor/IssueToSubContractor')));
const ReceiveSubContractor = Loadable(lazy(() => import('views/Operations/SubContractor/ReceiveSubContractor')));
const SubContractorEnquiry = Loadable(lazy(() => import('views/Operations/SubContractor/SubContractorEnquiry')));
const SubContractorInvoice = Loadable(lazy(() => import('views/Operations/SubContractor/SubContractorInvoice')));
const SubContractorQuotation = Loadable(lazy(() => import('views/Operations/SubContractor/SubContractorQuotation')));
const WorkJobOutOrder = Loadable(lazy(() => import('views/Operations/SubContractor/WorkJobOutOrder')));
const DailyPatrolInspection = Loadable(lazy(() => import('views/Operations/Quality/DailyPatrolInspection')));
const FinalInspectionReport = Loadable(lazy(() => import('views/Operations/Quality/FinalInspectionReport')));
const IncomingMaterialInspection = Loadable(lazy(() => import('views/Operations/Quality/IncomingMaterialInspection')));
const InprocessInspection = Loadable(lazy(() => import('views/Operations/Quality/InprocessInspection')));
const SampleApproval = Loadable(lazy(() => import('views/Operations/Quality/SampleApproval')));
const SettingApproval = Loadable(lazy(() => import('views/Operations/Quality/SettingApproval')));
const ToolsIssue = Loadable(lazy(() => import('views/Operations/Quality/ToolsIssue')));
const ToolsReceived = Loadable(lazy(() => import('views/Operations/Quality/ToolsReceived')));
const ToolsIssueEntry = Loadable(lazy(() => import('views/Operations/Quality/ToolsIssueEntry')));
const DcForFG = Loadable(lazy(() => import('views/Operations/Sales/DcForFG')));
const DetailsToBank = Loadable(lazy(() => import('views/Operations/Sales/DetailsToBank')));
const ExportPackingList = Loadable(lazy(() => import('views/Operations/Sales/ExportPackingList')));
const SalesInvoiceExport = Loadable(lazy(() => import('views/Operations/Sales/SalesInvoiceExport')));
const SalesInvoiceLocal = Loadable(lazy(() => import('views/Operations/Sales/SalesInvoiceLocal')));
const SalesOrder = Loadable(lazy(() => import('views/Operations/Sales/SalesOrder')));
const FinalFgPart = Loadable(lazy(() => import('views/Operations/Assembly/FinalFgPart')));
const FgIssue = Loadable(lazy(() => import('views/Operations/Assembly/FgIssue')));
const LocalPackingList = Loadable(lazy(() => import('views/Operations/Packaging/LocalPackingList')));

const OpsRoute = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: '/Operations/opsTransaction/Department',
      element: <Department />
    },
    {
      path: '/Operations/opsTransaction/Designation',
      element: <Designation />
    },
    {
      path: '/Operations/opsTransaction/RackMaster',
      element: <RackMaster />
    },
    {
      path: '/Operations/opsTransaction/BillOfMaterial',
      element: <BillOfMaterial />
    },
    {
      path: '/Operations/opsTransaction/DrawingMaster',
      element: <DrawingMaster />
    },
    {
      path: '/Operations/opsTransaction/Gst',
      element: <Gst />
    },
    {
      path: '/Operations/opsTransaction/ItemMaster',
      element: <ItemMaster />
    },
    {
      path: '/Operations/opsTransaction/MachineMaster',
      element: <MachineMaster />
    },
    {
      path: '/Operations/opsTransaction/MeasuringInstrument',
      element: <MeasuringInstrument />
    },
    {
      path: '/Operations/opsTransaction/StockLocation',
      element: <StockLocation />
    },
    {
      path: '/Operations/opsTransaction/Uom',
      element: <Uom />
    },
    {
      path: '/Operations/opsTransaction/ItemWiseProcess',
      element: <ItemWiseProcess />
    },
    {
      path: '/Operations/opsTransaction/ShiftMaster',
      element: <ShiftMaster />
    },
    {
      path: '/Operations/opsTransaction/ProcessMaster',
      element: <ProcessMaster />
    },
    {
      path: '/Operations/opsTransaction/MaterialType',
      element: <MaterialType />
    },
    {
      path: '/Operations/Customer-Enquiry/Enquiry',
      element: <Enquiry />
    },
    {
      path: '/Operations/Customer-Enquiry/Quotation',
      element: <Quotation />
    },
    {
      path: '/Operations/Customer-Enquiry/WorkOrder',
      element: <WorkOrder />
    },
    {
      path: '/Operations/Purchase/PurchaseEnquiry',
      element: <PurchaseEnquiry />
    },
    {
      path: '/Operations/Purchase/PurchaseIndent',
      element: <PurChaseIndent />
    },
    {
      path: '/Operations/Purchase/PurchaseQuotation',
      element: <PurchaseQuotation />
    },
    {
      path: '/Operations/Purchase/PurchaseOrder',
      element: <PurchaseOrder />
    },
    {
      path: '/Operations/Purchase/PurchaseInvoice',
      element: <PurchaseInvoice />
    },
    {
      path: '/Operations/Purchase/PurchaseReturn',
      element: <PurchaseReturn />
    },
    {
      path: '/Inbound-Outbound/Gate-Inward-Entry',
      element: <GateInwardEntry />
    },
    {
      path: '/Inbound-Outbound/Gate-Outward-Entry',
      element: <GateOutwardEntry />
    },
    {
      path: '/Inventory/GRN',
      element: <GRN />
    },
    {
      path: '/Inventory/Putaway',
      element: <PutAway />
    },
    {
      path: '/Inventory/Third-Party-Report-Details',
      element: <ThirdPartyReportDetails />
    },
    {
      path: '/Inventory/Route-Card-Entry',
      element: <RouteCardEntry />
    },
    {
      path: '/Inventory/Item-Issue-To-Production',
      element: <ItemIssueToProduction />
    },
    {
      path: '/Inventory/Pick-List',
      element: <PickList />
    },
    {
      path: '/Inventory/Identification-Tag',
      element: <IdentificationTag />
    },
    {
      path: '/Product/DispatchPlan',
      element: <DispatchPlan />
    },
    {
      path: '/Product/JobOrder',
      element: <JobOrder />
    },
    {
      path: '/Product/ProcessDone',
      element: <ProcessDone />
    },
    {
      path: '/Product/ProductionPlan',
      element: <ProductionPlan />
    },
    {
      path: '/SubContractor/DcForSubContractor',
      element: <DcForSubContractor />
    },
    {
      path: '/SubContractor/IssueToSubContractor',
      element: <IssueToSubContractor />
    },
    {
      path: '/SubContractor/ReceiveSubContractor',
      element: <ReceiveSubContractor />
    },
    {
      path: '/SubContractor/SubContractorEnquiry',
      element: <SubContractorEnquiry />
    },
    {
      path: '/SubContractor/SubContractorInvoice',
      element: <SubContractorInvoice />
    },
    {
      path: '/SubContractor/SubContractorQuotation',
      element: <SubContractorQuotation />
    },
    {
      path: '/SubContractor/WorkJobOutOrder',
      element: <WorkJobOutOrder />
    },
    {
      path: '/Quality/DailyPatrolInspection',
      element: <DailyPatrolInspection />
    },
    {
      path: '/Quality/FinalInspectionReport',
      element: <FinalInspectionReport />
    },
    {
      path: '/Quality/IncomingMaterialInspection',
      element: <IncomingMaterialInspection />
    },
    {
      path: '/Quality/InprocessInspection',
      element: <InprocessInspection />
    },
    {
      path: '/Quality/SampleApproval',
      element: <SampleApproval />
    },
    {
      path: '/Quality/SettingApproval',
      element: <SettingApproval />
    },
    {
      path: '/Quality/ToolsIssue',
      element: <ToolsIssue />
    },
    {
      path: '/Quality/ToolsReceived',
      element: <ToolsReceived />
    },
    {
      path: '/Quality/ToolsIssueEntry',
      element: <ToolsIssueEntry />
    },
    {
      path: '/Sales/DcForFG',
      element: <DcForFG />
    },
    {
      path: '/Sales/DetailsToBank',
      element: <DetailsToBank />
    },
    {
      path: '/Sales/ExportPackingList',
      element: <ExportPackingList />
    },
    {
      path: '/Sales/SalesInvoiceExport',
      element: <SalesInvoiceExport />
    },
    {
      path: '/Sales/SalesInvoiceLocal',
      element: <SalesInvoiceLocal />
    },
    {
      path: '/Sales/SalesOrder',
      element: <SalesOrder />
    },
    {
      path: '/Assembly/FinalFgPart',
      element: <FinalFgPart />
    },
    {
      path: '/Assembly/FgIssue',
      element: <FgIssue />
    },
    {
      path: '/Packaging/LocalPackingList',
      element: <LocalPackingList />
    }
  ]
};

export default OpsRoute;
