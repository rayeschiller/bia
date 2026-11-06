#!/usr/bin/env python3
"""Generates src/content/greetings.json (ContentBundle) for the Greetings unit."""
import json, os

import os
OUT = os.path.join(os.path.dirname(__file__), "..", "src", "content", "greetings.json")


def W(id, fa, translit, en, register, alt_en=None, formal=None, note=None, check=False):
    d = {"id": id, "fa": fa, "translit": translit, "en": en}
    if alt_en:
        d["alt_en"] = alt_en
    d["register"] = register
    if formal:
        d["formal"] = {"fa": formal[0], "translit": formal[1]}
    if note:
        d["note"] = note
    if check:
        d["needsNativeCheck"] = True
    return d


def P(id, fa, translit, en, wordIds, register, alt_en=None, formal=None, note=None, check=False):
    d = W(id, fa, translit, en, register, alt_en, formal, note, check)
    # keep key order close to the contract
    out = {k: d[k] for k in ("id", "fa", "translit", "en") }
    if "alt_en" in d:
        out["alt_en"] = d["alt_en"]
    out["wordIds"] = wordIds
    for k in ("register", "formal", "note", "needsNativeCheck"):
        if k in d:
            out[k] = d[k]
    return out


words = [
    # Lesson 1: hello / goodbye / thanks
    W("salam", "سلام", "salâm", "hello", "both", ["hi"],
      note="Works with anyone, any time of day. Iranians often say it twice or follow it right away with \"chetori?\"."),
    W("khoda-hafez", "خداحافظ", "khodâhâfez", "goodbye", "both", ["bye"],
      note="Literally \"God (be your) protector\". The standard goodbye; reply with the same."),
    W("mersi", "مرسی", "mersi", "thanks", "colloquial", ["thank you"],
      formal=("متشکرم", "motashakkeram"),
      note="Borrowed from French and the most common everyday thanks in Tehran."),
    W("mamnun", "ممنون", "mamnun", "thank you", "both", ["thanks"],
      note="A touch warmer than \"mersi\" and fine with elders. \"Kheyli mamnun\" = thanks a lot."),
    W("lotfan", "لطفاً", "lotfan", "please", "both",
      note="Goes before or after the request, like English \"please\"."),
    W("felan", "فعلاً", "fe'lan", "bye for now", "colloquial", ["see you", "for now", "bye"],
      note="Literally \"for now\". A casual \"see ya\" between friends."),
    W("ghorbunet", "قربونت", "ghorbunet", "your sacrifice (lit.)", "colloquial", ["for you"],
      formal=("قربانت", "ghorbânat"),
      note="Only used inside affectionate set phrases like \"ghorbunet beram\".", check=True),
    W("beram", "برم", "beram", "(that) I go", "colloquial", ["I go"],
      formal=("بروم", "beravam"),
      note="From \"raftan\", to go.", check=True),

    # Lesson 2: how are you & answers
    W("chetori", "چطوری", "chetori", "how are you?", "colloquial", ["how are you", "how's it going?"],
      formal=("چطور هستید", "chetor hastid"),
      note="Casual: for friends, siblings and people your age. With elders, use \"hâl-e shomâ chetore?\"."),
    W("khubam", "خوبم", "khubam", "I'm good", "both", ["I'm fine", "I'm well", "fine"],
      note="\"khub\" (good) + \"-am\" (I am)."),
    W("halet", "حالت", "hâlet", "your state (informal)", "colloquial", ["your condition"],
      note="\"hâl\" (state, how you're doing) + \"-et\" (your, informal)."),
    W("chetore", "چطوره", "chetore", "how is it?", "colloquial", ["how is"],
      formal=("چطور است", "chetor ast")),
    W("hal", "حال", "hâl", "state, how one is doing", "both", ["condition", "health"]),
    W("shoma", "شما", "shomâ", "you (polite)", "both", ["you", "you (plural)"],
      note="The respectful \"you\" for elders, in-laws and strangers; also plural \"you all\"."),
    W("to", "تو", "to", "you (informal)", "both", ["you"],
      note="For friends, family your age, kids. Using it with an elder can sound rude."),
    W("chi", "چی", "chi", "what", "colloquial", ["what?"],
      formal=("چه", "che")),
    W("bad", "بد", "bad", "bad", "both"),
    W("nistam", "نیستم", "nistam", "I'm not", "both", ["I am not"]),

    # Lesson 3: names, nice to meet you, welcome, time of day, yes/no
    W("esmet", "اسمت", "esmet", "your name (informal)", "colloquial", ["your name"],
      note="\"esm\" (name) + \"-et\" (your)."),
    W("chiye", "چیه", "chiye", "what is it?", "colloquial", ["what is"],
      formal=("چیست", "chist")),
    W("esmam", "اسمم", "esmam", "my name", "both",
      note="\"esm\" (name) + \"-am\" (my)."),
    W("maryame", "مریمه", "maryame", "is Maryam", "colloquial", ["Maryam is"],
      formal=("مریم است", "maryam ast"),
      note="Maryam + \"-e\" (is). Put your own name in its place.", check=True),
    W("khoshbakhtam", "خوشبختم", "khoshbakhtam", "nice to meet you", "both",
      ["pleased to meet you", "nice meeting you"],
      note="Literally \"I'm fortunate\". The other person usually answers \"manam hamintor\" (likewise)."),
    W("khosh", "خوش", "khosh", "pleasant, happy", "both", ["good", "happy"]),
    W("umadi", "اومدی", "umadi", "you came", "colloquial",
      formal=("آمدی", "âmadi"),
      note="Colloquial \"â\" often becomes \"u\" before m/n: âmadi -> umadi."),
    W("sobh", "صبح", "sobh", "morning", "both"),
    W("shab", "شب", "shab", "night", "both", ["evening"]),
    W("bekheyr", "بخیر", "bekheyr", "(be) good", "both", ["well", "good"],
      note="Literally \"with goodness\"; used in greetings like \"sobh bekheyr\"."),
    W("are", "آره", "âre", "yeah", "colloquial", ["yes"],
      formal=("بله", "bale"),
      note="Everyday \"yes\" with friends and family."),
    W("bale", "بله", "bale", "yes", "both", ["yes (polite)"],
      note="The polite \"yes\". Also how many people answer the phone, and a polite \"pardon?\"."),
    W("na", "نه", "na", "no", "colloquial", ["nope"],
      formal=("خیر", "kheyr"),
      note="Written نه but said \"na\"."),
]

