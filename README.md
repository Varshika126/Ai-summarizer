# AetherSummary // AI-Powered Content Summarizer

AetherSummary is a premium, production-ready SaaS productivity web application designed to synthesize documents, scrape articles, map keywords, detect sentiment tone, and provide speech interfaces—powered completely by a local, customized JavaScript NLP engine (with zero paid API keys or external costs).

---

## ⚡ Core Tech Stack

*   **Frontend**: React (Vite, React Router DOM, Tailwind CSS, Framer Motion, React Icons)
*   **Backend**: Node.js, Express.js, Mongoose, Cheerio (URL Scraping), Mammoth (DOCX Parsing), Multer (File Upload buffers)
*   **Database**: MongoDB
*   **Security**: JWT Token Authentication, Pre-Save Bcrypt Password Hashing, Route Guards, CORS configuration, Multer memory size limiters.
*   **Acoustics & Voice**: Web Speech Synthesis API (text-to-speech summary reader) & Web Speech Recognition API (dictation input).

---

## 🛠️ Folder Architecture

```
ai-powered/
├── package.json                   (Root orchestrator)
├── README.md                      (Setup documentation)
├── backend/
│   ├── config/db.js               (MongoDB connection handler)
│   ├── controllers/               (MVC endpoints handlers)
│   ├── middleware/                (JWT route protectors, error handles)
│   ├── models/                    (Mongoose Schemas: User, Summary, Setting)
│   ├── routes/                    (API routes maps)
│   ├── utils/nlpEngine.js         (Custom TF-IDF local NLP parser)
│   ├── server.js                  (Backend Entrypoint)
│   └── package.json               (Backend dependencies)
└── frontend/
    ├── src/
    │   ├── components/            (Navbar, Sidebar, Custom Charts, Loader)
    │   ├── context/               (AuthContext, ThemeContext)
    │   ├── pages/                 (Landing, Dashboard, Workspace, History, Favorites, Settings, Profile, 404)
    │   ├── App.jsx                (React Router configs)
    │   ├── index.css              (Tailwind theme + custom CSS overrides)
    │   └── main.jsx               (Vite Entrypoint)
    ├── tailwind.config.js         (Neon theme styling rules)
    ├── vite.config.js             (Vite configurations + API proxy)
    └── package.json               (Frontend dependencies)
```

---

## 💡 Custom Local NLP Engine (`backend/utils/nlpEngine.js`)

AetherSummary operates utilizing a localized statistical Natural Language Processing engine built in pure JavaScript. This avoids native C++ binary compiler dependencies that often break on Windows nodes during installation.
1.  **Linguistic Tokenizer**: Normalizes spacing, lowercases letters, strips punctuations, and discards English stopwords (pronouns, prepositions, determiners).
2.  **TF-IDF Word Weights**: Scores the lexical density of key concepts and selects the highest scoring terms as extracted **Keywords**.
3.  **Sentence Ranker**: Splits text into sentences. Calculates a relevance weight for each sentence by summing the TF-IDF weights of its words, normalized by sentence length.
4.  **Positional & Syntactic Boosts**: Applies a 1.25x weight multiplier for sentences in the introduction (first 15%) or conclusion (last 15%), and a 1.3x boost for sentences containing logical transitions (e.g. *therefore, consequently, in summary*).
5.  **Sentiment Mapping**: Scores terms against a valence sentiment lexicon mapping positive and negative definitions (neutral: score within `[-1, 1]`).
6.  **Suggested Title**: Selects highly relevant nouns from the article's vocabulary to synthesize a suggested title.

---

## 🚀 Installation & Setup

### Prerequisites
*   Node.js (v18+ recommended)
*   MongoDB (running locally on port 27017 or a remote MongoDB Atlas URI)

### Local Configuration Setup

1.  Clone or unpack the workspace files.
2.  Install dependencies:
    ```bash
    npm run install-all
    ```
    *(This runs npm install in the root, backend, and frontend directories)*.

3.  Configure environment variables in `backend/.env`:
    ```env
    PORT=5000
    MONGO_URI=mongodb://127.0.0.1:27017/ai-summarizer
    JWT_SECRET=super_secret_jwt_key_12345
    NODE_ENV=development
    ```

---

## 🏁 Starting the Servers

### Run Concurrently
To start both the Express backend and the Vite frontend dev server at the same time:
```bash
npm run dev
```

### Run Separately
*   **Backend Server**:
    ```bash
    npm run server
    ```
    *(Launches Express server at `http://localhost:5000`)*.

*   **Frontend Client**:
    ```bash
    npm run client
    ```
    *(Launches Vite dev server at `http://localhost:3000`)*.

---

## 🧪 Analytical Diagnostics

*   **Scraped URLs**: Enter standard web URLs (e.g. news blogs, documentation pages) to test Cheerio scraping.
*   **Upload Documents**: Drag and drop `.docx` (Mammoth processed) or `.txt` templates.
*   **Speech Readers**: Toggle the speaker icon on results to activate voice outputs.
*   **Print to PDF**: Use the export/bookmark icon on results to trigger direct, styled print-to-PDF templates.
