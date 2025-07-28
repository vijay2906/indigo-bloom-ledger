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

export const formatCurrency = (amount: number, currency: string = 'INR'): string => {
  const symbol = getCurrencySymbol(currency);
  return `${symbol}${Math.abs(amount).toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatCurrencyShort = (amount: number, currency: string = 'INR'): string => {
  const symbol = getCurrencySymbol(currency);
  const absAmount = Math.abs(amount);
  
  if (absAmount >= 10000000) {
    return `${symbol}${(absAmount / 10000000).toFixed(1)}Cr`;
  } else if (absAmount >= 100000) {
    return `${symbol}${(absAmount / 100000).toFixed(1)}L`;
  } else if (absAmount >= 1000) {
    return `${symbol}${(absAmount / 1000).toFixed(1)}K`;
  }
  
  return `${symbol}${absAmount.toLocaleString('en-IN')}`;
};