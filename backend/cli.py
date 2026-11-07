"""
Interactive CLI for testing the Indic NLP Bilingual Dictionary directly in Python.
"""

from dataset import INITIAL_DICTIONARY, SUPPORTED_LANGUAGES
from nlp_model import IndicNLPModel

def main():
    print("=" * 60)
    print("  Bilingual Dictionary and Meaning Finder - CLI Test Tool")
    print("  Indic NLP Model (Python & Scikit-Learn)")
    print("=" * 60)

    model = IndicNLPModel(INITIAL_DICTIONARY)

    print("\nSupported Languages:")
    for l in SUPPORTED_LANGUAGES:
        print(f" - [{l['code']}] {l['name']} ({l['native_name']})")

    print("\nCommands:")
    print(" - Type any word to search (e.g. 'water', 'வணக்கம்', 'namaste')")
    print(" - Type intentional typos to test spell-check (e.g. 'helllo', 'wator')")
    print(" - Type 'exit' to quit\n")

    while True:
        try:
            query = input("\nEnter word to lookup > ").strip()
            if not query or query.lower() == "exit":
                print("Exiting CLI. Goodbye!")
                break

            result = model.search(query)
            stype = result.get("search_type")

            if stype == "exact":
                entry = result["exact_match"]
                print(f"\n[EXACT MATCH FOUND]")
                print(f"  English:        {entry['english']}")
                print(f"  Local Script:   {entry['target']}")
                print(f"  Transliteration:/{entry['transliteration']}/")
                print(f"  Language:       {entry['language']}")
                print(f"  Part of Speech: {entry['part_of_speech']}")
                print(f"  English Meaning:{entry['english_meaning']}")
                print(f"  Local Meaning:  {entry['target_meaning']}")

            elif stype == "partial":
                matches = result["matches"]
                print(f"\n[PARTIAL MATCHES FOUND: {len(matches)}]")
                for idx, m in enumerate(matches[:5], 1):
                    print(f"  {idx}. {m['target']} ({m['transliteration']}) -> {m['english']} [{m['language']}]")

            elif stype == "fuzzy":
                suggestions = result["suggestions"]
                print(f"\n[MISSPELLED / UNAVAILABLE - NLP SPELL SUGGESTIONS]")
                if not suggestions:
                    print("  No close candidates found.")
                else:
                    for idx, s in enumerate(suggestions, 1):
                        print(f"  {idx}. {s['word']} - Similarity: {s['similarity']}% (dist: {s['distance']})")

        except (KeyboardInterrupt, EOFError):
            print("\nExiting CLI.")
            break

if __name__ == "__main__":
    main()
