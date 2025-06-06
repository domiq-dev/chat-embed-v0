// lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';
import type { SupabaseClient } from '@supabase/supabase-js';
import { ConversationState } from '@/app/api/agent/stateManager';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a dummy client if credentials are missing (during build)
const createDummyClient = () => {
  const dummyResponse = {
    data: null,
    error: new Error('Supabase not configured'),
  };
  const dummyPromise = Promise.resolve(dummyResponse);

  return {
    from: () => ({
      select: () => dummyPromise,
      insert: () => dummyPromise,
      update: () => dummyPromise,
      delete: () => dummyPromise,
      eq: () => ({ select: () => dummyPromise }),
    }),
  } as unknown as SupabaseClient;
};

// Export either real client or dummy client
export const supabase =
  supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : createDummyClient();

// Types for database - updated to match your actual schema
export interface UserData {
  id: string;
  full_name: string;
  preferred_name: string;
  apartment_size: string; // Changed from apt_size
  move_in_date: string;
  over_20: boolean | null; // Changed from age
  income_requirement: boolean | null; // Changed from income
  eviction_history: boolean | null; // Changed from eviction
  is_qualified: boolean;
  created_at: string;
  updated_at: string;
}

export interface ConversationData {
  id: string;
  user_id: string;
  messages: Array<{ role: string; content: string }>;
  faq_shown: boolean;
  booking_shown: boolean;
  conversation_state?: ConversationState; // ← Add this
  created_at: string;
  updated_at: string;
}

// User functions - updated to match schema
export async function getOrCreateUser(
  userId?: string,
): Promise<{ userData: UserData; isNew: boolean }> {
  if (userId) {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();

    if (!error && data) {
      return { userData: data, isNew: false };
    }
  }

  // Create new user with default values - updated field names
  const { data, error } = await supabase
    .from('users')
    .insert({
      full_name: '',
      preferred_name: '',
      apartment_size: '', // Changed from apt_size
      move_in_date: '',
      over_20: null, // Changed from age
      income_requirement: null, // Changed from income
      eviction_history: null, // Changed from eviction
      is_qualified: false,
    })
    .select()
    .single();

  if (error) throw error;
  return { userData: data, isNew: true };
}

// Helper function to convert between database and state
export async function userDataToState(userData: UserData): Promise<ConversationState> {
  const conversation = await getConversation(userData.id);

  return {
    basicInfo: {
      full_name: userData.full_name || '',
      preferred_name: userData.preferred_name || '',
      apt_size: userData.apartment_size || '', // Map from DB field to state field
      move_in_date: userData.move_in_date || '',
    },
    qualificationStatus: {
      age: userData.over_20, // Map from DB field to state field
      income: userData.income_requirement, // Map from DB field to state field
      eviction: userData.eviction_history, // Map from DB field to state field
    },
    shownFAQ: conversation?.faq_shown || false,
    shownBooking: conversation?.booking_shown || false,
    version: '2.0.0',
  };
}

// Update function to map between state and DB fields
export async function updateUser(userId: string, updates: any): Promise<UserData> {
  // Map from state field names to DB field names
  const dbUpdates: any = { ...updates };

  // Handle field name mapping
  if (updates.apt_size !== undefined) {
    dbUpdates.apartment_size = updates.apt_size;
    delete dbUpdates.apt_size;
  }

  if (updates.age !== undefined) {
    dbUpdates.over_20 = updates.age;
    delete dbUpdates.age;
  }

  if (updates.income !== undefined) {
    dbUpdates.income_requirement = updates.income;
    delete dbUpdates.income;
  }

  if (updates.eviction !== undefined) {
    dbUpdates.eviction_history = updates.eviction;
    delete dbUpdates.eviction;
  }

  const { data, error } = await supabase
    .from('users')
    .update({
      ...dbUpdates,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// Conversation functions remain the same
export async function saveMessage(
  userId: string,
  message: { role: string; content: string },
  faqShown?: boolean,
  bookingShown?: boolean,
): Promise<{ conversationId: string }> {
  // First check if user has a conversation
  const { data: existingConvo, error } = await supabase
    .from('conversations')
    .select('id, messages')
    .eq('user_id', userId)
    .single();

  if (!error && existingConvo) {
    // Update existing conversation
    const updatedMessages = [...(existingConvo.messages || []), message];

    const updates: any = {
      messages: updatedMessages,
      updated_at: new Date().toISOString(),
    };

    if (faqShown !== undefined) updates.faq_shown = faqShown;
    if (bookingShown !== undefined) updates.booking_shown = bookingShown;

    await supabase.from('conversations').update(updates).eq('id', existingConvo.id);

    return { conversationId: existingConvo.id };
  }

  // Create new conversation
  const { data, error: insertError } = await supabase
    .from('conversations')
    .insert({
      user_id: userId,
      messages: [message],
      faq_shown: !!faqShown,
      booking_shown: !!bookingShown,
    })
    .select('id')
    .single();

  if (insertError) throw insertError;
  return { conversationId: data.id };
}

export async function getConversation(userId: string): Promise<ConversationData | null> {
  const { data, error } = await supabase
    .from('conversations')
    .select('*') // make sure this includes `conversation_state`
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') return null;
  return data;
}