phrases = [
    P("ghorbunet-beram", "قربونت برم", "ghorbunet beram", "thank you, dear",
      ["ghorbunet", "beram"], "colloquial",
      ["thanks, dear", "bye, dear", "may I be sacrificed for you"],
      formal=("قربانت بروم", "ghorbânat beravam"),
      note="Literally \"may I be sacrificed for you\". A warm, affectionate thanks or goodbye, "
           "used a lot with family and close friends (and by shopkeepers being sweet)."),

    P("halet-chetore", "حالت چطوره؟", "hâlet chetore", "how are you doing?",
      ["halet", "chetore"], "colloquial",
      ["how are you?", "how's it going?", "how are you"],
      formal=("حالتان چطور است؟", "hâletân chetor ast"),
      note="Friendly and informal, a little warmer than \"chetori?\"."),
    P("hal-e-shoma-chetore", "حال شما چطوره؟", "hâl-e shomâ chetore", "how are you? (polite)",
      ["hal", "shoma", "chetore"], "colloquial",
      ["how are you?", "how are you"],
      formal=("حال شما چطور است؟", "hâl-e shomâ chetor ast"),
      note="The respectful version for elders, in-laws and new people. Perfect for family dinners."),
    P("mersi-khubam", "مرسی، خوبم", "mersi khubam", "thanks, I'm good",
      ["mersi", "khubam"], "colloquial",
      ["I'm good, thanks", "thanks, I'm fine", "fine, thanks"],
      formal=("متشکرم، خوبم", "motashakkeram khubam")),
    P("bad-nistam", "بد نیستم", "bad nistam", "not bad",
      ["bad", "nistam"], "both", ["I'm not bad"]),
    P("to-chi", "تو چی؟", "to chi", "and you?",
      ["to", "chi"], "colloquial",
      ["what about you?", "how about you?", "and you"],
      formal=("و شما؟", "va shomâ"),
      note="Literally \"you what?\". With elders, swap in \"shomâ chi?\"."),

    P("esmet-chiye", "اسمت چیه؟", "esmet chiye", "what's your name?",
      ["esmet", "chiye"], "colloquial",
      ["what is your name?", "what's your name"],
      formal=("اسم شما چیست؟", "esm-e shomâ chist"),
      note="Casual. Politely: \"esmetun chiye?\"."),
    P("esmam-maryame", "اسمم مریمه", "esmam maryame", "my name is Maryam",
      ["esmam", "maryame"], "colloquial",
      ["I'm Maryam", "my name's Maryam"],
      formal=("اسم من مریم است", "esm-e man maryam ast"),
      note="Swap in your own name + \"-e\". After a name ending in a vowel it changes, e.g. \"esmam sârâst\".",
      check=True),
    P("khosh-umadi", "خوش اومدی", "khosh umadi", "welcome",
      ["khosh", "umadi"], "colloquial",
      ["welcome!", "glad you came"],
      formal=("خوش آمدید", "khosh âmadid"),
      note="Said when someone arrives, not a reply to \"thanks\". To a group or an elder: \"khosh umadin\". "
           "Expect a round of ta'ârof (polite back-and-forth) after it."),
    P("sobh-bekheyr", "صبح بخیر", "sobh bekheyr", "good morning",
      ["sobh", "bekheyr"], "both"),
    P("shab-bekheyr", "شب بخیر", "shab bekheyr", "good night",
      ["shab", "bekheyr"], "both",
      note="Said when leaving at night or going to bed, not as a hello."),
]


