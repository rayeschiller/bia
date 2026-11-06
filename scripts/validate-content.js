// node validate.js <bundle.json>
const fs = require("fs");
const file = process.argv[2];
const errs = [], warns = [];
let b;
try { b = JSON.parse(fs.readFileSync(file, "utf8")); } catch (e) { console.log("FAIL: JSON parse", e.message); process.exit(1); }
console.log("OK: JSON parses");

const TYPES = ["multiple_choice", "build_sentence", "match_pairs", "listen_choose", "type_translit"];
const REG = ["colloquial", "formal", "both"];
const words = new Map(), phrases = new Map(), allIds = new Set();
for (const w of b.words) { if (allIds.has(w.id)) errs.push("dup id " + w.id); allIds.add(w.id); words.set(w.id, w); }
for (const p of b.phrases) { if (allIds.has(p.id)) errs.push("dup id " + p.id); allIds.add(p.id); phrases.set(p.id, p); }

const WORD_KEYS = ["id", "fa", "translit", "en", "alt_en", "register", "formal", "note", "needsNativeCheck"];
const PHRASE_KEYS = [...WORD_KEYS, "wordIds"];
const arabic = /[يكى]/; // Arabic yeh, kaf, alef maksura
const translitOk = /^[a-zâ' -]+$/;
function checkItem(x, keys) {
  for (const k of Object.keys(x)) if (!keys.includes(k)) errs.push(`${x.id}: unknown key ${k}`);
  for (const k of ["id", "fa", "translit", "en", "register"]) if (typeof x[k] !== "string" || !x[k]) errs.push(`${x.id}: missing ${k}`);
  if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(x.id)) errs.push(`${x.id}: id not kebab-case`);
  if (!REG.includes(x.register)) errs.push(`${x.id}: bad register`);
  const fas = [x.fa, x.formal && x.formal.fa].filter(Boolean);
  for (const f of fas) if (arabic.test(f)) errs.push(`${x.id}: Arabic ي/ك in "${f}"`);
  const trs = [x.translit, x.formal && x.formal.translit].filter(Boolean);
  for (const t of trs) {
    if (t !== t.toLowerCase()) errs.push(`${x.id}: translit not lowercase "${t}"`);
    if (!translitOk.test(t)) errs.push(`${x.id}: translit has odd chars "${t}"`);
    if (/  /.test(t) || t.trim() !== t) errs.push(`${x.id}: translit spacing "${t}"`);
  }
  if (x.formal && (!x.formal.fa || !x.formal.translit)) errs.push(`${x.id}: incomplete formal`);
  if (x.formal && x.formal.fa === x.fa) errs.push(`${x.id}: formal identical to fa`);
}
b.words.forEach(w => checkItem(w, WORD_KEYS));
b.phrases.forEach(p => {
  checkItem(p, PHRASE_KEYS);
  if (!Array.isArray(p.wordIds) || !p.wordIds.length) errs.push(`${p.id}: no wordIds`);
  for (const w of p.wordIds || []) if (!words.has(w)) errs.push(`${p.id}: wordId ${w} missing`);
  // tiles should rebuild the phrase (ignoring punctuation)
  const strip = s => s.replace(/[؟?،,.!]/g, "").trim();
  const built = p.wordIds.map(w => words.get(w) && words.get(w).fa).join(" ");
  if (strip(built) !== strip(p.fa)) errs.push(`${p.id}: tiles "${built}" != fa "${p.fa}"`);
  const bt = p.wordIds.map(w => words.get(w) && words.get(w).translit).join(" ");
  if (bt !== p.translit && bt.replace(/ /g, "") !== p.translit.replace(/-e /g, " ").replace(/ /g, "")) warns.push(`${p.id}: tile translit "${bt}" vs "${p.translit}"`);
});

