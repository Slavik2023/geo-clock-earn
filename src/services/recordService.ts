
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type Record = {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  amount?: number;
  record_date?: string;
  created_at?: string;
  updated_at?: string;
};

export type RecordInput = Omit<Record, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export async function fetchRecords() {
  try {
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching records:", error);
      toast.error("Failed to load records");
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Unexpected error fetching records:", error);
    throw error;
  }
}

export async function fetchUserRegistrationRecords() {
  try {
    console.log("Fetching user registration records");
    const { data, error } = await supabase
      .from('records')
      .select('*')
      .ilike('title', '%User Registration%')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching user registration records:", error);
      toast.error("Failed to load user registration records");
      throw error;
    }

    console.log("Registration records retrieved:", data);
    return data as Record[] || [];
  } catch (error) {
    console.error("Unexpected error fetching registration records:", error);
    throw error;
  }
}

export async function createRecord(record: RecordInput) {
  try {
    // Get the current user's ID
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      console.log("Creating record as system user");
      // Create the record with a system user ID for cases like registration records
      const { data, error } = await supabase
        .from('records')
        .insert({ ...record, user_id: '00000000-0000-0000-0000-000000000000' })
        .select()
        .single();

      if (error) {
        console.error("Error creating record:", error);
        toast.error("Failed to create record");
        throw error;
      }

      console.log("Record created successfully:", data);
      return data as Record;
    }

    // Insert the record with the user_id included
    console.log("Creating record for user:", user.id);
    const { data, error } = await supabase
      .from('records')
      .insert({ ...record, user_id: user.id })
      .select()
      .single();

    if (error) {
      console.error("Error creating record:", error);
      toast.error("Failed to create record");
      throw error;
    }

    toast.success("Record created successfully");
    return data as Record;
  } catch (error) {
    console.error("Unexpected error creating record:", error);
    throw error;
  }
}

export async function updateRecord(id: string, record: Partial<RecordInput>) {
  try {
    const { data, error } = await supabase
      .from('records')
      .update(record)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating record:", error);
      toast.error("Failed to update record");
      throw error;
    }

    toast.success("Record updated successfully");
    return data as Record;
  } catch (error) {
    console.error("Unexpected error updating record:", error);
    throw error;
  }
}

export async function deleteRecord(id: string) {
  try {
    const { error } = await supabase
      .from('records')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting record:", error);
      toast.error("Failed to delete record");
      throw error;
    }

    toast.success("Record deleted successfully");
    return true;
  } catch (error) {
    console.error("Unexpected error deleting record:", error);
    throw error;
  }
}
