// assets
import { IconKey } from '@tabler/icons-react';

// constant
const icons = {
  IconKey
};

// ==============================|| DASHBOARD MENU ITEMS ||============================== //

const transaction = {
  id: 'transaction',
  title: 'Transaction',
  //   caption: 'Pages Caption',
  type: 'group',
  children: [
    {
      id: 'transaction',
      title: 'Transaction',
      type: 'collapse',
      icon: icons.IconKey,

      children: [
        {
          id: 'daily',
          title: 'Daily / Monthly Ex. Rates',
          type: 'item',
          url: '/finance/daily/DailyRate'
        },
        {
          id: 'chartOfCostCenter',
          title: 'Chart of Costcenter',
          type: 'item',
          url: '/finance/chartOfCostcenter/ChartOfCostcenter'
        },
        {
          id: 'brsOpening',
          title: 'BRS Opening',
          type: 'item',
          url: '/finance/BRSOpening'
        },
        // {
        //   id: 'glOpening',
        //   title: 'GL Opening Balance',
        //   type: 'item',
        //   url: '/finance/glOpening/GlOpening'
        // },
        {
          id: 'fundTransfer',
          title: 'Fund Transfer',
          type: 'item',
          url: '/finance/FundTransfer'
        },
        {
          id: 'generalJournal',
          title: 'General Journal',
          type: 'item',
          url: '/finance/GeneralJournal/GeneralJournal'
        },

        {
          id: 'reconcile-bank',
          title: 'Reconcile Bank',
          type: 'item',
          url: '/finance/Reconcile/Reconcile'
        },
        {
          id: 'reconcile-corp',
          title: 'Reconcile Corp',
          type: 'item',
          url: '/finance/Reconcile/ReconcileCorp'
        },
        {
          id: 'reconcile-cash',
          title: 'Reconcile Cash',
          type: 'item',
          url: '/finance/Reconcile/ReconcileCash'
        },
        {
          id: 'taxInvoiceDetail',
          title: 'Tax Invoice',
          type: 'item',
          url: '/finance/taxInvoice/taxInvoiceDetail'
        },
        {
          id: 'creditNoteDetail',
          title: 'IRN Credit Note',
          type: 'item',
          url: '/finance/creditNote/creditNoteDetail'
        },
        {
          id: 'costInvoice',
          title: 'Cost Invoice',
          type: 'item',
          url: '/finance/costInvoice/CostInvoice'
        },
        {
          id: 'costDebitNote',
          title: 'Cost Debit Note',
          type: 'item',
          url: '/finance/costDebitNote/CostDebitNote'
        },
        {
          id: 'paymentVoucher',
          title: 'Payment Voucher',
          type: 'item',
          url: '/finance/paymentVoucher/paymentVoucher'
        },
        {
          id: 'ARAPDetail',
          title: 'ARAP Detail',
          type: 'item',
          url: '/finance/ARAP-Details'
        },
        {
          id: 'ARAPAdjustment',
          title: 'ARAP Adjustment',
          type: 'item',
          url: '/finance/ARAP-Adjustment'
        },
        {
          id: 'adjustmentJournal',
          title: 'Adjustment Journal',
          type: 'item',
          url: '/finance/AdjustmentJournal'
        }, 
        {
          id: 'JobCard',
          title: 'Job Card',
          type: 'item',
          url: '/finance/JobCard'
        },
        {
          id: 'AdjustmentOffset',
          title: 'Adjustment Offset',
          type: 'item',
          url: '/finance/AdjustmentOffset'
        },
        // {
        //   id: 'ExcelUpload',
        //   title: 'Excel Upload',
        //   type: 'item',
        //   url: '/finance/ExcelUpload'
        // },
        {
          id: 'deposit',
          title: 'Deposit',
          type: 'item',
          url: '/finance/Deposit'
        },
        {
          id: 'withdrawal',
          title: 'Withdrawal',
          type: 'item',
          url: '/finance/Withdrawal'
        },
        {
          id: 'contraVoucher',
          title: 'Contra Voucher',
          type: 'item',
          url: '/finance/ContraVoucher'
        }
      ]
    }
  ]
};

export default transaction;
