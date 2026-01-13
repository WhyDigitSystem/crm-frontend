// assets
import {
    IconCash,           // Finance folder
    IconReceipt,        // Expense Claim
    IconCheckbox        // Expense Approval
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
        icon: IconCheckbox
    }
].filter(Boolean);

const FinanceManagement =
    FinanceChildren.length > 0
        ? {
            id: 'financeManagement',
            type: 'group',
            children: [
                {
                    id: 'financeManagement',
                    title: 'Finance',
                    type: 'collapse',
                    icon: IconCash,
                    children: FinanceChildren
                }
            ]
        }
        : null;

export default FinanceManagement;
