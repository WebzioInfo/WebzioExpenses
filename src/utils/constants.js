// Webzio Accounting v2 Constants
// Focus: Simplified English for fast internal company usage.

export const ENTRY_TYPES = {
  MONEY_IN: 'Money In',
  MONEY_OUT: 'Money Out',
  ADDED_MONEY: 'Added Money',
  SALARY: 'Salary',
  TRANSFER: 'Transfer',
};

// Legacy mapping for backward compatibility during migration
export const TRANSACTION_TYPES = {
  INCOME: ENTRY_TYPES.MONEY_IN,
  EXPENSE: ENTRY_TYPES.MONEY_OUT,
  INVESTMENT: ENTRY_TYPES.ADDED_MONEY,
  SALARY: ENTRY_TYPES.SALARY,
  TRANSFER: ENTRY_TYPES.TRANSFER,
};

export const STAFF_ROLES = {
  FOUNDER: 'Founder',
  STAFF: 'Staff',
  FREELANCER: 'Freelancer',
};

// Legacy mapping
export const ROLES = STAFF_ROLES;

export const ACCOUNTS = {
  CASH: 'Cash',
  BANK: 'Bank',
  UPI: 'UPI',
  PETTY_CASH: 'Petty Cash',
};

export const ENTRY_STATUS = {
  PAID: 'Paid',
  PENDING: 'Pending',
  CANCELLED: 'Cancelled',
};

export const RECURRING_FREQUENCIES = {
  WEEKLY: 'Weekly',
  MONTHLY: 'Monthly',
};

export const INCOME_CATEGORIES = [
  'Service Fee',
  'Product Sale',
  'Consultancy',
  'Refund',
  'Other',
];

export const EXPENSE_CATEGORIES = [
  'Software Subscriptions',
  'Office Rent',
  'Marketing & Ads',
  'Hardware',
  'Travel',
  'Utility Bills',
  'Miscellaneous',
];

export const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
};

export const DATE_FILTERS = {
  TODAY: 'Today',
  THIS_MONTH: 'This Month',
  LAST_MONTH: 'Last Month',
  THIS_YEAR: 'This Year',
};
