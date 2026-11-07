"""
FastAPI Server for Bilingual Indic NLP Dictionary.
Serves the IndicNLPModel via REST API with CORS support.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any

from dataset import SUPPORTED_LANGUAGES, INITIAL_DICTIONARY
from nlp_model import IndicNLPModel

app = FastAPI(
    title="Bilingual Dictionary NLP API",
    description="NLP-based meaning finder and spell suggestion engine across English and Indic languages.",
    version="1.0.0"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global in-memory dictionary and model instance
dictionary_data: List[Dict[str, Any]] = list(INITIAL_DICTIONARY)
model = IndicNLPModel(dictionary_data)


# ----------------- Request/Response Models -----------------

class SearchRequest(BaseModel):
    query: str
    selected_language: Optional[str] = "all"

class SuggestRequest(BaseModel):
    query: str
    selected_language: Optional[str] = "all"
    limit: Optional[int] = 5

class NormalizeRequest(BaseModel):
    text: str

class NewWordEntry(BaseModel):
    english: str
    target: str
    transliteration: Optional[str] = ""
    language: str
    part_of_speech: Optional[str] = "noun"
    english_meaning: str
    target_meaning: str
    pronunciation_ipa: Optional[str] = ""
    category: Optional[str] = "General"
    examples: Optional[List[Dict[str, str]]] = []
    synonyms: Optional[List[str]] = []
    antonyms: Optional[List[str]] = []


# ----------------- API Endpoints -----------------

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "engine": "Python IndicNLPModel",
        "is_model_trained": model.is_trained,
        "total_entries": len(dictionary_data),
        "supported_languages": [l["name"] for l in SUPPORTED_LANGUAGES]
    }

@app.get("/api/languages")
def get_languages():
    return SUPPORTED_LANGUAGES

@app.get("/api/words")
def get_all_words():
    seen = set()
    unique = []
    for e in model.entries:
        k = (e.get("id"), e.get("language"))
        if k not in seen:
            seen.add(k)
            unique.append(e)
    return unique

@app.get("/api/tts")
def text_to_speech(text: str, lang: str = "en"):
    """
    Proxies Google Translate TTS to provide authentic native pronunciation audio
    for Tamil, Telugu, Kannada, Malayalam, Hindi, and English.
    """
    if not text.strip():
        raise HTTPException(status_code=400, detail="Text parameter is required")
    
    clean_lang = lang.strip().lower()
    if clean_lang not in ["ta", "te", "kn", "ml", "hi", "en"]:
        clean_lang = "en"
        
    try:
        import urllib.request, urllib.parse
        from fastapi.responses import Response
        q = urllib.parse.quote(text.strip())
        url = f"https://translate.google.com/translate_tts?ie=UTF-8&q={q}&tl={clean_lang}&client=tw-ob"
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)"})
        audio_data = urllib.request.urlopen(req, timeout=4.0).read()
        return Response(
            content=audio_data,
            media_type="audio/mpeg",
            headers={
                "Cache-Control": "public, max-age=86400",
                "Accept-Ranges": "bytes"
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"TTS synthesis failed: {str(e)}")

@app.post("/api/search")
def search_word(req: SearchRequest):
    result = model.search(req.query, req.selected_language or "all")
    return result

@app.post("/api/suggest")
def get_suggestions(req: SuggestRequest):
    suggestions = model.suggest_similar_words(
        req.query,
        selected_language=req.selected_language,
        limit=req.limit or 5
    )
    return {"query": req.query, "suggestions": suggestions}

@app.post("/api/normalize")
def normalize_text(req: NormalizeRequest):
    normalized = model.normalize_text(req.text)
    script = model.detect_script(req.text)
    return {
        "raw": req.text,
        "normalized": normalized,
        "detected_script": script
    }

@app.post("/api/add-word")
def add_custom_word(entry: NewWordEntry):
    new_entry = {
        "id": f"{entry.language}-{len(dictionary_data) + 1}",
        "english": entry.english.strip().lower(),
        "target": entry.target.strip(),
        "transliteration": entry.transliteration.strip() or entry.target.strip(),
        "language": entry.language,
        "part_of_speech": entry.part_of_speech or "noun",
        "english_meaning": entry.english_meaning.strip(),
        "target_meaning": entry.target_meaning.strip(),
        "pronunciation_ipa": entry.pronunciation_ipa or "",
        "examples": entry.examples or [],
        "synonyms": entry.synonyms or [],
        "antonyms": entry.antonyms or [],
        "category": entry.category or "General"
    }

    dictionary_data.insert(0, new_entry)
    model.train()  # Re-fit model with new vocabulary

    return {
        "status": "success",
        "message": f"Word '{entry.english}' added successfully and model retrained.",
        "entry": new_entry
    }

@app.post("/api/train")
def retrain_model():
    res = model.train()
    return {"status": "retrained", "details": res}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
