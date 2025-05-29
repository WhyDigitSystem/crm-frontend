// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const SubContractor = {
  id: 'subContractor',
  title: 'Sub Contractor',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'subContractor',
      title: 'Sub Contractor',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'issueToSubContractor',
          title: 'Issue To Sub Contractor',
          type: 'item',
          url: '/SubContractor/IssueToSubContractor'
        },
        {
          id: 'subContractorEnquiry',
          title: 'Sub Contractor Enquiry',
          type: 'item',
          url: '/SubContractor/SubContractorEnquiry'
        },
        {
          id: 'subContractorQuotation',
          title: 'Sub Contractor Quotation',
          type: 'item',
          url: '/SubContractor/SubContractorQuotation'
        },
        {
          id: 'dcForSubContractor',
          title: 'Delivery Challan For Sub Contractor',
          type: 'item',
          url: '/SubContractor/DcForSubContractor'
        },
        {
          id: 'workJobOutOrder',
          title: 'Work Job Out Order',
          type: 'item',
          url: '/SubContractor/WorkJobOutOrder'
        },
        {
          id: 'subContractorInvoice',
          title: 'Sub Contractor Invoice',
          type: 'item',
          url: '/SubContractor/SubContractorInvoice'
        },
        {
          id: 'receiveSubContractor',
          title: 'Receive From Sub Contractor',
          type: 'item',
          url: '/SubContractor/ReceiveSubContractor'
        }
      ]
    }
  ]
};

export default SubContractor;
