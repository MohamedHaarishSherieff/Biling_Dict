"""
Indic NLP Model and Language Engine.
Handles:
1. Unicode NFC normalization and cleaning
2. Script classification (Tamil, Telugu, Kannada, Malayalam, Devanagari, Latin)
3. Damerau-Levenshtein edit-distance with adjacent character transpositions
4. Subword Character N-gram TF-IDF vectorizer (trained using scikit-learn & numpy)
5. Dynamic lexical fallback (resolves any unseen dictionary word dynamically)
6. Fuzzy spelling corrector and ranking predictor
7. Bidirectional semantic search
"""

import re
import unicodedata
import urllib.request
import urllib.parse
import json
from typing import List, Dict, Any, Optional, Tuple
import numpy as np
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity


class IndicNLPModel:
    def __init__(self, dictionary_entries: List[Dict[str, Any]]):
        self.entries = dictionary_entries
        self.vectorizer: Optional[TfidfVectorizer] = None
        self.tfidf_matrix = None
        self.corpus_tokens: List[Dict[str, Any]] = []
        self.is_trained = False
        
        # Train and build index upon initialization
        self.train()

    @staticmethod
    def normalize_text(text: str) -> str:
        """
        Subtask 2: Clean and normalize words in both languages.
        - Unicode NFC normalization
        - Strips zero-width characters (ZWJ/ZWNJ)
        - Removes non-alphanumeric punctuation while retaining script diacritics
        - Lowercases Latin characters
        - Collapses whitespace
        """
        if not text:
            return ""
        
        normalized = unicodedata.normalize("NFC", str(text))
        normalized = re.sub(r"[\u200B-\u200D\uFEFF]", "", normalized)
        normalized = normalized.lower()
        normalized = re.sub(r"[.,/#!$%^&*;:{}=\-_`~()?'\"<>@+\[\]\\]", " ", normalized)
        normalized = re.sub(r"\s+", " ", normalized).strip()
        return normalized

    @staticmethod
    def detect_script(text: str) -> str:
        """
        Subtask 3: Identifies input script via Unicode code-point boundaries.
        Returns: 'ta', 'te', 'kn', 'ml', 'hi', 'en', or 'unknown'
        """
        if not text:
            return "unknown"
            
        for ch in text:
            code = ord(ch)
            if 0x0900 <= code <= 0x097F:
                return "hi"  # Devanagari
            if 0x0B80 <= code <= 0x0BFF:
                return "ta"  # Tamil
            if 0x0C00 <= code <= 0x0C7F:
                return "te"  # Telugu
            if 0x0C80 <= code <= 0x0CFF:
                return "kn"  # Kannada
            if 0x0D00 <= code <= 0x0D7F:
                return "ml"  # Malayalam
            if (0x0041 <= code <= 0x005A) or (0x0061 <= code <= 0x007A):
                return "en"  # Latin / English
                
        return "unknown"

    @staticmethod
    def damerau_levenshtein_distance(s1: str, s2: str) -> int:
        """
        Computes edit distance considering insertions, deletions, substitutions,
        and transpositions of two adjacent characters.
        """
        d = {}
        len1, len2 = len(s1), len(s2)
        for i in range(-1, len1 + 1):
            d[(i, -1)] = i + 1
        for j in range(-1, len2 + 1):
            d[(-1, j)] = j + 1

        for i in range(len1):
            for j in range(len2):
                cost = 0 if s1[i] == s2[j] else 1
                d[(i, j)] = min(
                    d[(i - 1, j)] + 1,       # deletion
                    d[(i, j - 1)] + 1,       # insertion
                    d[(i - 1, j - 1)] + cost # substitution
                )
                if i > 0 and j > 0 and s1[i] == s2[j - 1] and s1[i - 1] == s2[j]:
                    d[(i, j)] = min(d[(i, j)], d[(i - 2, j - 2)] + 1) # transposition

        return d[(len1 - 1, len2 - 1)]

    def train(self) -> Dict[str, Any]:
        """
        Trains/fits the NLP Character N-gram TF-IDF Model over the bilingual corpus.
        """
        self.corpus_tokens = []
        corpus_texts = []

        for entry in self.entries:
            norm_en = self.normalize_text(entry.get("english", ""))
            if norm_en:
                corpus_texts.append(norm_en)
                self.corpus_tokens.append({
                    "text": norm_en,
                    "display": entry.get("english"),
                    "type": "english",
                    "entry": entry
                })

            norm_target = self.normalize_text(entry.get("target", ""))
            if norm_target:
                corpus_texts.append(norm_target)
                self.corpus_tokens.append({
                    "text": norm_target,
                    "display": entry.get("target"),
                    "type": "target",
                    "entry": entry
                })

            norm_trans = self.normalize_text(entry.get("transliteration", ""))
            if norm_trans:
                corpus_texts.append(norm_trans)
                self.corpus_tokens.append({
                    "text": norm_trans,
                    "display": entry.get("transliteration"),
                    "type": "transliteration",
                    "entry": entry
                })

        self.vectorizer = TfidfVectorizer(
            analyzer="char_wb",
            ngram_range=(2, 4),
            min_df=1
        )
        self.tfidf_matrix = self.vectorizer.fit_transform(corpus_texts)
        self.is_trained = True

        return {
            "status": "trained",
            "vocabulary_size": len(self.vectorizer.vocabulary_),
            "total_tokens_indexed": len(self.corpus_tokens),
            "ngram_range": [2, 4]
        }

    def predict_similarity(self, query: str, candidate: str) -> Tuple[float, int]:
        norm_q = self.normalize_text(query)
        norm_c = self.normalize_text(candidate)

        if not norm_q or not norm_c:
            return 0.0, 999
        if norm_q == norm_c:
            return 100.0, 0

        if norm_q in norm_c or norm_c in norm_q:
            len_ratio = min(len(norm_q), len(norm_c)) / max(len(norm_q), len(norm_c))
            dist = abs(len(norm_q) - len(norm_c))
            return round(75.0 + len_ratio * 25.0, 1), dist

        dist = self.damerau_levenshtein_distance(norm_q, norm_c)
        max_l = max(len(norm_q), len(norm_c))
        edit_score = max(0.0, 1.0 - (dist / max_l))

        cosine_score = 0.0
        if self.vectorizer is not None:
            try:
                q_vec = self.vectorizer.transform([norm_q])
                c_vec = self.vectorizer.transform([norm_c])
                cosine_score = float(cosine_similarity(q_vec, c_vec)[0][0])
            except Exception:
                cosine_score = 0.0

        hybrid = (edit_score * 0.6) + (cosine_score * 0.4)
        return round(hybrid * 100.0, 1), dist

    def suggest_similar_words(
        self,
        query: str,
        selected_language: Optional[str] = None,
        limit: int = 5
    ) -> List[Dict[str, Any]]:
        norm_q = self.normalize_text(query)
        if not norm_q:
            return []

        candidates = []
        seen = set()

        for token in self.corpus_tokens:
            entry = token["entry"]
            if selected_language and selected_language != "all" and entry.get("language") != selected_language:
                continue

            word_text = token["display"]
            word_key = token["text"]

            if word_key in seen:
                continue
            seen.add(word_key)

            sim_score, dist = self.predict_similarity(norm_q, token["text"])

            if sim_score >= 40.0:
                candidates.append({
                    "word": word_text,
                    "entry": entry,
                    "match_type": token["type"],
                    "distance": dist,
                    "similarity": sim_score
                })

        candidates.sort(key=lambda x: (-x["similarity"], x["distance"]))
        return candidates[:limit]

    def transliterate_to_indic(self, text: str, target_lang: str) -> str:
        """
        Spells an English loanword or untranslatable word in the target Indic script
        so that terms without a direct native word (e.g., 'yummy', 'hangout', 'wifi', 'pizza', 'sandwich')
        are cleanly spelled in that language's script itself without made-up or meaningless phrases.
        """
        if not text or not target_lang or target_lang not in ["ta", "te", "kn", "ml", "hi"]:
            return text

        try:
            q = urllib.parse.quote(text.strip().lower())
            url = f"https://inputtools.google.com/request?text={q}&itc={target_lang}-t-i0-und&num=1"
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            data = json.loads(urllib.request.urlopen(req, timeout=2.5).read())
            if isinstance(data, list) and len(data) > 1 and len(data[1]) > 0:
                first_block = data[1][0]
                if len(first_block) > 1 and len(first_block[1]) > 0:
                    cand = str(first_block[1][0]).strip()
                    if cand and self.detect_script(cand) == target_lang:
                        return cand
        except Exception:
            pass

        return text

    def fetch_online_entry(self, word: str, selected_language: str = "hi") -> Optional[Dict[str, Any]]:
        """
        Dynamically fetches translation and definition for any English or Indic word,
        strictly returning the exact single headword without sentences or extra fluff.
        When a word has no native equivalent (loanwords like 'yummy', 'pizza', 'sandwich'),
        it is spelled cleanly in that target language's native script itself.
        """
        norm_w = self.normalize_text(word)
        if not norm_w or len(norm_w) > 35:
            return None

        detected = self.detect_script(word)
        q = urllib.parse.quote(word.strip())

        try:
            if detected == "en":
                # English -> Indic
                target_lang = selected_language if selected_language and selected_language != "all" else "hi"
                url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl={target_lang}&dt=t&dt=bd&dt=rm&q={q}"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                data = json.loads(urllib.request.urlopen(req, timeout=3.5).read())

                raw_target = data[0][0][0] if data and data[0] and data[0][0] else ""
                # Clean: extract strictly the first distinct word/term, no sentences or parentheses
                target_word = raw_target.split(",")[0].split(".")[0].split(";")[0].split("(")[0].strip()

                # Check if untranslated Latin or long descriptive sentence
                is_latin = any(ord(c) < 128 and c.isalpha() for c in target_word)
                is_too_long = len(target_word.split()) > 2

                # Compute phonetic loanword spelling in target script
                phonetic_spelling = self.transliterate_to_indic(norm_w, target_lang)

                if is_latin or is_too_long:
                    if phonetic_spelling and self.detect_script(phonetic_spelling) == target_lang:
                        target_word = phonetic_spelling
                    elif is_too_long:
                        target_word = target_word.split()[0]

                if not target_word:
                    target_word = phonetic_spelling if phonetic_spelling else norm_w

                # Extract transliteration if present
                transliteration = norm_w
                if len(data[0]) > 1 and len(data[0][1]) > 2 and data[0][1][2]:
                    transliteration = str(data[0][1][2])

                # Extract part of speech from dictionary block if present
                pos = "noun"
                synonyms = []
                if len(data) > 1 and isinstance(data[1], list) and len(data[1]) > 0:
                    pos_info = data[1][0]
                    if len(pos_info) > 0 and isinstance(pos_info[0], str):
                        pos = pos_info[0].lower()
                    if len(pos_info) > 1 and isinstance(pos_info[1], list):
                        synonyms = [s for s in pos_info[1][:4] if s != target_word]

                # If phonetic loanword spelling exists and is distinct from target_word, include as synonym
                if phonetic_spelling and phonetic_spelling != target_word and self.detect_script(phonetic_spelling) == target_lang:
                    if phonetic_spelling not in synonyms:
                        synonyms.insert(0, phonetic_spelling)

                # Definition from free dictionary API or fallback
                meaning = f"The word '{norm_w}' which translates to '{target_word}'."
                ipa = ""
                try:
                    dict_url = f"https://api.dictionaryapi.dev/api/v2/entries/en/{q}"
                    dict_req = urllib.request.Request(dict_url, headers={"User-Agent": "Mozilla/5.0"})
                    dict_res = json.loads(urllib.request.urlopen(dict_req, timeout=2.0).read())
                    if isinstance(dict_res, list) and len(dict_res) > 0:
                        first = dict_res[0]
                        ipa = first.get("phonetic", "")
                        meanings = first.get("meanings", [])
                        if meanings:
                            defs = meanings[0].get("definitions", [])
                            if defs:
                                meaning = defs[0].get("definition", meaning)
                except Exception:
                    pass

                # Language-specific target meaning templates
                target_meaning_templates = {
                    "ta": f"'{target_word}' என்பதன் பொருள் அல்லது தமிழாக்கம்.",
                    "te": f"'{target_word}' యొక్క అర్థం లేదా వివరణ.",
                    "kn": f"'{target_word}' ಪದದ ಅರ್ಥ ಅಥವಾ ವಿವರಣೆ.",
                    "ml": f"'{target_word}' എന്ന പദത്തിന്റെ അർത്ഥം.",
                    "hi": f"'{target_word}' का अर्थ या परिभाषा."
                }
                target_meaning = target_meaning_templates.get(target_lang, f"'{target_word}' என்பதன் பொருள்.")

                # Language-specific contextual example sentences
                example_templates = {
                    "ta": f"நாம் பொதுவாக '{target_word}' என்ற சொல்லைப் பயன்படுத்துகிறோம்.",
                    "te": f"మనం సాధారణంగా '{target_word}' అనే పదాన్ని ఉపయోగిస్తాము.",
                    "kn": f"ನಾವು ಸಾಮಾನ್ಯವಾಗಿ '{target_word}' ಎಂಬ ಪದವನ್ನು ಬಳಸುತ್ತೇವೆ.",
                    "ml": f"നാം സാധാരണയായി '{target_word}' എന്ന വാക്ക് ഉപയോഗിക്കുന്നു.",
                    "hi": f"हम आमतौर पर '{target_word}' शब्द का उपयोग करते हैं."
                }
                target_example = example_templates.get(target_lang, f"The word {target_word} is commonly used.")

                entry = {
                    "id": f"{target_lang}-{norm_w}",
                    "english": norm_w,
                    "target": target_word,
                    "transliteration": transliteration,
                    "language": target_lang,
                    "part_of_speech": pos,
                    "english_meaning": meaning,
                    "target_meaning": target_meaning,
                    "pronunciation_ipa": ipa,
                    "examples": [
                        {
                            "english": f"The word '{norm_w}' is used in daily life.",
                            "target": target_example,
                            "transliteration": ""
                        }
                    ],
                    "synonyms": synonyms,
                    "antonyms": [],
                    "category": "Vocabulary"
                }

            else:
                # Indic -> English
                url = f"https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&dt=bd&dt=rm&q={q}"
                req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
                data = json.loads(urllib.request.urlopen(req, timeout=3.5).read())

                raw_eng = data[0][0][0] if data and data[0] and data[0][0] else ""
                eng_word = raw_eng.split(",")[0].split(".")[0].split(";")[0].split("(")[0].strip().lower()
                if len(eng_word.split()) > 2:
                    eng_word = eng_word.split()[0]

                if not eng_word:
                    return None

                transliteration = word
                if len(data[0]) > 1 and len(data[0][1]) > 3 and data[0][1][3]:
                    transliteration = str(data[0][1][3])

                target_lang = detected if detected in ["ta", "te", "kn", "ml", "hi"] else "hi"

                target_meaning_templates = {
                    "ta": f"'{word.strip()}' என்பதன் ஆங்கிலப் பொருள் '{eng_word}'.",
                    "te": f"'{word.strip()}' యొక్క ఆంగ్ల అర్థం '{eng_word}'.",
                    "kn": f"'{word.strip()}' ಪದದ ಇಂಗ್ಲಿಷ್ ಅರ್ಥ '{eng_word}'.",
                    "ml": f"'{word.strip()}' എന്നതിന്റെ ഇംഗ്ലീഷ് അർത്ഥം '{eng_word}'.",
                    "hi": f"'{word.strip()}' का अंग्रेजी अनुवाद '{eng_word}'."
                }
                target_meaning = target_meaning_templates.get(target_lang, f"'{word.strip()}' corresponds to '{eng_word}'.")

                entry = {
                    "id": f"{target_lang}-{eng_word}",
                    "english": eng_word,
                    "target": word.strip(),
                    "transliteration": transliteration,
                    "language": target_lang,
                    "part_of_speech": "noun",
                    "english_meaning": f"The term '{word.strip()}' corresponds to the English word '{eng_word}'.",
                    "target_meaning": target_meaning,
                    "pronunciation_ipa": "",
                    "examples": [],
                    "synonyms": [],
                    "antonyms": [],
                    "category": "Vocabulary"
                }

            # Check if already present in self.entries before inserting
            for existing in self.entries:
                if existing.get("id") == entry["id"] or (
                    existing.get("english", "").lower() == entry.get("english", "").lower() and
                    existing.get("language") == entry.get("language")
                ):
                    return existing

            # Cache into active dictionary
            self.entries.insert(0, entry)
            self.corpus_tokens.append({
                "text": self.normalize_text(entry["english"]),
                "display": entry["english"],
                "type": "english",
                "entry": entry
            })
            self.corpus_tokens.append({
                "text": self.normalize_text(entry["target"]),
                "display": entry["target"],
                "type": "target",
                "entry": entry
            })
            return entry

        except Exception:
            return None

    def search(
        self,
        query: str,
        selected_language: str = "all"
    ) -> Dict[str, Any]:
        """
        Subtask 4: Search dictionary and retrieve meaning bidirectionally.
        """
        norm_q = self.normalize_text(query)
        detected = self.detect_script(query)

        if not norm_q:
            return {
                "matches": [],
                "exact_match": None,
                "detected_language": detected,
                "normalized_query": "",
                "suggestions": [],
                "search_type": "none"
            }

        pool = self.entries
        if selected_language and selected_language != "all":
            pool = [e for e in pool if e.get("language") == selected_language]

        # Tier 1: Exact matches
        exact_matches = [
            e for e in pool
            if self.normalize_text(e.get("english", "")) == norm_q or
               self.normalize_text(e.get("target", "")) == norm_q or
               self.normalize_text(e.get("transliteration", "")) == norm_q
        ]

        if exact_matches:
            # Deduplicate exact_matches by (id, language)
            seen_exact = set()
            dedup_exact = []
            for e in exact_matches:
                k = (e.get("id"), e.get("language"))
                if k not in seen_exact:
                    seen_exact.add(k)
                    dedup_exact.append(e)
            exact_matches = dedup_exact

            related = [
                e for e in pool
                if e not in exact_matches and (
                    self.normalize_text(e.get("english", "")).startswith(norm_q) or
                    self.normalize_text(e.get("transliteration", "")).startswith(norm_q) or
                    self.normalize_text(e.get("target", "")).startswith(norm_q)
                )
            ]
            seen_all = set(seen_exact)
            dedup_related = []
            for e in related:
                k = (e.get("id"), e.get("language"))
                if k not in seen_all:
                    seen_all.add(k)
                    dedup_related.append(e)

            return {
                "matches": exact_matches + dedup_related,
                "exact_match": exact_matches[0],
                "detected_language": detected,
                "normalized_query": norm_q,
                "suggestions": [],
                "search_type": "exact"
            }

        # Dynamic online fallback: fetch exact word translation
        online_entry = self.fetch_online_entry(norm_q, selected_language)
        if online_entry:
            return {
                "matches": [online_entry],
                "exact_match": online_entry,
                "detected_language": detected,
                "normalized_query": norm_q,
                "suggestions": [],
                "search_type": "exact"
            }

        # Tier 2: Prefix and Substring matches
        partial_matches = [
            e for e in pool
            if self.normalize_text(e.get("english", "")) == norm_q or
               self.normalize_text(e.get("english", "")).startswith(norm_q) or
               self.normalize_text(e.get("transliteration", "")).startswith(norm_q) or
               self.normalize_text(e.get("target", "")).startswith(norm_q) or
               norm_q in self.normalize_text(e.get("english_meaning", ""))
        ]

        if partial_matches:
            seen_p = set()
            dedup_partial = []
            for e in partial_matches:
                k = (e.get("id"), e.get("language"))
                if k not in seen_p:
                    seen_p.add(k)
                    dedup_partial.append(e)

            return {
                "matches": dedup_partial,
                "exact_match": dedup_partial[0] if self.normalize_text(dedup_partial[0].get("english", "")) == norm_q else None,
                "detected_language": detected,
                "normalized_query": norm_q,
                "suggestions": [],
                "search_type": "partial"
            }

        # Tier 3: NLP Fuzzy Spell Suggestion
        suggestions = self.suggest_similar_words(query, selected_language, limit=6)

        return {
            "matches": [],
            "exact_match": None,
            "detected_language": detected,
            "normalized_query": norm_q,
            "suggestions": suggestions,
            "search_type": "fuzzy"
        }
