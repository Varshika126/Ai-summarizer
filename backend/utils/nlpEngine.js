const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

// LangSmith tracing is enabled automatically via env vars:
// LANGSMITH_TRACING, LANGSMITH_API_KEY, LANGSMITH_PROJECT, LANGSMITH_ENDPOINT

function getLLM() {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    apiKey: process.env.google_API_KEY,
    temperature: 0.3,
    maxOutputTokens: 2048,
  });
}

/**
 * Extract JSON from Gemini response — handles markdown fences and extra text
 */
function extractJSON(raw) {
  // Remove markdown code fences
  let cleaned = raw.replace(/```json\s*/gi, '').replace(/```\s*/gi, '').trim();
  // Find the first { and last } to extract just the JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) throw new Error('No JSON object found in response');
  return JSON.parse(cleaned.substring(start, end + 1));
}

/**
 * Main AI-powered text processor using LangChain + Gemini
 * Falls back to local TF-IDF if AI call fails
 */
async function processText(text, summaryType = 'medium') {
  if (!text || text.trim().length === 0) {
    throw new Error('Input text is empty');
  }

  const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
  const charCount = text.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 225));

  // If no API key, go straight to local fallback
  if (!process.env.google_API_KEY) {
    console.warn('google_API_KEY not set, using local NLP fallback');
    return localProcessText(text, summaryType);
  }

  try {
    const llm = getLLM();
    const parser = new StringOutputParser();

    const prompt = PromptTemplate.fromTemplate(
`You are an expert document summarizer. Analyze the text below and return ONLY a raw JSON object with no markdown formatting, no code blocks, no extra text.

Text:
{text}

Summary type: {summaryType}

Return this exact JSON structure:
{{"generatedTitle":"title here","shortSummary":"2-3 sentence summary here","detailedSummary":"detailed summary here","bulletPoints":["point 1","point 2","point 3","point 4","point 5"],"executiveSummary":"executive overview here","keywords":["word1","word2","word3","word4","word5"],"sentiment":"Neutral","sentimentScore":0,"insights":["insight 1","insight 2","insight 3"]}}`
    );

    const chain = prompt.pipe(llm).pipe(parser);
    const truncatedText = text.length > 10000 ? text.substring(0, 10000) + '...' : text;

    const result = await chain.invoke({ text: truncatedText, summaryType });

    let parsed;
    try {
      parsed = extractJSON(result);
    } catch (parseErr) {
      console.error('JSON parse failed, using local fallback. Raw response:', result.substring(0, 200));
      return localProcessText(text, summaryType);
    }

    // Validate required fields — fall back if missing
    if (!parsed.shortSummary || !parsed.detailedSummary) {
      console.error('Gemini response missing required fields, using local fallback');
      return localProcessText(text, summaryType);
    }

    return {
      wordCount,
      charCount,
      readingTime,
      generatedTitle: parsed.generatedTitle || 'Synthesized Document Analysis',
      shortSummary: String(parsed.shortSummary),
      detailedSummary: String(parsed.detailedSummary),
      bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints.filter(Boolean) : [],
      executiveSummary: parsed.executiveSummary || parsed.detailedSummary || '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords.filter(Boolean) : [],
      sentiment: ['Positive', 'Negative', 'Neutral'].includes(parsed.sentiment) ? parsed.sentiment : 'Neutral',
      sentimentScore: typeof parsed.sentimentScore === 'number' ? parsed.sentimentScore : 0,
      insights: Array.isArray(parsed.insights) ? parsed.insights.filter(Boolean) : []
    };

  } catch (err) {
    console.error('Gemini AI call failed, using local fallback:', err.message);
    return localProcessText(text, summaryType);
  }
}

// ─── Local TF-IDF fallback ───────────────────────────────────────────────────

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
  return text
    .replace(/([.?!])\s*(?=[A-Z0-9])/g, '$1|')
    .split('|')
    .map(s => s.trim())
    .filter(s => s.length > 5);
}

function tokenize(text) {
  return text.toLowerCase().replace(/[^\w\s-]/g, '').split(/\s+/).filter(w => w.length > 0);
}

function localProcessText(text, summaryType = 'medium') {
  const sentences = splitIntoSentences(text);
  const allTokens = tokenize(text);
  const wordCount = allTokens.length;
  const charCount = text.length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 225));

  // Ensure we have at least something to work with
  if (sentences.length === 0) {
    return {
      wordCount, charCount, readingTime,
      generatedTitle: 'Document Analysis',
      shortSummary: text.substring(0, 200),
      detailedSummary: text.substring(0, 500),
      bulletPoints: [text.substring(0, 100)],
      executiveSummary: text.substring(0, 300),
      keywords: [], sentiment: 'Neutral', sentimentScore: 0, insights: []
    };
  }

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

  const sentenceScores = sentences.map((sentence, idx) => {
    const tokens = tokenize(sentence);
    let score = tokens.reduce((s, t) => s + (wordWeights[t] || 0), 0);
    const lengthScore = tokens.length > 0 ? Math.sqrt(tokens.length) : 1;
    let finalScore = score / lengthScore;
    const positionRatio = idx / sentences.length;
    if (positionRatio <= 0.15 || positionRatio >= 0.85) finalScore *= 1.25;
    return { index: idx, text: sentence, score: finalScore };
  });

  const sorted = [...sentenceScores].sort((a, b) => b.score - a.score);
  const keywords = Object.entries(termFrequencies).sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]);
  const capitalize = w => w.charAt(0).toUpperCase() + w.slice(1);

  const shortTop = sorted.slice(0, 2).sort((a, b) => a.index - b.index).map(s => s.text);
  const detailedTop = sorted.slice(0, 8).sort((a, b) => a.index - b.index).map(s => s.text);
  const bulletTop = sorted.slice(0, 5).sort((a, b) => a.index - b.index).map(s => s.text);

  return {
    wordCount,
    charCount,
    readingTime,
    generatedTitle: keywords.length >= 2
      ? `Insights on ${capitalize(keywords[0])} and ${capitalize(keywords[1])}`
      : 'Synthesized Document Analysis',
    shortSummary: shortTop.join(' ') || sentences[0] || text.substring(0, 200),
    detailedSummary: detailedTop.join(' ') || text.substring(0, 500),
    bulletPoints: bulletTop.length > 0 ? bulletTop : [sentences[0]],
    executiveSummary: `${sentences[0]}\n\n${sorted.slice(1, 4).map(s => `• ${s.text}`).join('\n')}\n\n${sentences[sentences.length - 1]}`,
    keywords,
    sentiment: 'Neutral',
    sentimentScore: 0,
    insights: sorted.slice(0, 3).map(s => s.text)
  };
}

module.exports = { processText };
