const logger = require('../utils/logger');

/**
 * Helper to call Groq API
 */
async function callGroqAPI(messages, responseFormat = null) {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set in environment variables');
  }

  const body = {
    model: "llama-3.3-70b-versatile",
    messages: messages,
    temperature: 0.7,
  };

  if (responseFormat) {
    body.response_format = { type: responseFormat };
  }

  const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.GROQ_API_KEY.trim()}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
  
  if (!response.ok) {
    const errorText = await response.text();
    logger.error("Groq API error:", errorText);
    
    // Try to parse JSON error message from Groq
    let errorMsg = `Groq API failed with status ${response.status}`;
    try {
      const parsed = JSON.parse(errorText);
      if (parsed.error && parsed.error.message) {
        errorMsg = parsed.error.message;
      }
    } catch (e) {
      errorMsg = errorText;
    }
    
    throw new Error(`Groq API Error: ${errorMsg}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
}

/**
 * Analyze resume text against job description.
 * Returns score, strengths, gaps, matched/missing keywords.
 */
const analyzeResume = async (resumeText, jobDescription) => {
  logger.info('Starting AI resume analysis with Groq...');

  const systemPrompt = `You are an expert ATS (Applicant Tracking System) and technical recruiter. 
You are evaluating a resume against a job description. 
Return the output ONLY as a valid JSON object matching this structure:
{
  "score": <number between 0 and 100>,
  "atsScore": <number between 0 and 100 representing ATS parsing compatibility based on format>,
  "strengths": [<array of 3-5 strings detailing strengths>],
  "gaps": [<array of 3-5 strings detailing weaknesses or missing skills>],
  "matchedKeywords": [<array of matched technical/soft skills>],
  "missingKeywords": [<array of missing technical/soft skills>],
  "suggestions": [<array of 3-5 actionable improvement suggestions>],
  "badFormatting": [<array of formatting issues like 'Tables', 'Multi-column layout'>],
  "atsRecommendations": [<array of fixes for format like 'Use simple layout'>]
}`;

  const userPrompt = `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nAnalyze the resume against the job description and output JSON.`;

  try {
    const content = await callGroqAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], "json_object");

    // Robust JSON parsing: clean markdown blocks if AI added them
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const result = JSON.parse(cleanContent);
    logger.info(`Analysis complete: Score ${result.score}/100`);
    return result;
  } catch (error) {
    logger.error('Failed to parse Groq response or call API, falling back to basic analysis', error);
    throw error;
  }
};

/**
 * Generate a cover letter based on resume and JD.
 */
const generateCoverLetter = async (resumeText, jobDescription, jobTitle = '', company = '') => {
  logger.info(`Generating cover letter for ${jobTitle} at ${company} using Groq...`);

  const systemPrompt = `You are an expert career coach writing a highly tailored, professional, and compelling cover letter.
The cover letter should be concise (3-4 paragraphs), engaging, and directly connect the candidate's experience in their resume to the requirements in the job description.
Do not include placeholder brackets like [Your Name] unless you don't have the information. If you don't know the name, just omit the sign-off name.
Return ONLY the cover letter text, no conversational filler.`;

  const userPrompt = `Target Role: ${jobTitle}
Target Company: ${company}

Job Description:
${jobDescription}

Candidate Resume:
${resumeText}

Write the cover letter.`;

  try {
    const content = await callGroqAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ]);

    logger.info('Cover letter generated successfully');
    return content;
  } catch (error) {
    logger.error('Failed to generate cover letter', error);
    throw error;
  }
};

/**
 * Optimize resume bullet points and format.
 * Returns the optimized full resume text and a list of bullet point diffs.
 */
const optimizeResume = async (resumeText, jobDescription) => {
  logger.info('Starting AI resume optimization using Groq...');

  const systemPrompt = `You are an expert career coach and professional resume writer.
You are optimizing a candidate's resume to match a specific Job Description.
Your task is to:
1. Identify weak bullet points in the resume and rewrite them to be high-impact, using strong action verbs and hypothetical quantifiable metrics/results (e.g. "Worked on backend APIs" -> "Designed and scaled robust REST APIs, reducing database query latencies by 30%").
2. Integrate missing critical keywords from the Job Description organically.
3. Clean up formatting issues.
4. Output the fully optimized resume in clean Markdown format.

Return the output ONLY as a valid JSON object matching this structure:
{
  "optimizedResume": "<the full optimized resume text in markdown format>",
  "bulletDiffs": [
    {
      "before": "<original weak bullet point or section>",
      "after": "<rewritten high-impact bullet point or section>"
    }
  ]
}`;

  const userPrompt = `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nOptimize the resume and output JSON.`;

  try {
    const content = await callGroqAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], "json_object");

    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) {
      cleanContent = cleanContent.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (cleanContent.startsWith("```")) {
      cleanContent = cleanContent.replace(/^```/, "").replace(/```$/, "").trim();
    }

    const result = JSON.parse(cleanContent);
    logger.info(`Optimization complete: Generated ${result.bulletDiffs?.length || 0} bullet improvements`);
    return result;
  } catch (error) {
    logger.error('Failed to optimize resume via AI', error);
    throw error;
  }
};

const matchJobs = async (resumeText) => {
  logger.info('Starting AI job matching using Groq...');
  const systemPrompt = `You are an expert technical recruiter and career counselor.
Analyze the provided resume and identify the top 3 to 5 job titles that best match the candidate's skills, experience, and trajectory.
For each job title, provide a realistic match score (0-100) representing how qualified they are for that role.
Also suggest a few keywords they should learn or add to strengthen their profile for that role.

Return the output ONLY as a valid JSON object matching this structure:
{
  "matches": [
    {
      "title": "<Job Title>",
      "matchScore": <Number>,
      "reason": "<One sentence explaining why they are a fit>",
      "recommendedKeywords": ["<Keyword 1>", "<Keyword 2>"]
    }
  ]
}`;

  const userPrompt = `Resume:\n${resumeText}\n\nSuggest matching jobs.`;

  try {
    const content = await callGroqAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], "json_object");
    
    let cleanContent = content.trim();
    if (cleanContent.startsWith("```json")) cleanContent = cleanContent.replace(/^```json/, "").replace(/```$/, "").trim();
    else if (cleanContent.startsWith("```")) cleanContent = cleanContent.replace(/^```/, "").replace(/```$/, "").trim();

    return JSON.parse(cleanContent);
  } catch (error) {
    logger.error('Failed to match jobs via AI', error);
    throw error;
  }
};

module.exports = { analyzeResume, generateCoverLetter, optimizeResume, matchJobs };
