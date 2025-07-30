import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export type Household = {
  id: string;
  name: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type HouseholdMember = {
  id: string;
  household_id: string;
  user_id: string;
  role: 'owner' | 'member';
  invited_by: string | null;
  joined_at: string;
};

export type CreateHouseholdData = {
  name: string;
};

export type InviteMemberData = {
  household_id: string;
  user_email: string;
};

export const useHouseholds = () => {
  return useQuery({
    queryKey: ['households'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('households')
        .select(`
          *,
          household_members!inner(*)
        `)
        .eq('household_members.user_id', user.id);

      if (error) throw error;
      return data as Household[];
    },
  });
};

export const useHouseholdMembers = (householdId: string) => {
  return useQuery({
    queryKey: ['household-members', householdId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('household_members')
        .select('*')
        .eq('household_id', householdId);

      if (error) throw error;
      return data as HouseholdMember[];
    },
    enabled: !!householdId,
  });
};

export const useCreateHousehold = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: CreateHouseholdData) => {
      const { data: { user } } = await supabase.auth.getUser();
      console.log('Auth user from supabase.auth.getUser():', user);
      
      if (!user) throw new Error('User not authenticated');

      console.log('Creating household with user ID:', user.id);
      
      // Create household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: data.name,
          created_by: user.id,
        })
        .select()
        .single();

      if (householdError) throw householdError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: user.id,
          role: 'owner',
        });

      if (memberError) throw memberError;

      return household;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['households'] });
      toast({
        title: "Household created",
        description: "Your household has been created successfully.",
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

export const useInviteMember = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (data: InviteMemberData) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Find user by email
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', data.user_email); // This would need to be updated to search by email

      if (profileError) throw profileError;
      if (!profiles || profiles.length === 0) {
        throw new Error('User not found');
      }

      // Add member to household
      const { error } = await supabase
        .from('household_members')
        .insert({
          household_id: data.household_id,
          user_id: profiles[0].user_id,
          role: 'member',
          invited_by: user.id,
        });

      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['household-members', variables.household_id] });
      toast({
        title: "Member invited",
        description: "The user has been added to your household.",
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