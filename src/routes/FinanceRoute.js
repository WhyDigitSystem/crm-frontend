import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import PrivateRoute from '../routes/PrivateRoute';
const InventoryItemReport = Loadable(lazy(() => import('views/Reports/InventoryItemReport')));
const QualityTestReport = Loadable(lazy(() => import('views/Reports/QualityTestReport')));
const SupplierManagementReport = Loadable(lazy(() => import('views/Reports/SupplierManagementReport')));
const ProductionManagementReport = Loadable(lazy(() => import('views/Reports/ProductionManagementReport')));
const Warehouse = Loadable(lazy(() => import('views/basicMaster/Warehouse')));
const QualityManagement = Loadable(lazy(() => import('views/Transaction/QualityManagement')));
const SupplierManagement = Loadable(lazy(() => import('views/Transaction/SupplierManagement')));
const InventoryManagement = Loadable(lazy(() => import('views/Transaction/InventoryManagement')));
const ProductionManagement = Loadable(lazy(() => import('views/Transaction/ProductionManagement')));
const StaticReport = Loadable(lazy(() => import('views/Reports/StaticReport')));
const StaticReport2 = Loadable(lazy(() => import('views/Reports/StaticReport2')));
// import LiveStaffTracker from 'views/Tracking/LiveStaffTracker';
const BulkEmail = Loadable(lazy(() => import('views/BulkEmail/BulkEmail')));
// import { element } from 'prop-types';
//Report
const LeadReport = Loadable(lazy(() => import('views/Reports/LeadReport')));
const OpportunityReport = Loadable(lazy(() => import('views/Reports/OpportunityReport')));
const QuotationReport = Loadable(lazy(() => import('views/Reports/QuotationReport')));
const SalesOrderReport = Loadable(lazy(() => import('views/Reports/SalesOrderReport')));
const ActiveReport = Loadable(lazy(() => import('views/Reports/ActiveReport')));
const ScheduleReport = Loadable(lazy(() => import('views/Reports/ScheduleReport')));
const DealerReport = Loadable(lazy(() => import('views/Reports/DealerReport')));
const UnAssignedLeads = Loadable(lazy(() => import('views/Reports/UnAssignedLeads')));
const LeadJourney = Loadable(lazy(() => import('views/Reports/LeadJourney')));

const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// Calendar
const Calendar = Loadable(lazy(() => import('views/Calendar/Calendar')));

// basicmaster
const Country = Loadable(lazy(() => import('views/basicMaster/country')));
const State = Loadable(lazy(() => import('views/basicMaster/state')));
const City = Loadable(lazy(() => import('views/basicMaster/city')));
const Currency = Loadable(lazy(() => import('views/basicMaster/currency')));
const Region = Loadable(lazy(() => import('views/basicMaster/RegionMaster')));
const FinYear = Loadable(lazy(() => import('views/basicMaster/finYear')));
// const Branch = Loadable(lazy(() => import('views/company/branch')));
const Roles = Loadable(lazy(() => import('views/basicMaster/roles')));
const ScreenNames = Loadable(lazy(() => import('views/basicMaster/ScreenNames')));
const Employee = Loadable(lazy(() => import('views/basicMaster/employee')));
const Department = Loadable(lazy(() => import('views/basicMaster/department')));
const Designation = Loadable(lazy(() => import('views/basicMaster/designation')));
const Product = Loadable(lazy(() => import('views/basicMaster/Product')));
const PriceMaster = Loadable(lazy(() => import('views/basicMaster/PriceMaster')));
const UnitMaster = Loadable(lazy(() => import('views/basicMaster/UnitMaster')));
const CategoryMaster = Loadable(lazy(() => import('views/basicMaster/CategoryMaster')));
const SubCategory = Loadable(lazy(() => import('views/basicMaster/SubCategory')));
const Port = Loadable(lazy(() => import('views/basicMaster/Port')));
const ListOfValues = Loadable(lazy(() => import('views/basicMaster/ListOfValues')));
const ScreenAccess = Loadable(lazy(() => import('views/basicMaster/ScreenAccess')));

// documents
const DocumentType = Loadable(lazy(() => import('views/Documents/documentType')));
const DocumentTypeMapping = Loadable(lazy(() => import('views/Documents/documentTypeMapping')));
const MultipleDocumentIdGeneration = Loadable(lazy(() => import('views/Documents/multipleDocumentIdGeneration')));

// companySetup
const CreateCompany = Loadable(lazy(() => import('views/companySetup/CreateCompany')));
const CompanySetup = Loadable(lazy(() => import('views/companySetup/CompanySetup')));
// const CompanyMain = Loadable(lazy(() => import('views/company/companyMain')));
// const CreateCompany = Loadable(lazy(() => import('views/company/CreateCompany')));

// Activities
const Active = Loadable(lazy(() => import('views/Activities/Active')));
const Schedule = Loadable(lazy(() => import('views/Activities/Schedule')));

// Transaction
const Lead = Loadable(lazy(() => import('views/Transaction/Lead')));
const Opportunity = Loadable(lazy(() => import('views/Transaction/Opportunity')));
const Quotation = Loadable(lazy(() => import('views/Transaction/Quotation')));
const SaleOrder = Loadable(lazy(() => import('views/Transaction/SaleOrder')));
const CustomerDetails = Loadable(lazy(() => import('views/Transaction/CustomerDetails')));

//Rate Management
const Rate = Loadable(lazy(() => import('views/RateManagement/Rate')));

// Dealer
const Dealer = Loadable(lazy(() => import('views/Dealers/Dealers')));

//Location Tracking
const LiveStaffTracker = Loadable(lazy(() => import('views/Tracking/LiveStaffTracker')));

