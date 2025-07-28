import { useSettings } from "@/hooks/useSettings";
import { formatCurrency, formatCurrencyShort } from "@/utils/currency";

export const useCurrency = () => {
  const { data: settings } = useSettings();
  const currency = settings?.currency || 'INR';

  const format = (amount: number) => formatCurrency(amount, currency);
  const formatShort = (amount: number) => formatCurrencyShort(amount, currency);

  return {
    currency,
    format,
    formatShort,
  };
};