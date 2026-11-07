"""
NLP Model Training and Evaluation Benchmark Script.
Trains the Character N-Gram TF-IDF Vectorizer and validates spell suggestion accuracy.
"""

import time
import json
from dataset import INITIAL_DICTIONARY
from nlp_model import IndicNLPModel

def run_training_and_benchmark():
    print("=" * 65)
    print("  Bilingual Dictionary & Meaning Finder - Indic NLP Training")
    print("  Project by: R25DG033 Yanthungremo Ezung & R25DG013 Mohamed Haarish")
    print("=" * 65)

    print("\n[Step 1] Loading bilingual dictionary dataset...")
    total_entries = len(INITIAL_DICTIONARY)
    print(f"Loaded {total_entries} vocabulary entries across 5 Indic languages + English.")

    print("\n[Step 2] Training IndicNLPModel (TF-IDF Character N-Gram + Edit-Distance)...")
    start_time = time.time()
    model = IndicNLPModel(INITIAL_DICTIONARY)
    train_res = model.train()
    elapsed = time.time() - start_time

    print(f"Training completed successfully in {elapsed:.4f} seconds.")
    print(f" - Vocabulary Features: {train_res['vocabulary_size']}")
    print(f" - Total Tokens Indexed: {train_res['total_tokens_indexed']}")
    print(f" - N-Gram Range: {train_res['ngram_range']}")

    print("\n[Step 3] Evaluating NLP Spell Suggestion Accuracy on Typo Benchmark:")
    test_suite = [
        {"input": "helllo", "expected": "hello", "lang": "all"},
        {"input": "wator", "expected": "water", "lang": "all"},
        {"input": "boook", "expected": "book", "lang": "all"},
        {"input": "namastee", "expected": "namaste", "lang": "hi"},
        {"input": "vanakam", "expected": "vanakkam", "lang": "ta"},
        {"input": "neeruu", "expected": "neeru", "lang": "kn"},
        {"input": "vellamm", "expected": "vellam", "lang": "ml"},
    ]

    correct_predictions = 0
    print("-" * 65)
    print(f"{'Input Typo':<15} | {'Expected':<12} | {'Top Prediction':<15} | {'Sim %':<7} | {'Status'}")
    print("-" * 65)

    for item in test_suite:
        query = item["input"]
        expected = item["expected"]
        lang = item["lang"]

        suggestions = model.suggest_similar_words(query, selected_language=lang, limit=3)
        top_match = suggestions[0]["word"] if suggestions else "None"
        top_sim = suggestions[0]["similarity"] if suggestions else 0.0

        is_correct = any(s["word"].lower() == expected.lower() for s in suggestions)
        if is_correct:
            correct_predictions += 1
            status = "PASS (Top-3)" if top_match.lower() != expected.lower() else "PASS (Top-1)"
        else:
            status = "FAIL"

        print(f"{query:<15} | {expected:<12} | {top_match:<15} | {top_sim:<7} | {status}")

    accuracy = (correct_predictions / len(test_suite)) * 100
    print("-" * 65)
    print(f"Spell Suggestion Top-3 Accuracy: {accuracy:.1f}% ({correct_predictions}/{len(test_suite)})")
    print("=" * 65)

    report = {
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "training_time_seconds": round(elapsed, 4),
        "total_entries": total_entries,
        "vocabulary_size": train_res["vocabulary_size"],
        "accuracy_score": accuracy,
        "status": "READY"
    }

    with open("training_report.json", "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)
    print("Model report saved to backend/training_report.json\n")
    return model

if __name__ == "__main__":
    run_training_and_benchmark()
