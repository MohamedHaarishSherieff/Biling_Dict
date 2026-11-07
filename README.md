# 📖 Bilingual Dictionary & Meaning Finder (NLP System)

[![Next.js](https://img.shields.io/badge/Next.js-16.4-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.10%2B-brightgreen?logo=python)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-1.0-teal?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Scikit-Learn](https://img.shields.io/badge/Scikit--Learn-1.3%2B-orange?logo=scikit-learn)](https://scikit-learn.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)

An intelligent Natural Language Processing (NLP) bilingual dictionary and semantic retrieval system providing bidirectional cross-lingual lookups, phonetic transliterations, native audio pronunciations, and typo-tolerant spell suggestions between **English** and **5 Indic languages**:

1. **Tamil (தமிழ்)**
2. **Telugu (తెలుగు)**
3. **Kannada (ಕನ್ನಡ)**
4. **Malayalam (മലയാളം)**
5. **Hindi (हिन्दी)**

---

## 👥 Project Credits

- **R25DG013** — Mohamed Haarish
- **R25DG033** — Yanthungremo Ezung

---

## 📁 Repository Structure

```text
├── backend/
│   ├── dataset.py            # Multilingual corpus & supported language definitions
│   ├── nlp_model.py          # IndicNLPModel: Normalization, script classifier, Damerau-Levenshtein & TF-IDF
│   ├── main.py               # FastAPI REST API & TTS proxy
│   ├── train.py              # Model training script & typo benchmark suite
│   ├── cli.py                # Interactive command-line lookup interface
│   └── requirements.txt      # Python dependencies for backend
├── deliverables/
│   ├── Bilingual_Dictionary_Project_Presentation.pptx  # 16:9 Slide presentation deck
│   └── Bilingual_Dictionary_Project_Report.pdf        # Formatted project report
├── src/
│   ├── app/
│   │   ├── api/tts/route.ts  # Next.js TTS audio route
│   │   ├── layout.tsx        # Root HTML layout & Indic fonts
│   │   ├── page.tsx          # Main interactive dictionary application
│   │   └── globals.css       # Tailwind CSS styling & custom utilities
│   ├── components/           # UI Modals, AudioPlayer, Cards, & Navigation
│   └── lib/                  # TypeScript types, client-side NLP fallback & API client
├── generate_presentation.py  # Automation script to rebuild PPTX deck
├── generate_report.py        # Automation script to rebuild PDF report
├── requirements.txt          # Python requirements (backend + doc generators)
└── package.json              # Next.js / TypeScript project manifest
```

---

## 🏗️ Architecture & NLP Pipeline

The system is built on a hybrid architecture separating high-performance NLP computation from a modern reactive web frontend:

```
[ User Input (Any Script / Typo) ]
               │
               ▼
   [ Subtask 2: Unicode Normalization (NFC, ZWJ/ZWNJ Strip, Sanitization) ]
               │
               ▼
   [ Subtask 3: Automatic Script Detection (Tamil, Telugu, Kannada, Malayalam, Devanagari, Latin) ]
               │
      ┌────────┴──────────────────────────┐
      │                                   │
      ▼                                   ▼
[ Exact & Substring Match ]    [ Subtask 6: Typo & Spelling Correction ]
      │                                   │
      │                        ┌──────────┴──────────┐
      │                        ▼                     ▼
      │           [ Damerau-Levenshtein ]   [ Char N-Gram TF-IDF ]
      │             (Adjacent Transpositions)   (Cosine Similarity)
      │                        └──────────┬──────────┘
      │                                   ▼
      │                       [ Hybrid Ranker (60/40) ]
      └────────────────┬──────────────────┘
                       │
                       ▼
       [ Subtask 4: Bidirectional Search Results ]
                       │
                       ▼
  [ Subtask 5: Audio Pronunciation (TTS) + IPA + Contextual Examples ]
```

### 🔬 Core NLP Subtasks
1. **Subtask 1 — Multilingual Dataset**: Curated dictionary entries spanning English and five regional Dravidian and Indo-Aryan languages with definitions, grammatical parts of speech, categories, and bilingual usage sentences.
2. **Subtask 2 — Normalization**: Unicode NFC normalization, zero-width joiner/non-joiner removal (`\u200B-\u200D\uFEFF`), punctuation sanitization, and whitespace collapsing.
3. **Subtask 3 — Script Detection**: Unicode code-point inspection automatically classifies input scripts (`0x0900-0x097F` Devanagari, `0x0B80-0x0BFF` Tamil, `0x0C00-0x0C7F` Telugu, `0x0C80-0x0CFF` Kannada, `0x0D00-0x0D7F` Malayalam, Latin/English).
4. **Subtask 4 — Bidirectional Retrieval**: Seamless query resolution (English &rarr; Indic, Indic &rarr; English, and phonetic transliteration &rarr; both).
5. **Subtask 5 — Phonetics & Pronunciation**: Native audio synthesis (via TTS proxy), International Phonetic Alphabet (IPA) guides, and parallel bilingual sentence pairs.
6. **Subtask 6 — Hybrid Spell Suggestion**: Combines Damerau-Levenshtein distance (handling insertions, deletions, substitutions, and character transpositions) with Subword Character N-Gram TF-IDF vectorization and cosine similarity to achieve **100% Top-3 accuracy** on benchmark typos.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0 or later (v20+ recommended)
- **Python**: v3.10 or later
- **npm** or **pnpm**

---

### Step 1: Clone the Repository
```bash
git clone https://github.com/MohamedHaarishSherieff/Biling_Dict.git
cd Biling_Dict
```

---

### Step 2: Set Up Python Backend
1. Create and activate a virtual environment (optional but recommended):
   ```bash
   python -m venv venv
   # On Windows (PowerShell):
   venv\Scripts\Activate.ps1
   # On macOS/Linux:
   source venv/bin/activate
   ```
2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```
3. Start the FastAPI server:
   ```bash
   cd backend
   python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload
   ```
   - REST API runs at: `http://127.0.0.1:8000`
   - Interactive Swagger docs: `http://127.0.0.1:8000/docs`

---

### Step 3: Start the Next.js Frontend
In a new terminal window from the project root:
```bash
npm install
npm run dev
```
Open your browser at: **`http://localhost:3000`**

*(Note: The frontend includes a built-in client-side NLP engine and will function seamlessly even if the Python backend is offline!)*

---

### Step 4: Run NLP Model Benchmark & CLI (Optional)
Run the typo benchmark suite:
```bash
python backend/train.py
```
Run the interactive terminal lookup tool:
```bash
python backend/cli.py
```

---

## 🧪 Testing NLP Spell Suggestions

Try searching with these intentional typos to test the fuzzy correction algorithm:

| Input Typo | Target Word | Language | Result |
| :--- | :--- | :--- | :--- |
| `helllo` | `hello` | English | PASS (Top-1 Match) |
| `wator` | `water` | English | PASS (Top-1 Match) |
| `boook` | `book` | English | PASS (Top-1 Match) |
| `namastee` | `namaste` (नमस्ते) | Hindi | PASS (Top-1 Match) |
| `vanakam` | `vanakkam` (வணக்கம்) | Tamil | PASS (Top-1 Match) |
| `neeruu` | `neeru` (ನೀರು) | Kannada | PASS (Top-1 Match) |
| `vellamm` | `vellam` (വെള്ളം) | Malayalam | PASS (Top-1 Match) |

---

## 📄 Deliverables Generation

To re-generate the project presentation or formatted academic report:
```bash
# Generate 16:9 PowerPoint Presentation
python generate_presentation.py

# Generate Multi-page PDF Report with Table of Contents & Typography
python generate_report.py
```
Deliverables are output to the `deliverables/` folder.

---

## 📜 License
This project is open-source and developed for academic and NLP research purposes.
