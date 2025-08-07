import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type Category = {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'income' | 'expense';
  created_at: string;
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');

      if (error) throw error;
      
      // Ensure unique categories as safeguard
      const uniqueCategories = data?.filter((category, index, self) => 
        index === self.findIndex(c => c.name === category.name)
      ) || [];
      
      return uniqueCategories as Category[];
    },
  });
};