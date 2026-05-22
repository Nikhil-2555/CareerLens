const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const ApiError = require('../utils/ApiError');
const logger = require('../utils/logger');

/**
 * Extract text from uploaded file buffer based on MIME type.
 */
const extractText = async (buffer, mimetype, filename) => {
  try {
    let text = '';

    switch (mimetype) {
      case 'application/pdf': {
        const pdfData = await pdfParse(buffer);
        text = pdfData.text;
        break;
      }
      case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
        const result = await mammoth.extractRawText({ buffer });
        text = result.value;
        break;
      }
      case 'text/plain': {
        text = buffer.toString('utf-8');
        break;
      }
      default:
        throw ApiError.badRequest(`Unsupported file type: ${mimetype}`);
    }

    if (!text || text.trim().length < 50) {
      throw ApiError.badRequest('Could not extract meaningful text from the file. Please upload a different resume.');
    }

    logger.info(`Text extracted from ${filename}: ${text.length} chars`);
    return text.trim();
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.error('Text extraction failed:', error);
    throw ApiError.internal('Failed to extract text from file');
  }
};

module.exports = { extractText };
