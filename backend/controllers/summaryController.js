const Summary = require('../models/Summary');
const nlpEngine = require('../utils/nlpEngine');
const axios = require('axios');
const cheerio = require('cheerio');
const mammoth = require('mammoth');

/**
 * Scraping helper
 */
const scrapeUrl = async (url) => {
  try {
    const { data } = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5'
      },
      timeout: 10000
    });

    const $ = cheerio.load(data);

    // Extract Title
    let title = $('title').text() || $('h1').first().text() || 'Scraped Web Article';
    title = title.trim().replace(/\s+/g, ' ');

    // Clean DOM of elements that contain non-article data
    $('script, style, iframe, nav, footer, header, noscript, .nav, .footer, .header, .ad, .advertisement, svg').remove();

    // Collect meaningful text paragraphs
    const textBlocks = [];
    $('p, article, h1, h2, h3, h4').each((_, el) => {
      const text = $(el).text().trim();
      // Only include blocks with substance
      if (text.length > 30) {
        textBlocks.push(text);
      }
    });

    const pageText = textBlocks.join('\n\n');

    if (!pageText || pageText.trim().length < 150) {
      // Fallback: try taking general body text with basic cleanup
      const fallbackText = $('body').text().replace(/\s+/g, ' ').trim();
      if (fallbackText.length < 150) {
        throw new Error('Unable to extract sufficient readable article text from this URL.');
      }
      return { title, text: fallbackText };
    }

    return { title, text: pageText };
  } catch (error) {
    throw new Error(`Scraping failed: ${error.message}`);
  }
};

/**
 * File parsing helper
 */
const parseFile = async (file) => {
  if (!file) {
    throw new Error('No file uploaded');
  }

  const extension = file.originalname.split('.').pop().toLowerCase();
  let text = '';
  const title = file.originalname.substring(0, file.originalname.lastIndexOf('.')) || file.originalname;

  if (extension === 'txt') {
    text = file.buffer.toString('utf-8');
  } else if (extension === 'docx') {
    try {
      const parsed = await mammoth.extractRawText({ buffer: file.buffer });
      text = parsed.value;
      if (!text || text.trim().length === 0) {
        throw new Error('DOCX file appears to be empty');
      }
    } catch (docxErr) {
      throw new Error(`Failed to parse DOCX: ${docxErr.message}`);
    }
  } else {
    throw new Error('Unsupported file type. Only .txt and .docx are supported.');
  }

  return { title, text };
};

