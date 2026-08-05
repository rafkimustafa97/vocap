import json
import re
import urllib.request
import ssl

ts_file_path = r'c:\Users\rafki\Documents\vocap\src\data\wordsMaster.ts'

print("Loading wordsMaster.ts...")
with open(ts_file_path, "r", encoding="utf-8") as f:
    content = f.read()

match = re.search(r'export const MASTER_WORDS: Word\[\] = (\[.*\]);', content, re.DOTALL)
if not match:
    print("Error: MASTER_WORDS not found in wordsMaster.ts")
    exit(1)

words = json.loads(match.group(1))
print(f"Loaded {len(words)} words.")

# Dictionary of Common Irregular Verbs (v1 -> (v2, v3, v_ing))
IRREGULAR_VERBS = {
    "be": ("was/were", "been", "being"),
    "have": ("had", "had", "having"),
    "do": ("did", "done", "doing"),
    "say": ("said", "said", "saying"),
    "go": ("went", "gone", "going"),
    "get": ("got", "gotten", "getting"),
    "make": ("made", "made", "making"),
    "know": ("knew", "known", "knowing"),
    "think": ("thought", "thought", "thinking"),
    "take": ("took", "taken", "taking"),
    "see": ("saw", "seen", "seeing"),
    "come": ("came", "come", "coming"),
    "find": ("found", "found", "finding"),
    "give": ("gave", "given", "giving"),
    "tell": ("told", "told", "telling"),
    "become": ("became", "become", "becoming"),
    "leave": ("left", "left", "leaving"),
    "put": ("put", "put", "putting"),
    "mean": ("meant", "meant", "meaning"),
    "keep": ("kept", "kept", "keeping"),
    "let": ("let", "let", "letting"),
    "begin": ("began", "begun", "beginning"),
    "show": ("showed", "shown", "showing"),
    "hear": ("heard", "heard", "hearing"),
    "run": ("ran", "run", "running"),
    "bring": ("brought", "brought", "bringing"),
    "write": ("wrote", "written", "writing"),
    "sit": ("sat", "sat", "sitting"),
    "stand": ("stood", "stood", "standing"),
    "lose": ("lost", "lost", "losing"),
    "pay": ("paid", "paid", "paying"),
    "meet": ("met", "met", "meeting"),
    "set": ("set", "set", "setting"),
    "lead": ("led", "led", "leading"),
    "understand": ("understood", "understood", "understanding"),
    "speak": ("spoke", "spoken", "speaking"),
    "read": ("read", "read", "reading"),
    "spend": ("spent", "spent", "spending"),
    "grow": ("grew", "grown", "growing"),
    "win": ("won", "won", "winning"),
    "buy": ("bought", "bought", "buying"),
    "build": ("built", "built", "building"),
    "fall": ("fell", "fallen", "falling"),
    "cut": ("cut", "cut", "cutting"),
    "sell": ("sold", "sold", "selling"),
    "break": ("broke", "broken", "breaking"),
    "drive": ("drove", "driven", "driving"),
    "draw": ("drew", "drawn", "drawing"),
    "choose": ("chose", "chosen", "choosing"),
    "teach": ("taught", "taught", "teaching"),
    "catch": ("caught", "caught", "catching"),
    "fly": ("flew", "flown", "flying"),
    "swim": ("swam", "swum", "swimming"),
    "throw": ("threw", "thrown", "throwing"),
    "wear": ("wore", "worn", "wearing"),
    "sing": ("sang", "sung", "singing"),
    "ring": ("rang", "rung", "ringing"),
    "drink": ("drank", "drunk", "drinking"),
    "eat": ("ate", "eaten", "eating"),
    "sleep": ("slept", "slept", "sleeping"),
    "forget": ("forgot", "forgotten", "forgetting"),
    "forgive": ("forgave", "forgiven", "forgiving"),
    "shake": ("shook", "shaken", "shaking"),
    "freeze": ("froze", "frozen", "freezing"),
    "hide": ("hid", "hidden", "hiding"),
    "strike": ("struck", "struck", "striking"),
    "bend": ("bent", "bent", "bending"),
    "send": ("sent", "sent", "sending"),
    "lend": ("lent", "lent", "lending"),
    "sweep": ("swept", "swept", "sweeping"),
    "creep": ("crept", "crept", "creeping"),
    "bleed": ("bled", "bled", "bleeding"),
    "feed": ("fed", "fed", "feeding"),
    "speed": ("sped", "sped", "speeding"),
    "burst": ("burst", "burst", "bursting"),
    "cost": ("cost", "cost", "costing"),
    "hit": ("hit", "hit", "hitting"),
    "hurt": ("hurt", "hurt", "hurting"),
    "shut": ("shut", "shut", "shutting"),
    "spread": ("spread", "spread", "spreading"),
    "split": ("split", "split", "splitting"),
    "rise": ("rose", "risen", "rising"),
    "arise": ("arose", "arisen", "arising"),
    "bear": ("bore", "borne", "bearing"),
    "beat": ("beat", "beaten", "beating"),
    "bite": ("bit", "bitten", "biting"),
    "blow": ("blew", "blown", "blowing"),
    "deal": ("dealt", "dealt", "dealing"),
    "dig": ("dug", "dug", "digging"),
    "dream": ("dreamt", "dreamt", "dreaming"),
    "feel": ("felt", "felt", "feeling"),
    "fight": ("fought", "fought", "fighting"),
    "flee": ("fled", "fled", "fleeing"),
    "hang": ("hung", "hung", "hanging"),
    "hold": ("held", "held", "holding"),
    "lay": ("laid", "laid", "laying"),
    "lie": ("lay", "lain", "lying"),
    "light": ("lit", "lit", "lighting"),
    "ride": ("rode", "ridden", "riding"),
    "seek": ("sought", "sought", "seeking"),
    "shine": ("shone", "shone", "shining"),
    "shoot": ("shot", "shot", "shooting"),
    "shrink": ("shrank", "shrunk", "shrinking"),
    "slide": ("slid", "slid", "sliding"),
    "spin": ("spun", "spun", "spinning"),
    "spit": ("spat", "spat", "spitting"),
    "steal": ("stole", "stolen", "stealing"),
    "stick": ("stuck", "stuck", "sticking"),
    "sting": ("stung", "stung", "stinging"),
    "stink": ("stank", "stunk", "stinking"),
    "swear": ("swore", "sworn", "swearing"),
    "tear": ("tore", "torn", "tearing"),
    "wake": ("woke", "woken", "waking"),
    "win": ("won", "won", "winning"),
    "wind": ("wound", "wound", "winding"),
}

