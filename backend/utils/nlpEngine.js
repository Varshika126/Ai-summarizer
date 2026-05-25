// ─── Local TF-IDF Engine (always runs first, guaranteed output) ──────────────

const STOPWORDS = new Set([
  'a','about','above','after','again','against','all','am','an','and','any','are','arent','as','at',
  'be','because','been','before','being','below','between','both','but','by','cant','cannot','could',
  'couldnt','did','didnt','do','does','doesnt','doing','dont','down','during','each','few','for','from',
  'further','had','hadnt','has','hasnt','have','havent','having','he','hed','hell','hes','her','here',
  'heres','hers','herself','him','himself','his','how','hows','i','id','ill','im','ive','if','in',
  'into','is','isnt','it','its','itself','lets','me','more','most','mustnt','my','myself','no','nor',
  'not','of','off','on','once','only','or','other','ought','our','ours','ourselves','out','over','own',
  'same','shant','she','shed','shell','shes','should','shouldnt','so','some','such','than','that','thats',
  'the','their','theirs','them','themselves','then','there','theres','these','they','theyd','theyll',
  'theyre','theyve','this','those','through','to','too','under','until','up','very','was','wasnt','we',
  'wed','well','were','weve','werent','what','whats','when','whens','where','wheres','which','while',
  'who','whos','whom','why','whys','with','wont','would','wouldnt','you','youd','youll','youre','youve',
  'your','yours','yourself','yourselves','will','also','one','two','three','can','may','should'
]);

function splitIntoSentences(text) {
  return text.replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|').split('|').map(s => s.trim()).filter(s => s.length > 5);
}

function tokenize(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, '').split(/\s+/).filter(w => w.length > 1);
}

function localProcessText(text, summaryType = 'medium') {
  const sentences = splitIntoSentences(text);
  const allTokens = tokenize(text);
  const wordCount = allTokens.length || 1;
  const charCount = text.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 225));

  // Always have at least one sentence
  const safeSentences = sentences.length > 0 ? sentences : [text.substring(0, 300)];

  const termFrequencies = {};
  allTokens.forEach(token => {
    if (!STOPWORDS.has(token) && /^[a-zA-Z]{2,}$/.test(token)) {
      termFrequencies[token] = (termFrequencies[token] || 0) + 1;
    }
  });

  const maxFreq = Math.max(...Object.values(termFrequencies), 1);
  const wordWeights = {};
  Object.keys(termFrequencies).forEach(w => {
    wordWeights[w] = 0.5 + 0.5 * (termFrequencies[w] / maxFreq);
  });

  const sentenceScores = safeSentences.map((sentence, idx) => {
    const tokens = tokenize(sentence);
    let score = tokens.reduce((s, t) => s + (wordWeights[t] || 0), 0);
    const lengthScore = Math.sqrt(Math.max(tokens.length, 1));
    let finalScore = score / lengthScore;
    const positionRatio = idx / safeSentences.length;
    if (positionRatio <= 0.15 || positionRatio >= 0.85) finalScore *= 1.25;
    return { index: idx, text: sentence, score: finalScore };
  });

  const sorted = [...sentenceScores].sort((a, b) => b.score - a.score);
  const keywords = Object.entries(termFrequencies).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]);
  const capitalize = w => w.charAt(0).toUpperCase() + w.slice(1);

  const shortTop = sorted.slice(0, 2).sort((a, b) => a.index - b.index).map(s => s.text);
  const detailedTop = sorted.slice(0, 8).sort((a, b) => a.index - b.index).map(s => s.text);
  const bulletTop = sorted.slice(0, 5).sort((a, b) => a.index - b.index).map(s => s.text);

  // Guaranteed non-empty values for required fields
  const shortSummary = shortTop.join(' ') || safeSentences[0] || text.substring(0, 200);
  const detailedSummary = detailedTop.join(' ') || safeSentences.slice(0, 3).join(' ') || text.substring(0, 500);

  return {
    wordCount,
    charCount,
    readingTime,
    generatedTitle: keywords.length >= 2
      ? `Insights on ${capitalize(keywords[0])} and ${capitalize(keywords[1])}`
      : 'Synthesized Document Analysis',
    shortSummary,
    detailedSummary,
    bulletPoints: bulletTop.length > 0 ? bulletTop : [safeSentences[0]],
    executiveSummary: `${safeSentences[0]}\n\n${sorted.slice(1, 4).map(s => `• ${s.text}`).join('\n')}\n\n${safeSentences[safeSentences.length - 1]}`,
    keywords,
    sentiment: 'Neutral',
    sentimentScore: 0,
    insights: sorted.slice(0, 3).map(s => s.text)
  };
}

