export const currencySymbols: Record<string, string> = {
  USD: '$',
  EUR: '€',
  INR: '₹',
  GBP: '£',
  JPY: '¥',
  CAD: 'C$',
  AUD: 'A$',
  CHF: 'CHF',
  CNY: '¥',
  SEK: 'kr',
  NZD: 'NZ$',
  MXN: '$',
  SGD: 'S$',
  HKD: 'HK$',
  NOK: 'kr',
  TRY: '₺',
  RUB: '₽',
  BRL: 'R$',
  ZAR: 'R',
  KRW: '₩',
};

export const getCurrencySymbol = (currency: string): string => {
  return currencySymbols[currency.toUpperCase()] || currency;
};

export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};