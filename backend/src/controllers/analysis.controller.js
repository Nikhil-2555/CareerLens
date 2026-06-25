const Analysis = require('../models/Analysis');
const Resume = require('../models/Resume');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const { analyzeResume } = require('../services/ai.service');

/**
 * POST /api/v1/analyses
 * Run AI analysis on a resume against a job description.
 */
const createAnalysis = asyncHandler(async (req, res) => {
  const { resumeId, jobDescription, jobTitle, company } = req.body;

  if (!resumeId || !jobDescription) {
    throw ApiError.badRequest('resumeId and jobDescription are required');
  }

  // Fetch resume
  const resume = await Resume.findOne({ _id: resumeId, userId: req.user.id });
  if (!resume) throw ApiError.notFound('Resume not found');

  // Run AI analysis
  const result = await analyzeResume(resume.extractedText, jobDescription);

  // Save analysis
  const analysis = await Analysis.create({
    userId: req.user.id,
    resumeId,
    jobDescription,
    jobTitle: jobTitle || '',
    company: company || '',
    score: result.score,
    atsScore: result.atsScore,
    badFormatting: result.badFormatting,
    atsRecommendations: result.atsRecommendations,
    strengths: result.strengths,
    gaps: result.gaps,
    matchedKeywords: result.matchedKeywords,
    missingKeywords: result.missingKeywords,
    suggestions: result.suggestions,
  });

  res.status(201).json({ success: true, data: analysis });
});

/**
 * GET /api/v1/analyses
 */
