import admin from './admin';
import ap from './ap';
import ar from './ar';
import Assembly from './Assembly';
import basicMaster from './basicMaster';
import companySetup from './companySetup';
import CustomerEnquiry from './CustomerEnquiry';
import dashboard from './dashboard';
import finance from './finance';
import InboundOutbound from './Inbound-Outbound';
import Inventory from './Inventory';
import opsTransaction from './opsTransaction';
import Packaging from './Packaging';
import Production from './Production';
import Purchase from './Purchase';
import Quality from './Quality';
import RolesAndResponsibilities from './RolesAndResponsibilities';
import Sales from './Sales';
import SubContractor from './SubContractor';
import transaction from './transaction';

// Function to get menu items based on localStorage value
const getMenuItems = () => {
  const localStorageValue = 'ROLE_ADMIN'; // Replace 'your_key_here' with the key you are using to store the value

  // Define default menu items
  const defaultMenuItems = {
    items: [
      dashboard,
      opsTransaction,
      CustomerEnquiry,
      Purchase,
      InboundOutbound,
      Inventory,
      Production,
      SubContractor,
      Assembly,
      Quality,
      Sales,
      Packaging,
      admin,
      basicMaster,
      finance,
      transaction,
      ar,
      ap
    ]
  };

  // Define menu items based on localStorage value
  switch (localStorageValue) {
    case 'ROLE_SUPER_ADMIN':
      return {
        items: [dashboard, companySetup, basicMaster]
      };
    case 'ROLE_ADMIN':
      return {
        items: [
          dashboard,
          companySetup,
          opsTransaction,
          CustomerEnquiry,
          Purchase,
          InboundOutbound,
          Inventory,
          Production,
          SubContractor,
          Assembly,
          Quality,
          Sales,
          Packaging,
          admin,
          RolesAndResponsibilities,
          basicMaster,
          finance,
          transaction,
          ar,
          ap
        ]
      };
    // Add more cases as needed
    default:
      return defaultMenuItems; // Return default menu items if no match found
  }
};

// Export default menu items
export default getMenuItems();
