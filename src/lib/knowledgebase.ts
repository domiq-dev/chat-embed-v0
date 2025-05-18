// lib/openai-knowledgebase.ts
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

// Add the missing function
export async function getKnowledgebaseText(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('content')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Extract content from all knowledge items
    return data?.map(item => item.content) || [];
  } catch (error) {
    console.error('Error retrieving knowledge base text:', error);
    return [];
  }
}

// Function to generate embeddings using OpenAI
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Clean and prepare text
    const cleanedText = text
      .trim()
      .replace(/\s+/g, ' ')
      .slice(0, 8000); // OpenAI has token limits

    const response = await openai.embeddings.create({
      model: "text-embedding-ada-002",
      input: cleanedText,
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw error;
  }
}

// Function to query the knowledge base
export async function queryKnowledge(query: string, limit: number = 5): Promise<any[]> {
  try {
    // Generate embedding for the query
    const embedding = await generateEmbedding(query);

    // Search for similar content
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: embedding,
      match_threshold: 0.7,
      match_count: limit
    });

    if (error) {
      console.error('Error querying knowledge:', error);

      // Fallback to text search if vector search fails
      try {
        const { data: textData, error: textError } = await supabase
          .from('knowledge_items')
          .select('*')
          .textSearch('content', query.toLowerCase())
          .limit(limit);

        if (textError) throw textError;
        return textData || [];
      } catch (fallbackError) {
        console.error('Fallback text search failed:', fallbackError);
        throw error; // Throw the original error
      }
    }

    return data || [];
  } catch (error) {
    console.error('Error in queryKnowledge:', error);
    throw error;
  }
}

// Function for text-based search as fallback
export async function textSearch(query: string, limit: number = 5): Promise<any[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('*')
      .textSearch('content', query.toLowerCase())
      .limit(limit);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error in textSearch:', error);
    throw error;
  }
}