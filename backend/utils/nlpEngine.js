const STOPWORDS = new Set([
  'a', 'about', 'above', 'after', 'again', 'against', 'all', 'am', 'an', 'and', 'any', 'are', 'arent', 'as', 'at',
  'be', 'because', 'been', 'before', 'being', 'below', 'between', 'both', 'but', 'by', 'cant', 'cannot', 'could',
  'couldnt', 'did', 'didnt', 'do', 'does', 'doesnt', 'doing', 'dont', 'down', 'during', 'each', 'few', 'for', 'from',
  'further', 'had', 'hadnt', 'has', 'hasnt', 'have', 'havent', 'having', 'he', 'hed', 'hell', 'hes', 'her', 'here',
  'heres', 'hers', 'herself', 'him', 'himself', 'his', 'how', 'hows', 'i', 'id', 'ill', 'im', 'ive', 'if', 'in',
  'into', 'is', 'isnt', 'it', 'its', 'itself', 'lets', 'me', 'more', 'most', 'mustnt', 'my', 'myself', 'no', 'nor',
  'not', 'of', 'off', 'on', 'once', 'only', 'or', 'other', 'ought', 'our', 'ours', 'ourselves', 'out', 'over', 'own',
  'same', 'shant', 'she', 'shed', 'shell', 'shes', 'should', 'shouldnt', 'so', 'some', 'such', 'than', 'that', 'thats',
  'the', 'their', 'theirs', 'them', 'themselves', 'then', 'there', 'theres', 'these', 'they', 'theyd', 'theyll',
  'theyre', 'theyve', 'this', 'those', 'through', 'to', 'too', 'under', 'until', 'up', 'very', 'was', 'wasnt', 'we',
  'wed', 'well', 'were', 'weve', 'werent', 'what', 'whats', 'when', 'whens', 'where', 'wheres', 'which', 'while',
  'who', 'whos', 'whom', 'why', 'whys', 'with', 'wont', 'would', 'wouldnt', 'you', 'youd', 'youll', 'youre', 'youve',
  'your', 'yours', 'yourself', 'yourselves', 'the', 'will', 'also', 'one', 'two', 'three', 'can', 'may', 'should'
]);

const SENTIMENT_DICT = {
  // Positive words
  'good': 2, 'great': 3, 'excellent': 4, 'amazing': 4, 'wonderful': 4, 'beautiful': 3, 'love': 3, 'like': 1,
  'happy': 3, 'glad': 2, 'pleased': 2, 'satisfy': 2, 'satisfied': 2, 'satisfying': 3, 'delight': 3, 'delighted': 3,
  'perfect': 4, 'awesome': 4, 'fantastic': 4, 'superb': 4, 'outstanding': 4, 'creative': 2, 'innovative': 3,
  'smart': 2, 'intelligent': 2, 'brilliant': 4, 'wise': 2, 'helpful': 2, 'valuable': 3, 'useful': 2, 'efficient': 2,
  'effective': 2, 'productive': 2, 'success': 3, 'successful': 3, 'successfully': 2, 'achieve': 2, 'achievement': 3,
  'win': 2, 'winner': 3, 'progress': 2, 'improve': 2, 'improvement': 3, 'benefit': 2, 'beneficial': 3, 'advantage': 2,
  'gain': 1, 'growth': 2, 'optimistic': 3, 'hope': 2, 'hopeful': 2, 'confidence': 3, 'confident': 3, 'safe': 2,
  'secure': 2, 'stability': 2, 'stable': 2, 'strong': 2, 'strength': 2, 'power': 2, 'powerful': 3, 'healthy': 2,
  'clean': 2, 'pure': 2, 'honest': 2, 'trust': 2, 'trustworthy': 3, 'support': 2, 'supportive': 2, 'kind': 2,
  'friendly': 2, 'warm': 1, 'peace': 2, 'peaceful': 2, 'calm': 2, 'relax': 2, 'relaxed': 2, 'exciting': 3,
  'excited': 3, 'fun': 2, 'enjoy': 2, 'enjoyable': 2, 'worth': 2, 'worthy': 2, 'recommend': 2, 'satisfactorily': 2,
  'breakthrough': 4, 'revolution': 3, 'revolutionary': 4, 'pioneer': 3, 'visionary': 4, 'future': 1, 'modern': 1,
  // Negative words
  'bad': -2, 'worst': -4, 'terrible': -3, 'awful': -3, 'horrible': -3, 'hate': -3, 'dislike': -1, 'sad': -2,
  'unhappy': -2, 'angry': -3, 'annoyed': -2, 'frustrated': -2, 'disappointed': -2, 'disappointment': -3,
  'fail': -2, 'failure': -3, 'failed': -2, 'lose': -2, 'loser': -3, 'lost': -2, 'wrong': -2, 'error': -2,
  'mistake': -2, 'fault': -2, 'defect': -2, 'broken': -2, 'damage': -2, 'damaged': -2, 'destroy': -3,
  'destruction': -3, 'harm': -2, 'harmful': -3, 'hurt': -2, 'pain': -2, 'painful': -3, 'suffer': -2, 'suffering': -3,
  'worry': -2, 'anxious': -2, 'anxiety': -3, 'fear': -2, 'fearful': -3, 'danger': -2, 'dangerous': -3, 'threat': -3,
  'threaten': -3, 'weak': -2, 'weakness': -2, 'poor': -2, 'poverty': -3, 'sick': -2, 'ill': -2, 'illness': -3,
  'dirty': -2, 'ugly': -2, 'liar': -3, 'lie': -2, 'betray': -3, 'cruel': -3, 'mean': -1, 'rude': -2, 'hate': -3,
  'conflict': -2, 'war': -4, 'fight': -2, 'violent': -3, 'violence': -4, 'crime': -3, 'criminal': -3,
  'scam': -3, 'fraud': -3, 'fake': -2, 'illegal': -3, 'risk': -2, 'risky': -3, 'uncertain': -2, 'difficult': -2,
  'difficulty': -2, 'hard': -1, 'problem': -2, 'trouble': -2, 'crisis': -3, 'disaster': -4, 'catastrophe': -4,
  'tragedy': -4, 'stress': -2, 'depressed': -3, 'depression': -3, 'expensive': -1, 'waste': -2, 'useless': -2,
  'boring': -2, 'tired': -2, 'exhausted': -2, 'guilty': -2, 'shame': -2, 'lonely': -2, 'abandoned': -2,
  'critical': -1, 'criticize': -2, 'criticism': -2, 'blame': -2, 'accuse': -2, 'reject': -2, 'rejection': -2
};

