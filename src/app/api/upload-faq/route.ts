// // At the top of your file to ensure Node.js runtime
// export const runtime = 'nodejs';
//
// import { NextRequest, NextResponse } from 'next/server';
// import { setKnowledgebaseText } from '@/lib/knowledgebase';
// import { extractTextFromPDF } from '@/lib/pdf-extract';
//
// export async function POST(req: NextRequest) {
//   try {
//     const formData = await req.formData();
//     const file = formData.get('file') as File;
//
//     if (!file) {
//       return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
//     }
//
//     const arrayBuffer = await file.arrayBuffer();
//     // @ts-ignore: Buffer is available in Node.js runtime
//     const buffer = Buffer.from(arrayBuffer);
//
//     if (file.type === 'application/pdf') {
//       const text = await extractTextFromPDF(buffer);
//       await setKnowledgebaseText(text);
//     } else if (file.type === 'text/plain') {
//       await setKnowledgebaseText(buffer.toString('utf-8'));
//     } else {
//       return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
//     }
//
//     ;
//     return NextResponse.json({ status: 'uploaded' });
//   } catch (error) {
//     console.error('Upload error:', error);
//     return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
//   }
// }
// app/api/upload-knowledge/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';
import pdfParse from 'pdf-parse';

// Explicitly set Node.js runtime
export const runtime = 'nodejs';

async function generateEmbedding(text: string): Promise<number[]> {
  const cleanedText = text
    .trim()
    .replace(/\s+/g, ' ')
    .slice(0, 8000);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.embeddings.create({
    model: "text-embedding-ada-002",
    input: cleanedText,
  });

  return response.data[0].embedding;
}

export async function POST(req: NextRequest) {
  try {
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration is missing');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Process file based on type
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let content = '';
    if (file.type === 'application/pdf') {
      const data = await pdfParse(buffer);
      content = data.text;
    } else if (file.type === 'text/plain') {
      content = buffer.toString('utf-8');
    } else {
      return NextResponse.json({ error: 'Unsupported file type' }, { status: 400 });
    }

    // Generate embedding
    const embedding = await generateEmbedding(content);

    // Store in database
    const { data, error } = await supabase
      .from('knowledge_items')
      .insert({
        content,
        metadata: {
          filename: file.name,
          fileType: file.type,
          fileSize: file.size,
          uploadDate: new Date().toISOString()
        },
        embedding
      })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('Error processing file:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}