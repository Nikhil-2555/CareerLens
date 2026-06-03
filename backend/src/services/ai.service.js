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
You MUST output ONLY a valid JSON object. Do not include any explanations, markdown formatting, or \`\`\`json wrappers.
The JSON object MUST match this exact structure:
{
  "score": <number between 0 and 100>,
  "atsScore": <number between 0 and 100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "gaps": ["<gap 1>", "<gap 2>"],
  "matchedKeywords": ["<keyword 1>"],
  "missingKeywords": ["<keyword 1>"],
  "suggestions": ["<suggestion 1>"],
  "badFormatting": ["<issue 1>"],
  "atsRecommendations": ["<fix 1>"]
}`;

  const userPrompt = `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nAnalyze the resume against the job description and output ONLY valid JSON.`;

  try {
    const content = await callGroqAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], "json_object");

    const result = JSON.parse(content);
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
4. Output the fully optimized resume as a highly professional HTML layout. Use clean inline CSS. Include a sleek header for the candidate's name/contact. Ensure clear section dividers (border-bottom), distinct date alignments, and polished spacing. Make it look like a premium ATS-friendly modern resume.
5. Provide a realistic 'newScore' (0-100) reflecting how well this new resume matches the JD (should be 90+).

You MUST output ONLY a valid JSON object. Do not include any explanations, markdown formatting, or \`\`\`json wrappers.
The JSON object MUST match this exact structure:
{
  "optimizedResumeHTML": "<the full HTML styled resume>",
  "newScore": <number between 90 and 100>,
  "bulletDiffs": [
    {
      "before": "<original weak bullet point or section>",
      "after": "<rewritten high-impact bullet point or section>"
    }
  ]
}`;

  const userPrompt = `Job Description:\n${jobDescription}\n\nResume:\n${resumeText}\n\nOptimize the resume and output ONLY valid JSON.`;

  try {
    const content = await callGroqAPI([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt }
    ], "json_object");

    const result = JSON.parse(content);
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
    
    return JSON.parse(content);
  } catch (error) {
    logger.error('Failed to match jobs via AI', error);
    throw error;
  }
};

module.exports = { analyzeResume, generateCoverLetter, optimizeResume, matchJobs };
