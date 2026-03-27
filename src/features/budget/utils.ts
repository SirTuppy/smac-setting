export const CH_COLORS = [
    '#2563eb', // Blue
    '#10b981', // Emerald
    '#8b5cf6', // Violet
    '#f59e0b', // Amber
    '#ec4899', // Pink
    '#0ea5e9', // Sky
    '#f43f5e', // Rose
    '#14b8a6', // Teal
    '#eab308'  // Yellow
];

export const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

export const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};
