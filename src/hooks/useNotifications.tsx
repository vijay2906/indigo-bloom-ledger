import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  category?: { name: string };
  account?: { name: string };
  date: string;
}

export const useNotifications = () => {
  const { toast } = useToast();

  const sendTransactionNotification = async (
    type: 'created' | 'updated' | 'deleted',
    transaction: Transaction,
    userEmail?: string,
    userName?: string,
    phoneNumber?: string
  ) => {
    try {
      const { data, error } = await supabase.functions.invoke('send-transaction-notification', {
        body: {
          type,
          transaction: {
            id: transaction.id,
            description: transaction.description,
            amount: transaction.amount,
            type: transaction.type,
            category: transaction.category?.name || 'Uncategorized',
            account: transaction.account?.name || 'Unknown Account',
            date: transaction.date,
          },
          userEmail,
          userName,
          phoneNumber,
        },
      });

      if (error) {
        console.error('Notification error:', error);
        toast({
          variant: "destructive",
          title: "Notification Failed",
          description: "Could not send notification. Transaction was still processed.",
        });
      } else {
        console.log('Notification sent successfully:', data);
      }
    } catch (error) {
      console.error('Notification service error:', error);
    }
  };

  return {
    sendTransactionNotification,
  };
};