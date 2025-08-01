import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type RecurringTransaction = {
  id: string;
  user_id: string;
  household_id?: string;
  account_id: string;
  category_id?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
  next_execution_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  account?: { name: string };
  category?: { name: string };
};

export type CreateRecurringTransactionData = {
  account_id: string;
  category_id?: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  start_date: string;
  end_date?: string;
};

export const useRecurringTransactions = () => {
  return useQuery({
    queryKey: ['recurring-transactions'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .from('recurring_transactions')
        .select(`
          *,
          account:accounts(name),
          category:categories(name)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as RecurringTransaction[];
    },
  });
};

export const useCreateRecurringTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateRecurringTransactionData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate next execution date
      const { data: nextDate } = await (supabase as any).rpc('calculate_next_execution_date', {
        input_date: data.start_date,
        frequency_type: data.frequency
      });

      const { data: result, error } = await (supabase as any)
        .from('recurring_transactions')
        .insert({
          ...data,
          user_id: user.id,
          next_execution_date: nextDate || data.start_date,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({
        title: "Recurring transaction created",
        description: "Your recurring transaction has been set up successfully.",
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

export const useUpdateRecurringTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateRecurringTransactionData> }) => {
      const { data: result, error } = await (supabase as any)
        .from('recurring_transactions')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({
        title: "Recurring transaction updated",
        description: "Your recurring transaction has been updated successfully.",
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

export const useDeleteRecurringTransaction = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('recurring_transactions')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recurring-transactions'] });
      toast({
        title: "Recurring transaction deleted",
        description: "Your recurring transaction has been deleted successfully.",
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