def ex(lesson, n, type, itemId=None, direction=None, distractors=None, pairs=None):
    e = {"id": f"greetings-{lesson}-ex-{n:02d}", "type": type}
    if direction:
        e["direction"] = direction
    if itemId:
        e["itemId"] = itemId
    if pairs:
        e["pairIds"] = pairs
    if distractors:
        e["distractorIds"] = distractors
    return e


MC, BS, MP, LC, TT = "multiple_choice", "build_sentence", "match_pairs", "listen_choose", "type_translit"
F2E, E2F = "fa_to_en", "en_to_fa"

l1 = [
    ex(1, 1, MC, "salam", F2E, ["mersi", "khoda-hafez"]),
    ex(1, 2, MC, "khoda-hafez", F2E, ["salam", "lotfan"]),
    ex(1, 3, MC, "mersi", F2E, ["salam", "khoda-hafez"]),
    ex(1, 4, LC, "salam", None, ["mersi", "khoda-hafez"]),
    ex(1, 5, MC, "mamnun", F2E, ["khoda-hafez", "salam"]),
    ex(1, 6, MC, "lotfan", F2E, ["mersi", "salam"]),
    ex(1, 7, TT, "salam", E2F),
    ex(1, 8, MC, "felan", F2E, ["salam", "lotfan"]),
    ex(1, 9, MP, pairs=["salam", "khoda-hafez", "mersi", "lotfan"]),
    ex(1, 10, MC, "ghorbunet-beram", F2E, ["salam", "lotfan"]),
    ex(1, 11, BS, "ghorbunet-beram", E2F, ["salam", "mersi"]),
    ex(1, 12, TT, "khoda-hafez", E2F),
]

l2 = [
    ex(2, 1, MC, "chetori", F2E, ["salam", "mersi"]),
    ex(2, 2, MC, "khubam", F2E, ["chetori", "khoda-hafez"]),
    ex(2, 3, MC, "mersi-khubam", F2E, ["chetori", "khoda-hafez"]),
    ex(2, 4, MC, "bad-nistam", F2E, ["khubam", "khoda-hafez"]),
    ex(2, 5, LC, "chetori", None, ["khubam", "mersi"]),
    ex(2, 6, MC, "to-chi", F2E, ["chetori", "bad-nistam"]),
    ex(2, 7, MC, "halet-chetore", F2E, ["to-chi", "khubam"]),
    ex(2, 8, MC, "hal-e-shoma-chetore", F2E, ["mersi-khubam", "khoda-hafez"]),
    ex(2, 9, MP, pairs=["salam", "chetori", "khubam", "mersi", "khoda-hafez"]),
    ex(2, 10, BS, "mersi-khubam", E2F, ["chetori", "salam"]),
    ex(2, 11, TT, "chetori", E2F),
    ex(2, 12, BS, "hal-e-shoma-chetore", E2F, ["halet", "chi"]),
]

l3 = [
    ex(3, 1, MC, "esmet-chiye", F2E, ["chetori", "to-chi"]),
    ex(3, 2, MC, "esmam-maryame", F2E, ["khubam", "esmet-chiye"]),
    ex(3, 3, MC, "khoshbakhtam", F2E, ["khubam", "khoda-hafez"]),
    ex(3, 4, BS, "esmet-chiye", E2F, ["esmam", "chi"]),
    ex(3, 5, MC, "khosh-umadi", F2E, ["khoshbakhtam", "khoda-hafez"]),
    ex(3, 6, MC, "sobh-bekheyr", F2E, ["shab-bekheyr", "salam"]),
    ex(3, 7, MC, "shab-bekheyr", F2E, ["sobh-bekheyr", "khosh-umadi"]),
    ex(3, 8, MC, "are", F2E, ["na", "mersi"]),
    ex(3, 9, MC, "na", F2E, ["are", "lotfan"]),
    ex(3, 10, MC, "bale", F2E, ["na", "lotfan"]),
    ex(3, 11, MP, pairs=["are", "na", "khoshbakhtam", "lotfan", "salam"]),
    ex(3, 12, TT, "khoshbakhtam", E2F),
]


def new_items(exs, seen):
    out = []
    for e in exs:
        for i in ([e["itemId"]] if "itemId" in e else []) + e.get("pairIds", []):
            if i not in seen:
                seen.add(i)
                out.append(i)
    return out


seen = set()
lessons = [
    {"id": "greetings-1", "title": "Hello & goodbye", "newItemIds": new_items(l1, seen), "exercises": l1},
    {"id": "greetings-2", "title": "How are you?", "newItemIds": new_items(l2, seen), "exercises": l2},
    {"id": "greetings-3", "title": "Nice to meet you", "newItemIds": new_items(l3, seen), "exercises": l3},
]

bundle = {
    "words": words,
    "phrases": phrases,
    "units": [{"id": "greetings", "title": "Greetings", "emoji": "\U0001F44B", "lessons": lessons}],
}

os.makedirs(os.path.dirname(OUT), exist_ok=True)
with open(OUT, "w", encoding="utf-8") as f:
    json.dump(bundle, f, ensure_ascii=False, indent=2)
    f.write("\n")
print("wrote", OUT)
