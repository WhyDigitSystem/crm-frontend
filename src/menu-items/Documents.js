// assets
import {
  IconFiles,
  IconFileText,
  IconFileSymlink,
  IconIdBadge2,
  IconCalendarStats,
  IconLayoutDashboard
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
  const userType = localStorage.getItem('userType');

  if (userType === 'ADMIN') {
    return true;
  }

  const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
  const access = screenAccess?.[screenId];

  return access?.canRead || access?.canWrite || access?.canDelete;
};

// document children menu
const documentChildren = [
  hasScreenAccess('DT') && {
    id: 'documentType',
    title: 'Document Type',
    type: 'item',
    url: '/Documents/documentType',
    icon: IconFileText
  },
  hasScreenAccess('DTM') && {
    id: 'documentTypeMapping',
    title: 'Document Type Mapping',
    type: 'item',
    url: '/Documents/documentTypeMapping',
    icon: IconFileSymlink
  },
  hasScreenAccess('MDIG') && {
    id: 'multipleDocumentIdGeneration',
    title: 'Multiple Document Id Generation',
    type: 'item',
    url: '/Documents/multipleDocumentIdGeneration',
    icon: IconIdBadge2
  },
  hasScreenAccess('FIN_YEAR') && {
    id: 'finYear',
    title: 'FinYear',
    type: 'item',
    url: '/basicMaster/finYear',
    icon: IconCalendarStats
  },
  hasScreenAccess('SN') && {
    id: 'screenNames',
    title: 'Screen Names',
    type: 'item',
    url: '/basicMaster/ScreenNames',
    icon: IconLayoutDashboard
  },
  hasScreenAccess('SA') && {
    id: 'ScreenAccess',
    title: 'Screen Access',
    type: 'item',
    url: '/basicMaster/ScreenAccess',
    icon: IconLayoutDashboard
  }
].filter(Boolean);

const Documents =
  documentChildren.length > 0
    ? {
        id: 'Documents',
        type: 'group',
        children: [
          {
            id: 'Documents',
            title: 'Documents',
            type: 'collapse',
            icon: IconFiles,
            children: documentChildren
          }
        ]
      }
    : null;

export default Documents;
