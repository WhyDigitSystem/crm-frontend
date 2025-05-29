// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const opsTransaction = {
  id: 'ops',
  title: 'OPS MASTER',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'ops',
      title: 'Ops Master',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'department',
          title: 'Department',
          type: 'item',
          url: '/Operations/opsTransaction/Department'
        },
        {
          id: 'designation',
          title: 'Designation',
          type: 'item',
          url: '/Operations/opsTransaction/Designation'
        },
        {
          id: 'drawingMaster',
          title: 'Drawing Master',
          type: 'item',
          url: '/Operations/opsTransaction/DrawingMaster'
        },
        {
          id: 'gst',
          title: 'GST',
          type: 'item',
          url: '/Operations/opsTransaction/Gst'
        },
        {
          id: 'itemMaster',
          title: 'Item Master',
          type: 'item',
          url: '/Operations/opsTransaction/ItemMaster'
        },
        {
          id: 'itemWiseProcess',
          title: 'Item Wise Process Master',
          type: 'item',
          url: '/Operations/opsTransaction/ItemWiseProcess'
        },
        {
          id: 'machineMaster',
          title: 'Machine Master',
          type: 'item',
          url: '/Operations/opsTransaction/MachineMaster'
        },
        {
          id: 'measuringInstrument',
          title: 'Measuring Instrument',
          type: 'item',
          url: '/Operations/opsTransaction/MeasuringInstrument'
        },
        {
          id: 'shiftMaster',
          title: 'Shift Master',
          type: 'item',
          url: '/Operations/opsTransaction/ShiftMaster'
        },
        {
          id: 'rackMaster',
          title: 'Rack Master',
          type: 'item',
          url: '/Operations/opsTransaction/RackMaster'
        },
        {
          id: 'billOfMaterial',
          title: 'Bill Of Material',
          type: 'item',
          url: '/Operations/opsTransaction/BillOfMaterial'
        },
        {
          id: 'stockLocation',
          title: 'Stock Location',
          type: 'item',
          url: '/Operations/opsTransaction/StockLocation'
        },
        {
          id: 'processMaster',
          title: 'Process Master',
          type: 'item',
          url: '/Operations/opsTransaction/ProcessMaster'
        },
        {
          id: 'uom',
          title: 'Unit Of Measurement',
          type: 'item',
          url: '/Operations/opsTransaction/Uom'
        },
        {
          id: 'materialType',
          title: 'Material Type',
          type: 'item',
          url: '/Operations/opsTransaction/MaterialType'
        }
      ]
    }
  ]
};

export default opsTransaction;
