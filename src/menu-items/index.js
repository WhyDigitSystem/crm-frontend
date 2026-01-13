import calendar from './calendar';
import Documents from './Documents';
import companySetup from './companySetup';
import Activities from './Activities';
import rate from './RateManagement';
import DealerManagement from './DealerManagement';

import dashboard from './dashboard';
import Transaction from './Transaction';
import admin from './admin';
import NominationEnquiries from './NominationEnquiries';
import Reports from './Reports';
import Tracking from './Tracking';
import FinanceManagement from './FinanceManagement';
import announcement from './announcement';
import organization from './organization';
import performance from './performance';
import Operations from './operations';



// Helper to remove null/undefined modules
const filterValid = (items) => items.filter(Boolean);

const getMenuItems = () => {
  return {
    items: filterValid([
      dashboard,
      announcement,
      Transaction,
      Operations,
      performance,
      FinanceManagement,
      Tracking,
      Reports,
      organization,
      admin,
      // NominationEnquiries,
      // calendar,
      // Activities,
      // rate,
      // DealerManagement,
      // companySetup,
      // basicMaster,
      // Documents,
    ])
  };
};

export default getMenuItems();