// @desc    Create a summary from paste, url, or file
// @route   POST /api/summaries
// @access  Private
const createSummary = async (req, res) => {
  const { inputType, text, url, summaryType, fileTitle } = req.body;
  let textToProcess = '';
  let originalTitle = 'Pasted Content';

  try {
    const typeOfSummary = summaryType || 'medium';

    if (inputType === 'text') {
      if (!text || text.trim().length < 50) {
        return res.status(400).json({ message: 'Pasted text must be at least 50 characters' });
      }
      textToProcess = text;
      originalTitle = text.trim().split('\n')[0].substring(0, 60) || 'Pasted Text';
    } else if (inputType === 'url') {
      if (!url) {
        return res.status(400).json({ message: 'URL is required' });
      }
      const scraped = await scrapeUrl(url);
      textToProcess = scraped.text;
      originalTitle = scraped.title;
    } else if (inputType === 'file') {
      if (!req.file) {
        return res.status(400).json({ message: 'File upload is required' });
      }
      const parsed = await parseFile(req.file);
      textToProcess = parsed.text;
      originalTitle = fileTitle || parsed.title;
    } else {
      return res.status(400).json({ message: 'Invalid inputType' });
    }

    if (textToProcess.trim().length < 50) {
      return res.status(400).json({ message: 'Content to summarize is too short. Min 50 characters.' });
    }

    // Process using our pure JS local NLP engine
    const nlpData = nlpEngine.processText(textToProcess, typeOfSummary);

    // Save to MongoDB
    const summary = await Summary.create({
      userId: req.user._id,
      originalText: textToProcess,
      originalTitle: originalTitle,
      generatedTitle: nlpData.generatedTitle,
      shortSummary: nlpData.shortSummary,
      detailedSummary: nlpData.detailedSummary,
      bulletPoints: nlpData.bulletPoints,
      executiveSummary: nlpData.executiveSummary,
      keywords: nlpData.keywords,
      readingTime: nlpData.readingTime,
      sentiment: nlpData.sentiment,
      sentimentScore: nlpData.sentimentScore,
      insights: nlpData.insights,
      inputType,
      summaryType: typeOfSummary
    });

    res.status(201).json(summary);
  } catch (error) {
    console.error('Create summary error:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user summary history
// @route   GET /api/summaries
// @access  Private
const getSummaries = async (req, res) => {
  const { search, favorite, inputType } = req.query;

  try {
    const query = { userId: req.user._id };

    if (search) {
      query.$or = [
        { originalTitle: { $regex: search, $options: 'i' } },
        { generatedTitle: { $regex: search, $options: 'i' } },
        { keywords: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    if (favorite === 'true') {
      query.isFavorite = true;
    }

    if (inputType) {
      query.inputType = inputType;
    }

    const summaries = await Summary.find(query).sort({ createdAt: -1 });
    res.json(summaries);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get summary by ID
// @route   GET /api/summaries/:id
// @access  Private
const getSummaryById = async (req, res) => {
  try {
    const summary = await Summary.findOne({ _id: req.params.id, userId: req.user._id });

    if (summary) {
      res.json(summary);
    } else {
      res.status(404).json({ message: 'Summary not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Toggle favorite summary status
// @route   PUT /api/summaries/:id/favorite
// @access  Private
const toggleFavoriteSummary = async (req, res) => {
  try {
    const summary = await Summary.findOne({ _id: req.params.id, userId: req.user._id });

    if (summary) {
      summary.isFavorite = !summary.isFavorite;
      const updated = await summary.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Summary not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Edit summary title
// @route   PUT /api/summaries/:id/title
// @access  Private
const editSummaryTitle = async (req, res) => {
  const { title } = req.body;
  if (!title || title.trim() === '') {
    return res.status(400).json({ message: 'Title is required' });
  }

  try {
    const summary = await Summary.findOne({ _id: req.params.id, userId: req.user._id });

    if (summary) {
      summary.generatedTitle = title;
      const updated = await summary.save();
      res.json(updated);
    } else {
      res.status(404).json({ message: 'Summary not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a summary
// @route   DELETE /api/summaries/:id
// @access  Private
const deleteSummary = async (req, res) => {
  try {
    const summary = await Summary.findOneAndDelete({ _id: req.params.id, userId: req.user._id });

    if (summary) {
      res.json({ message: 'Summary removed successfully' });
    } else {
      res.status(404).json({ message: 'Summary not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete all history
// @route   DELETE /api/summaries
// @access  Private
const clearSummaryHistory = async (req, res) => {
  try {
    await Summary.deleteMany({ userId: req.user._id });
    res.json({ message: 'Summary history cleared completely' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get dashboard analytics metrics
// @route   GET /api/summaries/analytics
// @access  Private
const getSummaryAnalytics = async (req, res) => {
  try {
    const summaries = await Summary.find({ userId: req.user._id });

    const totalSummaries = summaries.length;

    let totalReadingTimeSaved = 0;
    const inputTypeCounts = { text: 0, file: 0, url: 0 };
    const sentimentCounts = { Positive: 0, Negative: 0, Neutral: 0 };
    const summaryTypeCounts = { short: 0, medium: 0, detailed: 0, bullet: 0, executive: 0 };

    // Calculate distributions
    summaries.forEach(s => {
      // Approximate words: read time saved is readingTime minus estimated summary read time
      // Let's say a user saves ~80% of reading time per summary.
      // Average article takes 5-10 mins, summary takes 1 min.
      // We will count accumulated estimated reading time as total "time processed",
      // and we save ~80% of that time.
      const timeSaved = Math.max(1, Math.round(s.readingTime * 0.8));
      totalReadingTimeSaved += timeSaved;

      if (inputTypeCounts[s.inputType] !== undefined) {
        inputTypeCounts[s.inputType]++;
      }
      if (sentimentCounts[s.sentiment] !== undefined) {
        sentimentCounts[s.sentiment]++;
      }
      if (summaryTypeCounts[s.summaryType] !== undefined) {
        summaryTypeCounts[s.summaryType]++;
      }
    });

    // Get weekly aggregation (past 7 days activity)
    const weeklyActivity = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { weekday: 'short' });
      
      const count = summaries.filter(s => {
        const createdDate = new Date(s.createdAt);
        return createdDate.toDateString() === date.toDateString();
      }).length;

      weeklyActivity.push({ day: dateStr, count });
    }

    res.json({
      totalSummaries,
      totalReadingTimeSaved,
      inputTypeCounts,
      sentimentCounts,
      summaryTypeCounts,
      weeklyActivity,
      recentItems: summaries.slice(0, 5).map(s => ({
        _id: s._id,
        originalTitle: s.originalTitle,
        generatedTitle: s.generatedTitle,
        inputType: s.inputType,
        readingTime: s.readingTime,
        createdAt: s.createdAt
      }))
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createSummary,
  getSummaries,
  getSummaryById,
  toggleFavoriteSummary,
  editSummaryTitle,
  deleteSummary,
  clearSummaryHistory,
  getSummaryAnalytics
};
