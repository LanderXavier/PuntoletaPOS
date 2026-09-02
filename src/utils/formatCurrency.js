export function formatCurrency(amount, symbol = "$") {
  const value = Number.isFinite(amount) ? amount : 0;
  return `${symbol}${value.toFixed(2)}`;
}
