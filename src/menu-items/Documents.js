// assets
import {
    IconFiles,
    IconFileText,
    IconFileSymlink,
    IconIdBadge2,
    IconCalendarStats,
    IconLayoutDashboard
} from '@tabler/icons-react';

// constant
const icons = {
    IconFiles,
    IconFileText,
    IconFileSymlink,
    IconIdBadge2,
    IconCalendarStats,
    IconLayoutDashboard
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Documents = {
    id: 'Documents',
    type: 'group',
    children: [
        {
            id: 'Documents',
            title: 'Documents',
            type: 'collapse',
            icon: icons.IconFiles, // changed from IconKey to IconFiles

            children: [
                {
                    id: 'documentType',
                    title: 'Document Type',
                    type: 'item',
                    url: '/Documents/documentType',
                    icon: icons.IconFileText
                },
                {
                    id: 'documentTypeMapping',
                    title: 'Document Type Mapping',
                    type: 'item',
                    url: '/Documents/documentTypeMapping',
                    icon: icons.IconFileSymlink
                },
                {
                    id: 'multipleDocumentIdGeneration',
                    title: 'Multiple Document Id Generation',
                    type: 'item',
                    url: '/Documents/multipleDocumentIdGeneration',
                    icon: icons.IconIdBadge2
                },
                {
                    id: 'finYear',
                    title: 'FinYear',
                    type: 'item',
                    url: '/basicMaster/finYear',
                    icon: icons.IconCalendarStats
                },
                {
                    id: 'screenNames',
                    title: 'Screen Names',
                    type: 'item',
                    url: '/basicMaster/ScreenNames',
                    icon: icons.IconLayoutDashboard
                }
            ]
        }
    ]
};

export default Documents;
