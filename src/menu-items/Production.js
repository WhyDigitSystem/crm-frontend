// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const Production = {
  id: 'production',
  title: 'Production',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'production',
      title: 'Production',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'productionPlan',
          title: 'Production Plan',
          type: 'item',
          url: '/Product/ProductionPlan'
        },
        {
          id: 'jobOrder',
          title: 'Job Order',
          type: 'item',
          url: '/Product/JobOrder'
        },
        {
          id: 'processDone',
          title: 'Process Done',
          type: 'item',
          url: '/Product/ProcessDone'
        },
        {
          id: 'dispatchPlan',
          title: 'Dispatch Plan',
          type: 'item',
          url: '/Product/DispatchPlan'
        }
      ]
    }
  ]
};

export default Production;
