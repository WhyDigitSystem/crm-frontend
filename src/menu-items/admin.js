// assets
import { IconUser } from '@tabler/icons-react';

// constant
const icons = { IconUser };

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const admin = {
  id: 'admin',
  title: 'Admin',
  type: 'group',
  children: [
    {
      id: 'admin',
      title: 'User Creation',
      type: 'item',
      url: '/admin/user-creation/userCreation',
      icon: icons.IconUser,
      breadcrumbs: true
    }
  ]
};

export default admin;
