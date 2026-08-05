import json
import urllib.request
import ssl

SUPABASE_URL = "https://tfyuvlouxwbtnqchklxa.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmeXV2bG91eHdidG5xY2hrbHhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg4Mjk4OCwiZXhwIjoyMTAxNDU4OTg4fQ.Gae9b_7L9UZnlqUL9rBpbxyu7AmbTrRHhQR3VC24dho"

def seed_database():
    print("Loading 3,655 master words from json...")
    with open("src/data/words3655.json", "r", encoding="utf-8") as f:
        words = json.load(f)
    print(f"Loaded {len(words)} words.")

    ctx = ssl.create_default_context()
    
    # 1. Prepare master_words records
    master_records = []
    for w in words:
        master_records.append({
            "id": w["id"],
            "no_master": w["no"],
            "word": w["word"],
            "pos": w["pos"],
            "ipa": w.get("ipa", ""),
            "ipa_perkiraan": w.get("ipa_perkiraan", ""),
            "meaning_id": w["meaning_id"],
            "example_sentence": w.get("example_sentence", ""),
            "source": w.get("source", "AWL"),
            "priority": w.get("priority", "Tinggi"),
            "synonyms": w.get("synonyms", []),
            "antonyms": w.get("antonyms", []),
            "collocations": w.get("collocations", []),
            "prefix_info": w.get("prefix_info", ""),
            "suffix_info": w.get("suffix_info", ""),
            "verb_type": w.get("verb_type", "transitive"),
            "week": w.get("week", 1)
        })

    # Bulk insert in chunks of 500
    chunk_size = 500
    total_chunks = (len(master_records) + chunk_size - 1) // chunk_size

    print("Seeding master_words table...")
    for i in range(total_chunks):
        chunk = master_records[i * chunk_size : (i + 1) * chunk_size]
        req = urllib.request.Request(
            f"{SUPABASE_URL}/rest/v1/master_words",
            data=json.dumps(chunk).encode("utf-8"),
            headers={
                "apikey": SERVICE_KEY,
                "Authorization": f"Bearer {SERVICE_KEY}",
                "Content-Type": "application/json",
                "Prefer": "resolution=merge-duplicates"
            },
            method="POST"
        )
        try:
            with urllib.request.urlopen(req, context=ctx) as res:
                print(f" Chunk {i+1}/{total_chunks} seeded successfully (Status {res.status})")
        except Exception as e:
            print(f" Chunk {i+1}/{total_chunks} failed: {e}")
            return False

    print("Successfully seeded 3,655 master words into Supabase!")
    return True

if __name__ == "__main__":
    seed_database()
