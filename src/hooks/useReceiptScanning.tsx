import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { captureReceipt } from "@/utils/mobile";
import { supabase } from "@/integrations/supabase/client";

export type ReceiptData = {
  merchant_name?: string;
  total_amount?: number;
  transaction_date?: string;
  items?: Array<{
    name: string;
    quantity?: number;
    price?: number;
  }>;
  extracted_data?: any;
};

export const useReceiptScanning = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const scanReceipt = async (): Promise<ReceiptData | null> => {
    setIsProcessing(true);
    try {
      // Capture receipt photo
      const imageDataUrl = await captureReceipt();
      
      if (!imageDataUrl) {
        throw new Error("No image captured");
      }

      // Extract base64 data from data URL
      const base64Data = imageDataUrl.split(',')[1];

      // Call edge function to extract receipt data using OpenAI Vision
      const { data, error } = await supabase.functions.invoke('extract-receipt-data', {
        body: { image: base64Data }
      });

      if (error) {
        throw new Error(error.message);
      }

      toast({
        title: "Receipt scanned successfully",
        description: "Transaction details extracted from receipt.",
      });

      return data.receiptData;
    } catch (error) {
      console.error('Receipt scanning error:', error);
      toast({
        variant: "destructive",
        title: "Receipt scanning failed",
        description: error instanceof Error ? error.message : "Failed to scan receipt",
      });
      return null;
    } finally {
      setIsProcessing(false);
    }
  };

  const saveReceiptData = async (transactionId: string, receiptData: ReceiptData) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await (supabase as any)
        .from('receipt_data')
        .insert({
          user_id: user.id,
          transaction_id: transactionId,
          merchant_name: receiptData.merchant_name,
          total_amount: receiptData.total_amount,
          transaction_date: receiptData.transaction_date,
          items: receiptData.items,
          extracted_data: receiptData.extracted_data,
        });

      if (error) throw error;

      toast({
        title: "Receipt data saved",
        description: "Receipt information has been linked to your transaction.",
      });
    } catch (error) {
      console.error('Error saving receipt data:', error);
      toast({
        variant: "destructive",
        title: "Error saving receipt data",
        description: error instanceof Error ? error.message : "Failed to save receipt data",
      });
    }
  };

  return {
    scanReceipt,
    saveReceiptData,
    isProcessing,
  };
};