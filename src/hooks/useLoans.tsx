import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Loan = {
  id: string;
  user_id: string;
  name: string;
  type: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  emi_amount: number;
  remaining_balance: number;
  start_date: string;
  next_emi_date: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type CreateLoanData = {
  name: string;
  type: string;
  principal_amount: number;
  interest_rate: number;
  tenure_months: number;
  start_date: string;
};

export type LoanPayment = {
  id: string;
  user_id: string;
  loan_id: string;
  amount: number;
  principal_component: number;
  interest_component: number;
  payment_date: string;
  status: string;
  created_at: string;
};

export type CreateLoanPaymentData = {
  loan_id: string;
  amount: number;
  payment_date: string;
};

// Calculate EMI using formula
const calculateEMI = (principal: number, rate: number, tenure: number): number => {
  const monthlyRate = rate / 100 / 12;
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, tenure)) / 
              (Math.pow(1 + monthlyRate, tenure) - 1);
  return Math.round(emi * 100) / 100;
};

export const useLoans = () => {
  return useQuery({
    queryKey: ['loans'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as Loan[];
    },
  });
};

export const useCreateLoan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (loanData: CreateLoanData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const emiAmount = calculateEMI(
        loanData.principal_amount, 
        loanData.interest_rate, 
        loanData.tenure_months
      );

      // Calculate next EMI date (start date + 1 month)
      const startDate = new Date(loanData.start_date);
      const nextEmiDate = new Date(startDate);
      nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);

      const { data, error } = await supabase
        .from('loans')
        .insert({
          ...loanData,
          user_id: user.id,
          emi_amount: emiAmount,
          remaining_balance: loanData.principal_amount,
          next_emi_date: nextEmiDate.toISOString().split('T')[0],
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: "Success",
        description: "Loan added successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to add loan",
      });
    },
  });
};

export const useUpdateLoan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, ...updateData }: Partial<Loan> & { id: string }) => {
      const { data, error } = await supabase
        .from('loans')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: "Success",
        description: "Loan updated successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update loan",
      });
    },
  });
};

export const useDeleteLoan = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('loans')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      toast({
        title: "Success",
        description: "Loan deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to delete loan",
      });
    },
  });
};

export const useLoanPayments = (loanId?: string) => {
  return useQuery({
    queryKey: ['loan-payments', loanId],
    queryFn: async () => {
      let query = supabase
        .from('loan_payments')
        .select('*')
        .order('payment_date', { ascending: false });

      if (loanId) {
        query = query.eq('loan_id', loanId);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as LoanPayment[];
    },
    enabled: !!loanId,
  });
};

export const useCreateLoanPayment = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (paymentData: CreateLoanPaymentData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Get loan details to calculate principal and interest components
      const { data: loan } = await supabase
        .from('loans')
        .select('*')
        .eq('id', paymentData.loan_id)
        .single();

      if (!loan) throw new Error('Loan not found');

      const monthlyRate = loan.interest_rate / 100 / 12;
      const interestComponent = loan.remaining_balance * monthlyRate;
      const principalComponent = paymentData.amount - interestComponent;

      const { data, error } = await supabase
        .from('loan_payments')
        .insert({
          ...paymentData,
          user_id: user.id,
          principal_component: Math.max(0, principalComponent),
          interest_component: Math.min(paymentData.amount, interestComponent),
          status: 'completed',
        })
        .select()
        .single();

      if (error) throw error;

      // Update loan's remaining balance and next EMI date
      const newBalance = Math.max(0, loan.remaining_balance - principalComponent);
      const nextEmiDate = new Date(loan.next_emi_date);
      nextEmiDate.setMonth(nextEmiDate.getMonth() + 1);

      await supabase
        .from('loans')
        .update({
          remaining_balance: newBalance,
          next_emi_date: nextEmiDate.toISOString().split('T')[0],
        })
        .eq('id', paymentData.loan_id);

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['loans'] });
      queryClient.invalidateQueries({ queryKey: ['loan-payments'] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to record payment",
      });
    },
  });
};