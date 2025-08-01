import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type BillReminder = {
  id: string;
  user_id: string;
  household_id?: string;
  title: string;
  description?: string;
  amount?: number;
  due_date: string;
  reminder_days_before: number;
  is_recurring: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly';
  category_id?: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
  category?: { name: string };
};

export type CreateBillReminderData = {
  title: string;
  description?: string;
  amount?: number;
  due_date: string;
  reminder_days_before?: number;
  is_recurring?: boolean;
  recurring_frequency?: 'monthly' | 'quarterly' | 'yearly';
  category_id?: string;
};

export const useBillReminders = () => {
  return useQuery({
    queryKey: ['bill-reminders'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await (supabase as any)
        .from('bill_reminders')
        .select(`
          *,
          category:categories(name)
        `)
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;
      return data as BillReminder[];
    },
  });
};

export const useCreateBillReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateBillReminderData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data: result, error } = await (supabase as any)
        .from('bill_reminders')
        .insert({
          ...data,
          user_id: user.id,
          reminder_days_before: data.reminder_days_before || 3,
        })
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
      toast({
        title: "Bill reminder created",
        description: "Your bill reminder has been set up successfully.",
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

export const useUpdateBillReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateBillReminderData> }) => {
      const { data: result, error } = await (supabase as any)
        .from('bill_reminders')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
      toast({
        title: "Bill reminder updated",
        description: "Your bill reminder has been updated successfully.",
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

export const useDeleteBillReminder = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('bill_reminders')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bill-reminders'] });
      toast({
        title: "Bill reminder deleted",
        description: "Your bill reminder has been deleted successfully.",
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