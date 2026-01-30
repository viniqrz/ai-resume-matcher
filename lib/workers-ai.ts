// Types for Workers AI response
export interface MatchResult {
  score: number;
  summary: string;
  strengths: string[];
  gaps: string[];
  suggestions: string[];
}

const CLOUDFLARE_API = 'https://api.cloudflare.com/client/v4/accounts';

export async function analyzeMatch(
  resumeText: string,
  jobText: string
): Promise<MatchResult> {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;

  if (!accountId || !apiToken) {
    throw new Error('Missing Cloudflare credentials. Please set CLOUDFLARE_ACCOUNT_ID and CLOUDFLARE_API_TOKEN environment variables.');
  }

  const response = await fetch(
    `${CLOUDFLARE_API}/${accountId}/ai/run/@cf/meta/llama-3.1-8b-instruct`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'system',
            content: `You are a professional resume matching expert. Your task is to compare a resume against a job description and provide a detailed analysis.

You MUST respond with ONLY valid JSON in this exact format, no other text:
{
  "score": <number between 0-100>,
  "summary": "<brief 1-2 sentence summary of the match>",
  "strengths": ["<strength 1>", "<strength 2>", ...],
  "gaps": ["<gap 1>", "<gap 2>", ...],
  "suggestions": ["<suggestion 1>", "<suggestion 2>", ...]
}

Be specific and actionable. Reference specific requirements from the job description and skills from the resume.`
          },
          {
            role: 'user',
            content: `Analyze how well this resume matches the job description.

=== RESUME ===
${resumeText}

=== JOB DESCRIPTION ===
${jobText}

Respond with ONLY the JSON object, no additional text.`
          }
        ],
        max_tokens: 1500
      })
    }
  );

  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`Cloudflare API error: ${response.status} - ${errorData}`);
  }

  const data = await response.json();
  
  if (!data.result?.response) {
    throw new Error('Invalid response from Cloudflare AI');
  }

  try {
    const jsonMatch = data.result.response.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in AI response');
    }
    const jsonString = jsonMatch[0];
    const result = JSON.parse(jsonString);
    
    return {
      score: typeof result.score === 'number' ? Math.min(100, Math.max(0, result.score)) : 50,
      summary: result.summary || 'Analysis completed.',
      strengths: Array.isArray(result.strengths) ? result.strengths : [],
      gaps: Array.isArray(result.gaps) ? result.gaps : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    };
  } catch (parseError) {
    console.error('Failed to parse AI response:', data.result.response);
    throw new Error('Failed to parse AI response. Please try again.');
  }
}