// NominationEnquiries
const NominationEnquiries = Loadable(lazy(() => import('views/NominationEnquiries/AllNominationEnquiries')));

// login option 3 routing
// const AuthRegister3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Register3')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const FinanceRoute = {
  path: '/',
  element: (
    <PrivateRoute>
      {' '}
      <MainLayout />
    </PrivateRoute>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    // Calendar
    {
      path: '/calendar',
      element: <Calendar />
    },
    // companysetup
    {
      path: '/companysetup/createcompany',
      element: (
        <PrivateRoute>
          {' '}
          <CreateCompany />
        </PrivateRoute>
      )
    },
    {
      path: '/companysetup/companysetup',
      element: <CompanySetup />
    },
    // {
    //   path: '/company/companyMain',
    //   element: <CompanyMain />
    // },
    // {
    //   path: '/company/CreateCompany',
    //   element: <CreateCompany />
    // },

    // basicmaster
    {
      path: '/basicMaster/country',
      element: <Country />
    },
    {
      path: '/basicMaster/state',
      element: <State />
    },
    {
      path: '/basicMaster/city',
      element: <City />
    },
    {
      path: '/basicMaster/RegionMaster',
      element: <Region />
    },
    {
      path: '/basicMaster/department',
      element: <Department />
    },
    {
      path: '/basicMaster/designation',
      element: <Designation />
    },
    {
      path: '/basicMaster/employee',
      element: <Employee />
    },
    {
      path: '/basicMaster/Product',
      element: <Product />
    },
    {
      path: '/basicMaster/PriceMaster',
      element: <PriceMaster />
    },
    {
      path: '/basicMaster/UnitMaster',
      element: <UnitMaster />
    },
    {
      path: '/basicMaster/CategoryMaster',
      element: <CategoryMaster />
    },
    {
      path: '/basicMaster/SubCategory',
      element: <SubCategory />
    },
    {
      path: '/basicMaster/currency',
      element: <Currency />
    },

    {
      path: '/basicMaster/finYear',
      element: <FinYear />
    },
    {
      path: '/basicMaster/roles',
      element: <Roles />
    },
    {
      path: '/basicMaster/ListOfValues',
      element: <ListOfValues />
    },
    {
      path: '/basicMaster/ScreenNames',
      element: <ScreenNames />
    },
    {
      path: '/basicMaster/ScreenAccess',
      element: <ScreenAccess />
    },
    {
      path: '/basicMaster/port',
      element: <Port />
    },
    {
      path: '/basicMaster/warehouse',
      element: <Warehouse />
    },
    // Document
    {
      path: '/Documents/documentType',
      element: <DocumentType />
    },
    {
      path: '/Documents/documentTypeMapping',
      element: <DocumentTypeMapping />
    },
    {
      path: '/Documents/multipleDocumentIdGeneration',
      element: <MultipleDocumentIdGeneration />
    },

    // Activities
    {
      path: '/Activities/Active',
      element: <Active />
    },
    {
      path: '/Activities/Schedule',
      element: <Schedule />
    },

    // Transaction
    {
      path: '/Transaction/Lead',
      element: <Lead />
    },
    {
      path: '/Transaction/Opportunity',
      element: <Opportunity />
    },
    {
      path: '/Transaction/Quotation',
      element: <Quotation />
    },
    {
      path: '/Transaction/SaleOrder',
      element: <SaleOrder />
    },
    {
      path: '/Transaction/CustomerDetails',
      element: <CustomerDetails />
    },

    // Rate Management
    {
      path: '/RateManagement/Rate',
      element: <Rate />
    },

    // Dealer
    {
      path: '/Dealers/Dealer',
      element: <Dealer />
    },
    {
      path: '/NominationEnquiries/AllNominationEnquiries',
      element: <NominationEnquiries />
    },
    // Reports
    {
      path: '/Report/UnAssignedLeads',
      element: <UnAssignedLeads />
    },
    {
      path: '/Report/LeadReport',
      element: <LeadReport />
    },
    {
      path: '/Report/OpportunityReport',
      element: <OpportunityReport />
    },
    {
      path: '/Report/QuotationReport',
      element: <QuotationReport />
    },
    {
      path: '/Report/SalesOrderReport',
      element: <SalesOrderReport />
    },
    {
      path: '/Report/ActiveReport',
      element: <ActiveReport />
    },
    {
      path: '/Report/ScheduleReport',
      element: <ScheduleReport />
    },
    {
      path: '/Report/DealerReport',
      element: <DealerReport />
    },
    {
      path: '/Crm/BulkEmail',
      element: <BulkEmail />
    },
    {
      path: '/Tracking/LiveStaffTracker',
      element: <LiveStaffTracker />
    },
    {
      path: '/Report/LeadJourney',
      element: <LeadJourney />
    },
    {
      path: '/Report/ProductionManagementReport',
      element: <ProductionManagementReport />
    },
    {
      path: '/Report/InventoryManagementReport',
      element: <InventoryItemReport />
    },
    {
      path: '/Report/QualityTestReport',
      element: <QualityTestReport />
    },
    {
      path: '/Report/SupplierManagementReport',
      element: <SupplierManagementReport />
    },
    {
      path: '/Report/StaticReport',
      element: <StaticReport />
    },
    {
      path: '/Report/StaticReportT',
      element: <StaticReport2 />
    },
    {
      path: '/Transaction/ProductionManagement',
      element: <ProductionManagement />
    },
    {
      path: '/Transaction/InventoryManagement',
      element: <InventoryManagement />
    },
    {
      path: '/Transaction/SupplierManagement',
      element: <SupplierManagement />
    },
    {
      path: '/Transaction/QualityManagement',
      element: <QualityManagement />
    }
  ]
};

export default FinanceRoute;
