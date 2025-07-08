import admin from './admin';
import basicMaster from './basicMaster';
import companySetup from './companySetup';
import dashboard from './dashboard';
import Activities from './Activities'

// Function to get menu items based on localStorage value
const getMenuItems = () => {
  const localStorageValue = 'ROLE_ADMIN'; // Replace 'your_key_here' with the key you are using to store the value

  // Define default menu items
  const defaultMenuItems = {
    items: [
      dashboard,
      admin,
      basicMaster,
      Activities,
    ]
  };

  // Define menu items based on localStorage value
  switch (localStorageValue) {
    case 'ROLE_SUPER_ADMIN':
      return {
        items: [dashboard, companySetup, basicMaster, Activities]
      };
    case 'ROLE_ADMIN':
      return {
        items: [
          dashboard,
          companySetup,
          admin,
          basicMaster,
          // Activities,
        ]
      };
    // Add more cases as needed
    default:
      return defaultMenuItems; // Return default menu items if no match found
  }
};

// Export default menu items
export default getMenuItems();
