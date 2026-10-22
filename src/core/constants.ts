export const APP_CONSTANTS = {
  appName: 'Expand',
  version: '1.0.0',
  maxReceiptsPerOrder: 5,
  defaultCurrencySymbol: '৳',
  defaultNumberGrouping: 'lakhCrore' as const,
};

export const BUSINESS_FINANCE_LABELS = {
  incomeSources: [
    'Retail Sales',
    'Wholesale Sales',
    'Service / Repair',
    'Custom Project',
    'Commission',
    'Online Store Order',
  ],
  expenseCategories: [
    'Raw Materials & Inventory',
    'Shop Rent',
    'Staff Salaries & Daily Wages',
    'Utilities & Internet',
    'Packaging & Shipping',
    'Equipment & Maintenance',
    'Marketing & Promotion',
    'Government / Taxes / Trade License',
  ],
};

export const PERSONAL_FINANCE_LABELS = {
  incomeSources: [
    'Monthly Allowance / Dividend',
    'Personal Salary',
    'Freelance Project',
    'Investment Return',
    'Gift / Cash Received',
  ],
  expenseCategories: [
    'Groceries & Household',
    'Family Support & Parents',
    'Dining Out & Coffee',
    'Health & Medical',
    'Personal Education & Books',
    'Commute & Fuel',
    'Shopping & Apparel',
    'Emergency & Unplanned',
  ],
};
