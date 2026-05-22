const logger = require('../utils/logger');

/**
 * AI Analysis Service
 * Performs resume-to-JD matching analysis.
 * 
 * NOTE: This uses a smart mock implementation.
 * To use real OpenAI, set OPENAI_API_KEY in .env and uncomment the real implementation.
 */

/**
 * Analyze resume text against job description.
 * Returns score, strengths, gaps, matched/missing keywords.
 */
const analyzeResume = async (resumeText, jobDescription) => {
  logger.info('Starting AI resume analysis...');

  // Extract keywords from JD
  const jdKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  
  const matchedKeywords = jdKeywords.filter(kw => 
    resumeKeywords.some(rk => rk.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(rk.toLowerCase()))
  );
  const missingKeywords = jdKeywords.filter(kw => 
    !resumeKeywords.some(rk => rk.toLowerCase().includes(kw.toLowerCase()) || kw.toLowerCase().includes(rk.toLowerCase()))
  );

  // Calculate score based on keyword matching + length analysis
  const keywordScore = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) * 100 : 50;
  const lengthBonus = Math.min(resumeText.length / 2000, 1) * 10;
  const score = Math.min(Math.round(keywordScore * 0.85 + lengthBonus + Math.random() * 8), 100);

  // Generate strengths based on matched keywords
  const strengths = matchedKeywords.slice(0, 5).map(kw => 
    `Strong ${kw} experience aligns with job requirements`
  );
  if (resumeText.length > 1500) strengths.push('Comprehensive resume with detailed experience');
  if (resumeText.match(/\d+%|\d+x|\$\d+/)) strengths.push('Quantified achievements with metrics');

  // Generate gaps from missing keywords
  const gaps = missingKeywords.slice(0, 4).map(kw => 
    `No mention of ${kw} — consider adding relevant experience`
  );

  const suggestions = [
    'Add more quantified achievements with specific metrics',
    'Tailor your summary section to match the job description',
    'Include relevant certifications or training',
  ];

  logger.info(`Analysis complete: Score ${score}/100`);

  return {
    score,
    strengths,
    gaps,
    matchedKeywords: matchedKeywords.slice(0, 10),
    missingKeywords: missingKeywords.slice(0, 8),
    suggestions,
  };
};

/**
 * Generate a cover letter based on resume and JD.
 */
const generateCoverLetter = async (resumeText, jobDescription, jobTitle = '', company = '') => {
  logger.info(`Generating cover letter for ${jobTitle} at ${company}...`);

  const resumeKeywords = extractKeywords(resumeText).slice(0, 5);
  const skillsList = resumeKeywords.join(', ');

  const content = `Dear Hiring Manager,

I am writing to express my strong interest in the ${jobTitle || 'open'} position${company ? ` at ${company}` : ''}. With my background in ${skillsList}, I am confident in my ability to contribute meaningfully to your team and help drive impactful results.

In my previous roles, I have developed deep expertise in ${resumeKeywords.slice(0, 3).join(', ')}. I have consistently delivered high-quality work, collaborating with cross-functional teams to ship products that meet both technical requirements and business objectives. My experience aligns closely with the qualifications outlined in your job posting, and I am eager to bring this expertise to your organization.

I am particularly drawn to ${company || 'your company'}'s mission and the opportunity to work on challenging problems alongside a talented team. I would welcome the chance to discuss how my skills and experience can benefit your organization. Thank you for considering my application, and I look forward to hearing from you.

Sincerely,
[Your Name]`;

  logger.info('Cover letter generated successfully');
  return content;
};

/**
 * Extract relevant keywords from text using simple NLP.
 */
function extractKeywords(text) {
  const techKeywords = [
    'javascript', 'typescript', 'python', 'java', 'react', 'angular', 'vue', 'node',
    'express', 'mongodb', 'postgresql', 'mysql', 'aws', 'azure', 'gcp', 'docker',
    'kubernetes', 'ci/cd', 'git', 'agile', 'scrum', 'rest', 'graphql', 'redis',
    'terraform', 'linux', 'api', 'microservices', 'devops', 'machine learning',
    'data science', 'html', 'css', 'sass', 'tailwind', 'next.js', 'nest.js',
    'django', 'flask', 'spring', 'sql', 'nosql', 'elasticsearch', 'kafka',
    'rabbitmq', 'nginx', 'webpack', 'vite', 'figma', 'jira', 'confluence',
    'leadership', 'management', 'communication', 'problem-solving', 'teamwork',
    'project management', 'product management', 'data analysis', 'testing',
  ];

  const lowerText = text.toLowerCase();
  return techKeywords.filter(kw => lowerText.includes(kw));
}

module.exports = { analyzeResume, generateCoverLetter };
