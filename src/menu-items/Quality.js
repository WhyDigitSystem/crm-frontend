// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Quality = {
  id: 'quality',
  title: 'Quality',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'quality',
      title: 'Quality',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'incomingMaterialInspection',
          title: 'Incoming Material Inspection',
          type: 'item',
          url: '/Quality/IncomingMaterialInspection'
        },
        {
          id: 'inprocessInspection',
          title: 'In Process Inspection',
          type: 'item',
          url: '/Quality/InprocessInspection'
        },
        {
          id: 'settingApproval',
          title: 'Setting Approval',
          type: 'item',
          url: '/Quality/SettingApproval'
        },
        {
          id: 'sampleApproval',
          title: 'Sample Approval',
          type: 'item',
          url: '/Quality/SampleApproval'
        },
        {
          id: 'dailyPatrolInspection',
          title: 'Daily Patrol Inspection',
          type: 'item',
          url: '/Quality/DailyPatrolInspection'
        },
        {
          id: 'finalInspectionReport',
          title: 'Final Inspection Report',
          type: 'item',
          url: '/Quality/FinalInspectionReport'
        },
        {
          id: 'toolsIssue',
          title: 'Tools Issue To Calibration',
          type: 'item',
          url: '/Quality/ToolsIssue'
        },
        {
          id: 'toolsReceived',
          title: 'Tools Received From Calibration',
          type: 'item',
          url: '/Quality/ToolsReceived'
        },
        {
          id: 'toolsIssueEntry',
          title: 'Tools Issue Entry',
          type: 'item',
          url: '/Quality/ToolsIssueEntry'
        }
      ]
    }
  ]
};

export default Quality;