const getAnalyses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  const skip = (page - 1) * limit;

  const [analyses, total] = await Promise.all([
    Analysis.find({ userId: req.user.id })
      .select('-rawAiResponse -jobDescription')
      .sort('-createdAt')
      .skip(skip)
      .limit(Number(limit))
      .populate('resumeId', 'fileName'),
    Analysis.countDocuments({ userId: req.user.id }),
  ]);

  res.json({
    success: true,
    data: analyses,
    pagination: { page: Number(page), limit: Number(limit), total, pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/v1/analyses/:id
 */
const getAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOne({ _id: req.params.id, userId: req.user.id })
    .populate('resumeId', 'fileName fileType');
  if (!analysis) throw ApiError.notFound('Analysis not found');
  res.json({ success: true, data: analysis });
});

/**
 * DELETE /api/v1/analyses/:id
 */
const deleteAnalysis = asyncHandler(async (req, res) => {
  const analysis = await Analysis.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
  if (!analysis) throw ApiError.notFound('Analysis not found');
  res.json({ success: true, message: 'Analysis deleted' });
});

/**
 * POST /api/v1/analyses/analyze-direct
 * Run AI analysis from raw resume text + JD (no resumeId needed).
 */
const analyzeDirect = asyncHandler(async (req, res) => {
  const { resumeText, jobDescription, jobTitle, company } = req.body;

  if (!resumeText || !jobDescription) {
    throw ApiError.badRequest('resumeText and jobDescription are required');
  }

  if (resumeText.trim().length < 50) {
    throw ApiError.badRequest('Resume text is too short. Please provide a complete resume.');
  }

  // Run AI analysis
  const result = await analyzeResume(resumeText, jobDescription);

  res.status(200).json({
    success: true,
    data: {
      score: result.score,
      atsScore: result.atsScore,
      badFormatting: result.badFormatting,
      atsRecommendations: result.atsRecommendations,
      strengths: result.strengths,
      gaps: result.gaps,
      matchedKeywords: result.matchedKeywords,
      missingKeywords: result.missingKeywords,
      suggestions: result.suggestions,
      jobTitle: jobTitle || '',
      company: company || '',
    },
  });
});

/**
 * POST /api/v1/analyses/optimize
 * Optimize resume text directly based on a job description.
 */
const optimize = asyncHandler(async (req, res) => {
  const { resumeText, jobDescription } = req.body;

  if (!resumeText || !jobDescription) {
    throw ApiError.badRequest('resumeText and jobDescription are required');
  }

  const result = await require('../services/ai.service').optimizeResume(resumeText, jobDescription);

  res.status(200).json({
    success: true,
    data: result
  });
});

/**
 * POST /api/v1/analyses/match-jobs
 * Suggest best-fit job roles based on a resume.
 */
const matchJobs = asyncHandler(async (req, res) => {
  const { resumeText } = req.body;
  if (!resumeText) throw ApiError.badRequest('resumeText is required');

  const result = await require('../services/ai.service').matchJobs(resumeText);
  res.status(200).json({ success: true, data: result });
});

/**
 * POST /api/v1/analyses/send-email
 * Send the 1-page optimized resume to the user's email address.
 */
const sendEmail = asyncHandler(async (req, res) => {
  const { email, templateName, resumeHTML } = req.body;
  if (!email || !resumeHTML) {
    throw ApiError.badRequest('email and resumeHTML are required');
  }

  // ─── OPTION 1: Resend API Dispatch (if configured in .env) ───
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY !== 're_xxxxxxxxx') {
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);
    
    const { data, error } = await resend.emails.send({
      from: process.env.FROM_EMAIL || 'onboarding@resend.dev',
      to: email,
      subject: `Your 1-Page AI Optimized CV (${templateName || 'Modern Aesthetic'})`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #1e293b; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
          <h2 style="color: #6c5ce7; margin-top: 0;">Hello World! Your AI-Boosted Resume is Ready! 🚀</h2>
          <p>Congrats on sending your <strong>first email</strong>!</p>
          <p>Your resume has been successfully evaluated and rewritten by <strong>CareerLens AI</strong> for 95%+ ATS compatibility using the <strong>${templateName || 'Modern'}</strong> layout.</p>
          <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #cbd5e1; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
            ${resumeHTML}
          </div>
          <p style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 0;">
            Powered by Resend API · CareerLens AI Platform
          </p>
        </div>
      `
    });

    if (error) {
      console.error('❌ [Resend Dispatch Failed]:', error);
      throw ApiError.badRequest(`Resend Error: ${error.message}`);
    }
    
    console.log(`📧 [Resend API Email Dispatched Successfully] ID:`, data?.id);
    return res.status(200).json({
      success: true,
      message: `Resume successfully dispatched via Resend API to ${email}`,
      previewUrl: null,
      deliveredAt: new Date().toISOString()
    });
  }

  // ─── OPTION 2: Nodemailer / Ethereal Fallback (when API key is still re_xxxxxxxxx) ───
  const nodemailer = require('nodemailer');
  let transporter;
  let previewUrl = null;

  if (process.env.SMTP_HOST && process.env.SMTP_USER) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
    });
  } else {
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: { user: testAccount.user, pass: testAccount.pass }
    });
    console.log(`📧 [Ethereal Test SMTP Created] User: ${testAccount.user}`);
  }

  const info = await transporter.sendMail({
    from: process.env.FROM_EMAIL || '"CareerLens AI Screening Coach" <no-reply@careerlens.ai>',
    to: email,
    subject: `Your 1-Page AI Optimized CV (${templateName || 'Modern Aesthetic'})`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; color: #1e293b; background: #f8fafc; border-radius: 12px; border: 1px solid #e2e8f0;">
        <h2 style="color: #6c5ce7; margin-top: 0;">Your AI-Boosted Resume is Ready! 🚀</h2>
        <p>Hello,</p>
        <p>Your resume has been successfully evaluated and rewritten by <strong>CareerLens AI</strong> for 95%+ ATS compatibility using the <strong>${templateName || 'Modern'}</strong> layout.</p>
        <div style="background: white; padding: 24px; border-radius: 8px; border: 1px solid #cbd5e1; margin: 20px 0; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          ${resumeHTML}
        </div>
        <p style="font-size: 12px; color: #64748b; text-align: center; margin-bottom: 0;">
          CareerLens AI Platform · Enterprise 1-Page ATS Parsing
        </p>
      </div>
    `
  });

  if (!process.env.SMTP_HOST) {
    previewUrl = nodemailer.getTestMessageUrl(info);
    console.log(`🔗 [Live Email Server Preview URL]: ${previewUrl}`);
  }

  res.status(200).json({
    success: true,
    message: `Resume successfully dispatched to ${email}`,
    previewUrl,
    deliveredAt: new Date().toISOString()
  });
});

module.exports = { createAnalysis, analyzeDirect, getAnalyses, getAnalysis, deleteAnalysis, optimize, matchJobs, sendEmail };
