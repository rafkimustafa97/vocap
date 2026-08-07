import json

with open('src/data/words3655.json', 'r') as f:
    data = json.load(f)

for w in data:
    if w.get('word', '').lower() == 'adopt':
        print(json.dumps(w, indent=2))
