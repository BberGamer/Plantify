export const formatCurrency = (amount) => {
  if (amount === undefined || amount === null) return '$0.00';
  return `$${Number(amount).toFixed(2)}`;
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString();
};
