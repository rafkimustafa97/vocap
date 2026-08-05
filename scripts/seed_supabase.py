import json
import re
import urllib.request
import ssl

SUPABASE_URL = "https://tfyuvlouxwbtnqchklxa.supabase.co"
SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRmeXV2bG91eHdidG5xY2hrbHhhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NTg4Mjk4OCwiZXhwIjoyMTAxNDU4OTg4fQ.Gae9b_7L9UZnlqUL9rBpbxyu7AmbTrRHhQR3VC24dho"

def seed_database():
    print("Loading enriched master words from wordsMaster.ts...")
    with open("src/data/wordsMaster.ts", "r", encoding="utf-8") as f:
        content = f.read()

    # Extract JSON string array from TS file
    match = re.search(r'export const MASTER_WORDS: Word\[\] = (\[.*\]);', content, re.DOTALL)
    if not match:
        print("Error: Could not find MASTER_WORDS in wordsMaster.ts")
        return

    words = json.loads(match.group(1))
    print(f"Loaded {len(words)} enriched words.")

    ctx = ssl.create_default_context()
    
    # Prepare master_words records for Supabase
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
            "example_sentence": w.get("example", ""),
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

    print("Seeding/updating master_words table in Supabase...")
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
            print(f" Error seeding chunk {i+1}: {e}")

    print("Supabase database seeding completed successfully!")

if __name__ == "__main__":
    seed_database()
