/**
 * Database seed script.
 * Creates a test user + sample data for development.
 * Usage: node src/scripts/seed.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Resume = require('../models/Resume');
const Analysis = require('../models/Analysis');
const CoverLetter = require('../models/CoverLetter');
const Application = require('../models/Application');
const logger = require('../utils/logger');

const sampleResume = `John Doe
Senior Software Engineer | john.doe@gmail.com | (555) 123-4567

SUMMARY
Experienced software engineer with 5+ years of expertise in React, Node.js, TypeScript, and cloud platforms. Passionate about building high-performance web applications with excellent user experiences.

EXPERIENCE
Senior Frontend Engineer — TechCorp Inc. (2021 - Present)
• Led a team of 4 developers redesigning the flagship dashboard, improving load times by 40%
• Migrated legacy jQuery codebase to React, reducing bundle size by 60%
• Implemented CI/CD pipelines using GitHub Actions and Docker
• Technologies: React, TypeScript, Node.js, AWS, Docker, PostgreSQL

Full Stack Developer — StartupXYZ (2019 - 2021)
• Built RESTful APIs serving 50K+ daily active users
• Designed MongoDB schemas for user analytics platform
• Technologies: JavaScript, Express, MongoDB, Redis, GraphQL

EDUCATION
B.S. Computer Science — State University (2019)

SKILLS
JavaScript, TypeScript, React, Node.js, Express, MongoDB, PostgreSQL, AWS, Docker, Git, CI/CD, Agile, Leadership`;

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    logger.info('Connected to MongoDB for seeding...');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Resume.deleteMany({}),
      Analysis.deleteMany({}),
      CoverLetter.deleteMany({}),
      Application.deleteMany({}),
    ]);
    logger.info('Cleared existing data');

    // Create test user
    const user = await User.create({
      email: 'john.doe@gmail.com',
      password: 'password123',
      name: 'John Doe',
      avatar: '',
      provider: 'local',
    });
    logger.info(`Created user: ${user.email}`);

    // Create resume
    const resume = await Resume.create({
      userId: user._id,
      fileName: 'John_Doe_Resume.pdf',
      fileType: 'pdf',
      fileSize: 145000,
      extractedText: sampleResume,
      isDefault: true,
    });
    logger.info('Created sample resume');

    // Create analyses
    const analyses = await Analysis.insertMany([
      {
        userId: user._id, resumeId: resume._id,
        jobDescription: 'Senior Frontend Engineer at Google. Requirements: React, TypeScript, 5+ years experience, performance optimization, team leadership.',
        jobTitle: 'Senior Frontend Engineer', company: 'Google',
        score: 92, strengths: ['5+ years React experience', 'TypeScript expertise', 'Team leadership experience', 'Performance optimization track record'],
        gaps: ['No mention of Angular', 'Missing Web Components experience'], matchedKeywords: ['react', 'typescript', 'node', 'leadership', 'ci/cd', 'docker'],
        missingKeywords: ['angular', 'web components'],
      },
      {
        userId: user._id, resumeId: resume._id,
        jobDescription: 'Full Stack Developer at Stripe. Requirements: Node.js, React, PostgreSQL, payment systems, API design.',
        jobTitle: 'Full Stack Developer', company: 'Stripe',
        score: 85, strengths: ['Strong Node.js and Express experience', 'React frontend skills', 'API design experience'],
        gaps: ['No payment systems experience', 'No Stripe API knowledge'], matchedKeywords: ['javascript', 'react', 'node', 'express', 'postgresql', 'git'],
        missingKeywords: ['payment', 'stripe'],
      },
      {
        userId: user._id, resumeId: resume._id,
        jobDescription: 'UI Engineer at Netflix. Requirements: React, CSS animations, performance, streaming platforms.',
        jobTitle: 'UI Engineer', company: 'Netflix',
        score: 79, strengths: ['React expertise', 'Performance optimization'], gaps: ['No streaming platform experience', 'Missing CSS animation expertise'],
        matchedKeywords: ['react', 'javascript', 'css'], missingKeywords: ['streaming', 'animation'],
      },
    ]);
    logger.info(`Created ${analyses.length} analyses`);

    // Create applications
    const apps = [
      { company: 'Google', jobTitle: 'Senior Frontend Engineer', status: 'saved', fitScore: 92, tags: ['Remote'] },
      { company: 'Stripe', jobTitle: 'Full Stack Developer', status: 'saved', fitScore: 85, tags: ['Hybrid'] },
      { company: 'Vercel', jobTitle: 'React Developer', status: 'saved', fitScore: 88, tags: ['Remote'] },
      { company: 'Netflix', jobTitle: 'UI Engineer', status: 'applied', fitScore: 79, tags: ['On-site'], appliedAt: new Date() },
      { company: 'Shopify', jobTitle: 'Frontend Lead', status: 'applied', fitScore: 91, tags: ['Remote'], appliedAt: new Date() },
      { company: 'Figma', jobTitle: 'Design Engineer', status: 'applied', fitScore: 83, tags: ['Hybrid'], appliedAt: new Date() },
      { company: 'Meta', jobTitle: 'Software Engineer', status: 'interview', fitScore: 76, tags: ['On-site'], interviewAt: new Date(Date.now() + 86400000) },
      { company: 'Apple', jobTitle: 'Web Developer', status: 'interview', fitScore: 81, tags: ['On-site'], interviewAt: new Date(Date.now() + 172800000) },
      { company: 'GitHub', jobTitle: 'Staff Engineer', status: 'offer', fitScore: 95, tags: ['Remote'] },
      { company: 'Amazon', jobTitle: 'SDE II', status: 'rejected', fitScore: 62, tags: ['On-site'] },
    ];

    await Application.insertMany(apps.map(a => ({ ...a, userId: user._id, analysisId: analyses[0]._id })));
    logger.info(`Created ${apps.length} applications`);

    // Create cover letter
    await CoverLetter.create({
      userId: user._id,
      analysisId: analyses[0]._id,
      jobTitle: 'Senior Frontend Engineer',
      company: 'Google',
      content: 'Dear Hiring Manager,\n\nI am writing to express my strong interest in the Senior Frontend Engineer position at Google...',
      version: 1,
    });
    logger.info('Created sample cover letter');

    logger.info('✅ Seed completed successfully!');
    process.exit(0);
  } catch (error) {
    logger.error('Seed failed:', error);
    process.exit(1);
  }
}

seed();
