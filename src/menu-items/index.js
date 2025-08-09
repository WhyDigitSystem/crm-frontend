// getMenuItems.js

import admin from './admin';
import calendar from './calendar';
import basicMaster from './basicMaster';
import Documents from './Documents';
import companySetup from './companySetup';
import dashboard from './dashboard';
import Activities from './Activities';
import Transaction from './Transaction';
import rate from './RateManagement';
import DealerManagement from './DealerManagement';
import NominationEnquiries from './NominationEnquiries';
import Reports from './Reports';



// Helper to remove null/undefined modules
const filterValid = (items) => items.filter(Boolean);

const getMenuItems = () => {
  return {
    items: filterValid([
      dashboard,
      calendar,
      companySetup,
      admin,
      basicMaster,
      Documents,
      Activities,
      Transaction,
      rate,
      DealerManagement,
      NominationEnquiries,
      Reports
    ])
  };
};

export default getMenuItems();