/**
 * Split text into sentences using regex.
 */
function splitIntoSentences(text) {
  if (!text) return [];
  // Split on punctuation followed by space and capital letter, or end of text.
  // Handles decimal points and abbreviations roughly.
  const sentences = text
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, "$1|")
    .split("|")
    .map(s => s.trim())
    .filter(s => s.length > 5);
  return sentences;
}

/**
 * Tokenize sentence into lowercase words, stripping punctuation.
 */
function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .split(/\s+/)
    .filter(word => word.length > 0);
}

/**
 * Main NLP text processor.
 */
function processText(text, summaryType = 'medium') {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text is empty');
  }

  const sentences = splitIntoSentences(text);
  const allTokens = tokenize(text);
  const wordCount = allTokens.length;
  const charCount = text.length;

  if (sentences.length === 0 || wordCount === 0) {
    throw new Error('Could not parse any sentences or words from input text');
  }

  // Count word frequencies (excluding stopwords)
  const termFrequencies = {};
  let validWordCount = 0;

  allTokens.forEach(token => {
    if (!STOPWORDS.has(token) && token.match(/^[a-zA-Z]{2,}$/)) {
      termFrequencies[token] = (termFrequencies[token] || 0) + 1;
      validWordCount++;
    }
  });

  // Calculate TF-IDF score weights (simplified document TF for single doc)
  // Let TF-score be the term frequency. Words occurring very frequently get higher weight.
  // We can cap TF weights to prevent single-word domination.
  const maxFreq = Math.max(...Object.values(termFrequencies), 1);
  const wordWeights = {};
  Object.keys(termFrequencies).forEach(word => {
    wordWeights[word] = 0.5 + 0.5 * (termFrequencies[word] / maxFreq);
  });

  // Score sentences
  const sentenceScores = sentences.map((sentence, idx) => {
    const tokens = tokenize(sentence);
    let score = 0;
    let keywordHits = 0;

    tokens.forEach(token => {
      if (wordWeights[token]) {
        score += wordWeights[token];
        keywordHits++;
      }
    });

    // Normalize by sentence length to avoid bias towards long sentences.
    const lengthScore = tokens.length > 0 ? Math.sqrt(tokens.length) : 1;
    let finalScore = score / lengthScore;

    // Positional Boost: Introduction (first 10%) and Conclusion (last 10%) get a 1.25x multiplier
    const positionRatio = idx / sentences.length;
    if (positionRatio <= 0.15 || positionRatio >= 0.85) {
      finalScore *= 1.25;
    }

    // Boost for sentences that have transition indicators (e.g. 'therefore', 'furthermore', 'in summary')
    const lowerSentence = sentence.toLowerCase();
    if (
      lowerSentence.includes('therefore') ||
      lowerSentence.includes('consequently') ||
      lowerSentence.includes('furthermore') ||
      lowerSentence.includes('in summary') ||
      lowerSentence.includes('significantly') ||
      lowerSentence.includes('key point') ||
      lowerSentence.includes('conclude') ||
      lowerSentence.includes('crucial') ||
      lowerSentence.includes('important')
    ) {
      finalScore *= 1.3;
    }

    return {
      index: idx,
      text: sentence,
      score: finalScore
    };
  });

  // Sort sentences by score descending to get top sentences
  const sortedSentences = [...sentenceScores].sort((a, b) => b.score - a.score);

  // Determine how many sentences to select based on summaryType
  let targetCount = 5; // Default: Medium
  if (summaryType === 'short') {
    targetCount = Math.max(2, Math.min(3, sentences.length));
  } else if (summaryType === 'medium') {
    targetCount = Math.max(3, Math.min(5, sentences.length));
  } else if (summaryType === 'detailed' || summaryType === 'executive') {
    targetCount = Math.max(5, Math.min(9, sentences.length));
  } else if (summaryType === 'bullet') {
    targetCount = Math.max(4, Math.min(6, sentences.length));
  }

  // Get top N sentences, and sort them back into chronological order (by their original index)
  const topSentences = sortedSentences
    .slice(0, targetCount)
    .sort((a, b) => a.index - b.index)
    .map(s => s.text);

  // Generate Summaries
  let shortSummary = '';
  let detailedSummary = '';
  let bulletPoints = [];
  let executiveSummary = '';

  // Calculate Short (2 sentences)
  const shortTop = sortedSentences.slice(0, 2).sort((a, b) => a.index - b.index).map(s => s.text);
  shortSummary = shortTop.join(' ');

  // Detailed Summary (top 8 or all sentences if < 8)
  const detailedTop = sortedSentences.slice(0, Math.min(8, sentences.length)).sort((a, b) => a.index - b.index).map(s => s.text);
  detailedSummary = detailedTop.join(' ');

  // Bullet point summary
  const bulletTop = sortedSentences.slice(0, Math.min(5, sentences.length)).sort((a, b) => a.index - b.index).map(s => s.text);
  bulletPoints = bulletTop.map(s => s.replace(/^[-•*]\s*/, '')); // Clean leading bullets

  // Executive summary
  // Compose introduction + bullet points + conclusion
  const introSentence = sentences[0];
  const bodySentences = sortedSentences.slice(1, Math.min(4, sentences.length)).sort((a, b) => a.index - b.index).map(s => s.text);
  const outroSentence = sentences[sentences.length - 1];
  executiveSummary = `Analysis Overview: ${introSentence}\n\nCore Developments:\n${bodySentences.map(s => `• ${s}`).join('\n')}\n\nConclusive Stance: ${outroSentence}`;

  // Keywords extraction: top 8 words
  const keywords = Object.entries(termFrequencies)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(entry => entry[0]);

  // Sentiment Analysis
  let sentimentScore = 0;
  let sentimentCount = 0;
  allTokens.forEach(token => {
    if (SENTIMENT_DICT[token] !== undefined) {
      sentimentScore += SENTIMENT_DICT[token];
      sentimentCount++;
    }
  });

  let sentiment = 'Neutral';
  if (sentimentScore > 1) {
    sentiment = 'Positive';
  } else if (sentimentScore < -1) {
    sentiment = 'Negative';
  }

  // Reading Time: 225 words per min
  const readingTime = Math.max(1, Math.ceil(wordCount / 225));

  // Suggested Title
  // Look at keywords, select top 2-3 and construct a clean title.
  // Or look at the first sentence and try to extract a key phrase.
  let generatedTitle = 'Synthesized Document Analysis';
  if (keywords.length >= 2) {
    const capitalize = (w) => w.charAt(0).toUpperCase() + w.slice(1);
    generatedTitle = `Insights on ${capitalize(keywords[0])} and ${capitalize(keywords[1])}`;
  } else if (keywords.length === 1) {
    generatedTitle = `Analysis of ${keywords[0].toUpperCase()}`;
  }

  // Key Highlights / Insights: 3 top-scoring sentences
  const insights = sortedSentences.slice(0, 3).map(s => s.text);

  return {
    wordCount,
    charCount,
    shortSummary,
    detailedSummary,
    bulletPoints,
    executiveSummary,
    keywords,
    sentiment,
    sentimentScore,
    readingTime,
    generatedTitle,
    insights
  };
}

module.exports = {
  processText
};
