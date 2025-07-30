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
      // Get the session instead of just the user to ensure we have the access token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log('Auth session from supabase.auth.getSession():', session);
      
      if (sessionError || !session?.user) {
        console.error('Session error:', sessionError);
        throw new Error('User not authenticated');
      }

      console.log('Creating household with user ID:', session.user.id);
      
      // Create household
      const { data: household, error: householdError } = await supabase
        .from('households')
        .insert({
          name: data.name,
          created_by: session.user.id,
        })
        .select()
        .single();

      console.log('Household creation result:', { household, householdError });

      if (householdError) throw householdError;

      // Add creator as owner
      const { error: memberError } = await supabase
        .from('household_members')
        .insert({
          household_id: household.id,
          user_id: session.user.id,
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
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('email', data.user_email)
        .maybeSingle(); // Use maybeSingle to avoid errors when no user found

      if (profileError) throw profileError;
      if (!profile) {
        throw new Error(`No user found with email ${data.user_email}. They need to sign up first.`);
      }

      // Add member to household
      const { error } = await supabase
        .from('household_members')
        .insert({
          household_id: data.household_id,
          user_id: profile.user_id,
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