// ─── Gemini AI enhancement (optional, runs after local NLP) ──────────────────

async function enhanceWithGemini(localResult, text, summaryType) {
  if (!process.env.google_API_KEY) return localResult;

  try {
    const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
    const { PromptTemplate } = require('@langchain/core/prompts');
    const { StringOutputParser } = require('@langchain/core/output_parsers');

    const llm = new ChatGoogleGenerativeAI({
      model: 'gemini-1.5-flash',
      apiKey: process.env.google_API_KEY,
      temperature: 0.3,
      maxOutputTokens: 2048,
    });

    const prompt = PromptTemplate.fromTemplate(
`Summarize the following text. Return ONLY raw JSON, no markdown, no code blocks.

Text: {text}

JSON format:
{{"generatedTitle":"string","shortSummary":"string","detailedSummary":"string","bulletPoints":["string"],"executiveSummary":"string","keywords":["string"],"sentiment":"Positive or Negative or Neutral","sentimentScore":0,"insights":["string"]}}`
    );

    const chain = prompt.pipe(llm).pipe(new StringOutputParser());
    const truncated = text.length > 8000 ? text.substring(0, 8000) + '...' : text;
    const raw = await chain.invoke({ text: truncated, summaryType });

    // Extract JSON safely
    const start = raw.indexOf('{');
    const end = raw.lastIndexOf('}');
    if (start === -1 || end === -1) throw new Error('No JSON in response');

    const parsed = JSON.parse(raw.substring(start, end + 1));

    // Only override if Gemini returned valid non-empty values
    return {
      ...localResult,
      generatedTitle: parsed.generatedTitle || localResult.generatedTitle,
      shortSummary: parsed.shortSummary || localResult.shortSummary,
      detailedSummary: parsed.detailedSummary || localResult.detailedSummary,
      bulletPoints: (Array.isArray(parsed.bulletPoints) && parsed.bulletPoints.length > 0) ? parsed.bulletPoints : localResult.bulletPoints,
      executiveSummary: parsed.executiveSummary || localResult.executiveSummary,
      keywords: (Array.isArray(parsed.keywords) && parsed.keywords.length > 0) ? parsed.keywords : localResult.keywords,
      sentiment: ['Positive', 'Negative', 'Neutral'].includes(parsed.sentiment) ? parsed.sentiment : localResult.sentiment,
      sentimentScore: typeof parsed.sentimentScore === 'number' ? parsed.sentimentScore : localResult.sentimentScore,
      insights: (Array.isArray(parsed.insights) && parsed.insights.length > 0) ? parsed.insights : localResult.insights,
    };

  } catch (err) {
    console.error('Gemini enhancement failed, using local result:', err.message);
    return localResult;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

async function processText(text, summaryType = 'medium') {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text is empty');
  }

  // Step 1: Always run local NLP first — guaranteed valid output
  const localResult = localProcessText(text, summaryType);

  // Step 2: Try to enhance with Gemini (if it fails, localResult is returned as-is)
  const finalResult = await enhanceWithGemini(localResult, text, summaryType);

  return finalResult;
}

module.exports = { processText };
