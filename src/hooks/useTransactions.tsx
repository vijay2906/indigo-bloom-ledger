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

export type TransactionFilters = {
  search?: string;
  category_id?: string;
  account_id?: string;
  type?: 'income' | 'expense' | 'transfer';
  date_from?: string;
  date_to?: string;
  amount_min?: number;
  amount_max?: number;
};

export const useTransactions = (filters?: TransactionFilters) => {
  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user's households first
      const { data: households } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id);
      
      const householdIds = households?.map(h => h.household_id) || [];
      
      // Build query with filters
      let query = supabase
        .from('transactions')
        .select(`
          *,
          category:categories(name, icon, color, type),
          account:accounts(name, type)
        `)
        .or(`user_id.eq.${user.id}${householdIds.length > 0 ? `,household_id.in.(${householdIds.join(',')})` : ''}`);

      // Apply filters
      if (filters?.category_id) {
        query = query.eq('category_id', filters.category_id);
      }
      if (filters?.account_id) {
        query = query.eq('account_id', filters.account_id);
      }
      if (filters?.type) {
        query = query.eq('type', filters.type);
      }
      if (filters?.date_from) {
        query = query.gte('date', filters.date_from);
      }
      if (filters?.date_to) {
        query = query.lte('date', filters.date_to);
      }
      if (filters?.amount_min !== undefined) {
        query = query.gte('amount', filters.amount_min);
      }
      if (filters?.amount_max !== undefined) {
        query = query.lte('amount', filters.amount_max);
      }

      query = query.order('date', { ascending: false });

      const { data, error } = await query;
      if (error) throw error;
      
      let filteredData = data as Transaction[];

      // Apply text search filter (client-side for better performance)
      if (filters?.search) {
        const searchTerm = filters.search.toLowerCase();
        filteredData = filteredData.filter(transaction =>
          transaction.description.toLowerCase().includes(searchTerm) ||
          transaction.notes?.toLowerCase().includes(searchTerm) ||
          transaction.category?.name.toLowerCase().includes(searchTerm) ||
          transaction.account?.name.toLowerCase().includes(searchTerm)
        );
      }

      return filteredData;
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

      // Check if user is part of a household and set household_id
      const { data: householdMember } = await supabase
        .from('household_members')
        .select('household_id')
        .eq('user_id', user.id)
        .limit(1)
        .single();

      const transactionData = {
        ...data,
        user_id: user.id,
        household_id: householdMember?.household_id || null
      };

      const { data: result, error } = await supabase
        .from('transactions')
        .insert([transactionData])
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