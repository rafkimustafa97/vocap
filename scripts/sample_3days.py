import json
import sys

sys.stdout.reconfigure(encoding='utf-8')

with open(r'c:\Users\rafki\Documents\vocap\src\data\words3655.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

print("=== HARI 1 (Kata #1 - #30) ===")
for w in data[:30]:
    print(f"#{w['no']:02d}. {w['word']} ({w['pos']}) - IPA: {w['ipa']} -> {w['meaning_id']}")

print("\n=== HARI 2 (Kata #31 - #60) ===")
for w in data[30:60]:
    print(f"#{w['no']:02d}. {w['word']} ({w['pos']}) - IPA: {w['ipa']} -> {w['meaning_id']}")

print("\n=== HARI 3 (Kata #61 - #90) ===")
for w in data[60:90]:
    print(f"#{w['no']:02d}. {w['word']} ({w['pos']}) - IPA: {w['ipa']} -> {w['meaning_id']}")
