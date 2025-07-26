// assets
import { IconUser } from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];
  return access?.canRead || access?.canWrite || access?.canDelete;
};

// constant
const icons = { IconUser };

// ==============================|| ADMIN MENU ITEMS ||============================== //

const adminChildren = [
  hasScreenAccess('UC') && {
    id: 'admin',
    title: 'User Creation',
    type: 'item',
    url: '/admin/user-creation/userCreation',
    icon: icons.IconUser,
    breadcrumbs: true
  }
].filter(Boolean);

const admin =
  adminChildren.length > 0
    ? {
        id: 'admin',
        type: 'group',
        children: adminChildren
      }
    : null;

export default admin;
