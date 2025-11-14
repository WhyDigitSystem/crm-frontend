// assets
import {
    IconUsers,
    IconCurrencyRupee,
    IconReceipt
} from '@tabler/icons-react';

// screen access utility
const hasScreenAccess = (screenId) => {
    const screenAccess = JSON.parse(localStorage.getItem('screenAccess') || '{}');
    const access = screenAccess?.[screenId];
    return access?.canRead || access?.canWrite || access?.canDelete;
};

const FinanceChildren = [
    hasScreenAccess('EC') && {
        id: 'ExpenseClaims',
        title: 'Expense Claim',
        type: 'item',
        url: '/Expense/ExpenseClaims',
        icon: IconReceipt
    },
    hasScreenAccess('EA') && {
        id: 'ExpenseApproval',
        title: 'Expense Approval',
        type: 'item',
        url: '/Expense/ExpenseApproval',
        icon: IconReceipt
    },
].filter(Boolean);

const FinanceManagement =
    FinanceChildren.length > 0
        ? {
            id: 'financeManagement',
            type: 'group',
            children: [
                {
                    id: 'financeManagement',
                    title: 'Finance Mgmt',
                    type: 'collapse',
                    icon: IconCurrencyRupee,
                    children: FinanceChildren
                }
            ]
        }
        : null;

export default FinanceManagement;
