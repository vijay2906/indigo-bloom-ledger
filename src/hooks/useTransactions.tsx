import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Transaction = {
  id: string;
  user_id: string;
  account_id: string;
  category_id: string;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  is_recurring: boolean;
  recurring_frequency?: string;
  receipt_url?: string;
  created_at: string;
  updated_at: string;
  category?: {
    name: string;
    icon: string;
    color: string;
    type: string;
  };
  account?: {
    name: string;
    type: string;
  };
};

export type CreateTransactionData = {
  account_id: string;
  category_id: string;
  amount: number;
  description: string;
  notes?: string;
  date: string;
  type: 'income' | 'expense' | 'transfer';
  is_recurring?: boolean;
  recurring_frequency?: string;
};

export const useTransactions = () => {
  return useQuery({
    queryKey: ['transactions'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, icon, color, type),
          account:accounts(name, type)
        `)
        .order('date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateTransactionData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await supabase
        .from('transactions')
        .insert([{ ...data, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({
        title: "Transaction added",
        description: "Your transaction has been recorded successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...data }: Partial<Transaction> & { id: string }) => {
      const { data: result, error } = await supabase
        .from('transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({
        title: "Transaction updated",
        description: "Your transaction has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['accounts'] });
      toast({
        title: "Transaction deleted",
        description: "Your transaction has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    },
  });
};