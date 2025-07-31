import { lazy } from 'react';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import PrivateRoute from '../routes/PrivateRoute';
import { element } from 'prop-types';



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
const Dealer = Loadable(lazy(() => import('views/Dealers/Dealers')));
// login option 3 routing
// const AuthRegister3 = Loadable(lazy(() => import('views/pages/authentication/authentication3/Register3')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const FinanceRoute = {
  path: '/',
  element: <PrivateRoute> <MainLayout /></PrivateRoute>,
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
      element: <PrivateRoute> <CreateCompany /></PrivateRoute>
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
      path: '/basicMaster/ScreenNames',
      element: <ScreenNames />
    },
    {
      path: '/basicMaster/ScreenAccess',
      element: <ScreenAccess />
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
  ]
};

export default FinanceRoute;