const exIds = new Set(); const introduced = new Set();
for (const u of b.units) {
  for (const l of u.lessons) {
    const n = l.exercises.length;
    if (n < 10 || n > 12) errs.push(`${l.id}: ${n} exercises`);
    const types = new Set(l.exercises.map(e => e.type));
    if (types.size < 4) errs.push(`${l.id}: only ${types.size} types`);
    for (const i of l.newItemIds) if (!allIds.has(i)) errs.push(`${l.id}: newItemId ${i} missing`);
    const lessonNew = new Set(l.newItemIds);
    const seenHere = new Set();
    for (const e of l.exercises) {
      if (exIds.has(e.id)) errs.push("dup exercise id " + e.id); exIds.add(e.id);
      if (allIds.has(e.id)) errs.push("exercise id collides with item " + e.id);
      if (!TYPES.includes(e.type)) errs.push(`${e.id}: bad type`);
      const refs = [e.itemId, ...(e.pairIds || []), ...(e.distractorIds || [])].filter(Boolean);
      for (const r of refs) if (!allIds.has(r)) errs.push(`${e.id}: ref ${r} missing`);
      const known = id => introduced.has(id) || seenHere.has(id);
      if (e.type === "match_pairs") {
        if (!e.pairIds || e.pairIds.length < 4 || e.pairIds.length > 5) errs.push(`${e.id}: pairIds count`);
        for (const p of e.pairIds || []) {
          if (!words.has(p)) errs.push(`${e.id}: pair ${p} not a Word`);
          if (!known(p)) errs.push(`${e.id}: pair ${p} not introduced yet`);
        }
      } else {
        if (!e.itemId) errs.push(`${e.id}: no itemId`);
        if (e.distractorIds && e.distractorIds.includes(e.itemId)) errs.push(`${e.id}: item is its own distractor`);
      }
      if (e.type === "build_sentence") {
        if (!phrases.has(e.itemId)) errs.push(`${e.id}: build_sentence on non-phrase`);
        const d = e.distractorIds || [];
        if (d.length < 1 || d.length > 3) errs.push(`${e.id}: build distractors ${d.length}`);
        for (const x of d) {
          if (!words.has(x)) errs.push(`${e.id}: tile distractor ${x} not a Word`);
          if (phrases.get(e.itemId).wordIds.includes(x)) errs.push(`${e.id}: distractor ${x} is in the answer`);
        }
      }
      if ((e.type === "multiple_choice" || e.type === "listen_choose") && (!e.distractorIds || e.distractorIds.length < 2)) errs.push(`${e.id}: needs >=2 distractors`);
      if ((e.type === "type_translit" || e.type === "build_sentence" || e.type === "listen_choose") && !known(e.itemId))
        errs.push(`${e.id}: ${e.type} on ${e.itemId} before it was introduced`);
      // same-meaning distractors
      const en = id => (words.get(id) || phrases.get(id)).en.toLowerCase();
      if (e.itemId) for (const d of e.distractorIds || []) {
        const it = words.get(e.itemId) || phrases.get(e.itemId); const di = words.get(d) || phrases.get(d);
        const a = [it.en, ...(it.alt_en || [])].map(s => s.toLowerCase()); const c = [di.en, ...(di.alt_en || [])].map(s => s.toLowerCase());
        if (e.type !== "build_sentence" && a.some(x => c.includes(x))) errs.push(`${e.id}: distractor ${d} shares a meaning with ${e.itemId}`);
      }
      for (const r of [e.itemId, ...(e.pairIds || [])].filter(Boolean)) seenHere.add(r);
    }
    // newItemIds should be exactly the items first tested here
    const first = [...seenHere].filter(i => !introduced.has(i));
    for (const i of first) if (!lessonNew.has(i)) errs.push(`${l.id}: ${i} first tested here but not in newItemIds`);
    for (const i of lessonNew) if (introduced.has(i) || !seenHere.has(i)) errs.push(`${l.id}: newItemId ${i} not first tested here`);
    seenHere.forEach(i => introduced.add(i));
    console.log(`${l.id}: ${n} exercises, types=${[...types].join(",")}, new=${l.newItemIds.length}`);
  }
  const unitTypes = new Set(u.lessons.flatMap(l => l.exercises.map(e => e.type)));
  if (unitTypes.size !== 5) errs.push(`${u.id}: unit uses ${unitTypes.size}/5 types`);
}
const untested = [...allIds].filter(i => !introduced.has(i));
console.log(`words=${b.words.length} phrases=${b.phrases.length} exercises=${exIds.size}`);
console.log("tile-only (never tested directly):", untested.join(", "));
console.log("needsNativeCheck:", [...b.words, ...b.phrases].filter(x => x.needsNativeCheck).map(x => x.id).join(", "));
warns.forEach(w => console.log("WARN:", w));
if (errs.length) { errs.forEach(e => console.log("FAIL:", e)); process.exit(1); }
console.log("ALL CHECKS PASSED");
