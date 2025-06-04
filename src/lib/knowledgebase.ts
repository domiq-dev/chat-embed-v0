// lib/openai-knowledgebase.ts
import { OpenAI } from 'openai';
import { supabase } from './supabaseClient';

// Initialize OpenAI client during request
const getOpenAIClient = () => {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OpenAI API key is missing');
  }
  return new OpenAI({ apiKey });
};

// Add the missing function
export async function getKnowledgebaseText(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('knowledge_items')
      .select('content')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Extract content from all knowledge items
    return data?.map((item) => item.content) || [];
  } catch (error) {
    console.error('Error retrieving knowledge base text:', error);
    return [];
  }
}

// Function to generate embeddings using OpenAI
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    // Clean and prepare text
    const cleanedText = text.trim().replace(/\s+/g, ' ').slice(0, 8000); // OpenAI has token limits

    const openai = getOpenAIClient();
    const response = await openai.embeddings.create({
      model: 'text-embedding-ada-002',
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
      match_count: limit,
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