NO_DOUBLE_CONSONANTS = {
    'visit', 'listen', 'happen', 'open', 'offer', 'enter', 'answer', 'differ', 'suffer',
    'benefit', 'alter', 'cover', 'discover', 'gather', 'murder', 'order', 'prefer', 'remember',
    'shudder', 'wonder', 'deliver', 'feature', 'measure', 'nurture', 'picture'
}

def generate_regular_inflections(v1):
    v = v1.lower().strip() if isinstance(v1, str) else str(v1).lower().strip()

    if v in IRREGULAR_VERBS:
        v2, v3, vIng = IRREGULAR_VERBS[v]
        return v, v2, v3, vIng

    let_v2 = v + 'ed'
    let_v3 = v + 'ed'
    let_vIng = v + 'ing'

    if v.endswith('e'):
        let_v2 = v + 'd'
        let_v3 = v + 'd'
        let_vIng = v.rstrip('e') + 'ing'
    elif v.endswith('y') and not re.search(r'[aeiou]y$', v):
        let_v2 = v[:-1] + 'ied'
        let_v3 = v[:-1] + 'ied'
    elif v in NO_DOUBLE_CONSONANTS:
        let_v2 = v + 'ed'
        let_v3 = v + 'ed'
        let_vIng = v + 'ing'
    elif re.search(r'[bcdfghjklmnpqrstvwxz][aeiou][bcdfghjklmnprstvz]$', v) and len(v) <= 6:
        last_char = v[-1]
        let_v2 = v + last_char + 'ed'
        let_v3 = v + last_char + 'ed'
        let_vIng = v + last_char + 'ing'

    return v, let_v2, let_v3, let_vIng

updated_verbs_count = 0

for w in words:
    pos = str(w.get('pos', '')).lower()
    word_name = str(w.get('word', '')).strip().lower()
    
    # Check if word is a verb
    is_verb = 'verb' in pos or w.get('v1') != '-'
    
    if is_verb:
        v1_base = w.get('v1') if w.get('v1') and w.get('v1') != '-' else word_name
        v1, v2, v3, vIng = generate_regular_inflections(v1_base)
        
        w['v1'] = v1
        w['v2'] = v2
        w['v3'] = v3
        w['v_ing'] = vIng
        updated_verbs_count += 1

print(f"Successfully generated V1-V3 & V-ing inflections for all {updated_verbs_count} VERBS!")

# Check walk specifically
walk_entry = next((w for w in words if w['word'].lower() == 'walk'), None)
print("Updated 'walk' entry:")
print(json.dumps(walk_entry, indent=2))

# Write updated ts file
new_ts_content = f"""import {{ Word }} from '../types';

export const MASTER_WORDS: Word[] = {json.dumps(words, indent=2)};

export function getWordById(id: number): Word | undefined {{
  return MASTER_WORDS.find((w) => w.id === id);
}}

export function getWordsRange(startNo: number, endNo: number): Word[] {{
  return MASTER_WORDS.filter((w) => w.no >= startNo && w.no <= endNo);
}}
"""

with open(ts_file_path, "w", encoding="utf-8") as f:
    f.write(new_ts_content)

print(f"Saved updated wordsMaster.ts successfully!")
