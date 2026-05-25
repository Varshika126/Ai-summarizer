const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');

// LangSmith tracing is enabled automatically via env vars:
// LANGSMITH_TRACING, LANGSMITH_API_KEY, LANGSMITH_PROJECT, LANGSMITH_ENDPOINT

/**
 * Build the Gemini LLM instance
 */
function getLLM() {
  return new ChatGoogleGenerativeAI({
    model: 'gemini-1.5-flash',
    apiKey: process.env.google_API_KEY,
    temperature: 0.3,
    maxOutputTokens: 2048,
  });
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

  try {
    const llm = getLLM();
    const parser = new StringOutputParser();

    const prompt = PromptTemplate.fromTemplate(`
You are an expert document summarizer. Analyze the following text and respond ONLY with a valid JSON object.

Text to analyze:
{text}

Summary type requested: {summaryType}
- short: 2-3 sentences
- medium: 3-5 sentences  
- detailed: 6-8 sentences
- bullet: key bullet points
- executive: executive overview with sections

Respond with ONLY this JSON structure (no markdown, no code blocks, just raw JSON):
{{
  "generatedTitle": "A concise descriptive title for this content",
  "shortSummary": "2-3 sentence overview of the main points",
  "detailedSummary": "Comprehensive summary based on the summaryType requested",
  "bulletPoints": ["key point 1", "key point 2", "key point 3", "key point 4", "key point 5"],
  "executiveSummary": "Executive overview with key findings",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5", "keyword6", "keyword7", "keyword8"],
  "sentiment": "Positive or Negative or Neutral",
  "sentimentScore": 0,
  "insights": ["critical insight 1", "critical insight 2", "critical insight 3"]
}}
`);

    const chain = prompt.pipe(llm).pipe(parser);

    const truncatedText = text.length > 12000 ? text.substring(0, 12000) + '...' : text;

    const result = await chain.invoke({
      text: truncatedText,
      summaryType
    });

    // Parse the JSON response
    let parsed;
    try {
      // Strip any accidental markdown code fences
      const clean = result.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      parsed = JSON.parse(clean);
    } catch (parseErr) {
      console.error('Failed to parse Gemini JSON response, falling back to local NLP:', parseErr.message);
      return localProcessText(text, summaryType);
    }

    return {
      wordCount,
      charCount,
      readingTime,
      generatedTitle: parsed.generatedTitle || 'Synthesized Document Analysis',
      shortSummary: parsed.shortSummary || '',
      detailedSummary: parsed.detailedSummary || '',
      bulletPoints: Array.isArray(parsed.bulletPoints) ? parsed.bulletPoints : [],
      executiveSummary: parsed.executiveSummary || '',
      keywords: Array.isArray(parsed.keywords) ? parsed.keywords : [],
      sentiment: ['Positive', 'Negative', 'Neutral'].includes(parsed.sentiment) ? parsed.sentiment : 'Neutral',
      sentimentScore: typeof parsed.sentimentScore === 'number' ? parsed.sentimentScore : 0,
      insights: Array.isArray(parsed.insights) ? parsed.insights : []
    };

  } catch (err) {
    console.error('Gemini AI call failed, falling back to local NLP:', err.message);
    return localProcessText(text, summaryType);
  }
}

// ─── Local TF-IDF fallback (original engine) ────────────────────────────────

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
  return text.toLowerCase().replace(/[^\w\s-]/g, '').split(/\s+/).filter(w => w.length > 0);
}

function localProcessText(text, summaryType = 'medium') {
  const sentences = splitIntoSentences(text);
  const allTokens = tokenize(text);
  const wordCount = allTokens.length;
  const charCount = text.length;

  const termFrequencies = {};
  allTokens.forEach(token => {
    if (!STOPWORDS.has(token) && token.match(/^[a-zA-Z]{2,}$/)) {
      termFrequencies[token] = (termFrequencies[token] || 0) + 1;
    }
  });

  const maxFreq = Math.max(...Object.values(termFrequencies), 1);
  const wordWeights = {};
  Object.keys(termFrequencies).forEach(word => {
    wordWeights[word] = 0.5 + 0.5 * (termFrequencies[word] / maxFreq);
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
    readingTime: Math.max(1, Math.ceil(wordCount / 225)),
    generatedTitle: keywords.length >= 2
      ? `Insights on ${capitalize(keywords[0])} and ${capitalize(keywords[1])}`
      : 'Synthesized Document Analysis',
    shortSummary: shortTop.join(' '),
    detailedSummary: detailedTop.join(' '),
    bulletPoints: bulletTop,
    executiveSummary: `${sentences[0]}\n\n${sorted.slice(1, 4).map(s => `• ${s.text}`).join('\n')}\n\n${sentences[sentences.length - 1]}`,
    keywords,
    sentiment: 'Neutral',
    sentimentScore: 0,
    insights: sorted.slice(0, 3).map(s => s.text)
  };
}

module.exports = { processText };
