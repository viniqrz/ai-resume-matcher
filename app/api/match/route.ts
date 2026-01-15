import { NextResponse } from 'next/server';
import { extractTextFromPDF } from '@/lib/pdf-parser';
import { analyzeMatch, MatchResult } from '@/lib/workers-ai';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    
    const resumeFile = formData.get('resume') as File | null;
    const jobDescription = formData.get('jobDescription') as string | null;
    
    // Validate inputs
    if (!resumeFile) {
      return NextResponse.json(
        { error: 'Resume PDF is required' },
        { status: 400 }
      );
    }
    
    if (!jobDescription || jobDescription.trim().length < 50) {
      return NextResponse.json(
        { error: 'Job description must be at least 50 characters' },
        { status: 400 }
      );
    }
    
    // Validate PDF file type
    if (resumeFile.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are accepted' },
        { status: 400 }
      );
    }
    
    // Check file size (max 10MB)
    if (resumeFile.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size must be less than 10MB' },
        { status: 400 }
      );
    }
    
    // Extract text from resume PDF
    const resumeBuffer = Buffer.from(await resumeFile.arrayBuffer());
    const parsedPDF = await extractTextFromPDF(resumeBuffer);
    
    if (!parsedPDF.text || parsedPDF.text.length < 50) {
      return NextResponse.json(
        { error: 'Could not extract enough text from the PDF. Please ensure the PDF contains readable text.' },
        { status: 400 }
      );
    }
    
    // Analyze with Workers AI
    const result: MatchResult = await analyzeMatch(
      parsedPDF.text,
      jobDescription.trim()
    );
    
    return NextResponse.json(result);
    
  } catch (error) {
    console.error('Match API error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : 'An unexpected error occurred';
    
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
