import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { extractTextFromPDF } from '@/lib/pdf-parser';
import { analyzeMatch, MatchResult } from '@/lib/ai-service';
import { isRateLimited } from '@/lib/rate-limit';

export async function POST(request: Request) {
  try {
    // Basic Rate Limiting: 5 requests per hour per IP
    const headerPayload = await headers();
    const ip = headerPayload.get('x-forwarded-for') || 'anonymous';
    const limit = 5;
    const windowMs = 60 * 60 * 1000; // 1 hour

    const { limited, remaining, reset } = isRateLimited(ip, limit, windowMs);

    if (limited) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Please try again in an hour.',
          retryAfter: Math.ceil((reset - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': limit.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
            'Retry-After': Math.ceil((reset - Date.now()) / 1000).toString()
          }
        }
      );
    }
    const formData = await request.formData();
    
    const resumeFile = formData.get('resume') as File | null;
    const jobDescription = (formData.get('jobDescription') as string | null) || '';
    
    let resumeText = 'No resume provided (Mock Mode)';

    if (resumeFile && resumeFile.size > 0) {
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
      resumeText = parsedPDF.text || 'Empty PDF content';
    }
    
    // Analyze with selected AI Service (falls back to mock if no keys provided)
    const result: MatchResult = await analyzeMatch(
      resumeText,
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
