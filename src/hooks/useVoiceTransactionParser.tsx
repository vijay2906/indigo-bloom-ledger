import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ParsedTransaction {
  amount?: number;
  description?: string;
  category?: string;
  type?: 'income' | 'expense';
}

export const useVoiceTransactionParser = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const parseTransactionFromText = async (text: string): Promise<ParsedTransaction> => {
    try {
      setIsProcessing(true);

      const { data, error } = await supabase.functions.invoke('parse-transaction-text', {
        body: { text }
      });

      if (error) {
        throw error;
      }

      return data || {};
    } catch (error) {
      console.error('Error parsing transaction:', error);
      toast({
        title: "Parsing failed",
        description: "Could not extract transaction details. Please enter manually.",
        variant: "destructive",
      });
      return {};
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    parseTransactionFromText,
    isProcessing,
  };
};