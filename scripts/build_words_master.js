import XLSX from 'xlsx';
import fs from 'fs';
import path from 'path';

const excelPath = path.resolve('source/Skema_Belajar_5Bulan_Lengkap.xlsx');
const outputPath = path.resolve('src/data/wordsMaster.ts');

console.log('Loading workbook from:', excelPath);
const workbook = XLSX.readFile(excelPath);

const wsMaster = workbook.Sheets['Master Kata (Bernomor)'];
const wsFamily = workbook.Sheets['Word Family & Kolokasi'];

const rowsMaster = XLSX.utils.sheet_to_json(wsMaster, { header: 1 });
const rowsFamily = XLSX.utils.sheet_to_json(wsFamily, { header: 1 });

console.log('Master rows count:', rowsMaster.length);
console.log('Family rows count:', rowsFamily.length);

const familyDict = {};
for (let i = 1; i < rowsFamily.length; i++) {
  const r = rowsFamily[i];
  if (!r || r[0] == null) continue;
  const no = parseInt(r[0]);
  familyDict[no] = {
    word: r[1],
    pos: r[2],
    noun_family: r[3] != null ? String(r[3]) : '-',
    verb_family: r[4] != null ? String(r[4]) : '-',
    adj_family: r[5] != null ? String(r[5]) : '-',
    adv_family: r[6] != null ? String(r[6]) : '-',
    collocations: r[7] != null ? String(r[7]).split(';').map(s => s.trim()).filter(Boolean) : []
  };
}

const words = [];
for (let i = 1; i < rowsMaster.length; i++) {
  const r = rowsMaster[i];
  if (!r || r[0] == null) continue;
  const no = parseInt(r[0]);
  const minggu = r[2] != null ? parseInt(r[2]) : 1;
  const sumber = r[3] != null ? String(r[3]).trim() : 'Vocabulary';
  const prioritas = r[4] != null ? String(r[4]).trim() : 'Tinggi';
  const kata = r[5] != null ? String(r[5]).trim() : '';
  const ipa = r[6] != null ? String(r[6]).trim() : '';
  const ipa_perkiraan = r[7] != null ? String(r[7]).trim() : '';
  const arti = r[8] != null ? String(r[8]).trim() : '';
  const contoh = r[9] != null ? String(r[9]).trim() : '';
  const sinonim_str = r[10] != null ? String(r[10]).trim() : '';
  const antonim_str = r[11] != null ? String(r[11]).trim() : '';

  if (!kata) continue;

  const fam = familyDict[no] || {};

  let pos = 'Noun';
  if (fam.pos) {
    const p = String(fam.pos).trim();
    if (p.toLowerCase().includes('verb')) pos = 'Verb';
    else if (p.toLowerCase().includes('adj')) pos = 'Adjective';
    else if (p.toLowerCase().includes('adv')) pos = 'Adverb';
    else pos = p;
  }

  const synonyms = sinonim_str ? sinonim_str.split(',').map(s => s.trim()).filter(Boolean) : [];
  const antonyms = antonim_str ? antonim_str.split(',').map(s => s.trim()).filter(Boolean) : [];
  const collocations = Array.isArray(fam.collocations) ? fam.collocations : (fam.collocations ? String(fam.collocations).split(';').map(s => s.trim()).filter(Boolean) : []);

  words.push({
    id: no,
    no: no,
    word: kata,
    pos: pos,
    ipa: ipa,
    ipa_perkiraan: ipa_perkiraan,
    meaning_id: arti,
    example_sentence: contoh,
    source: sumber,
    priority: prioritas,
    synonyms,
    antonyms,
    collocations,
    noun_family: fam.noun_family || '-',
    verb_family: fam.verb_family || '-',
    adj_family: fam.adj_family || '-',
    adv_family: fam.adv_family || '-',
    week: minggu
  });
}

console.log(`Generated ${words.length} master words.`);

const jsonOutputPath = path.resolve('src/data/words3655.json');
fs.writeFileSync(jsonOutputPath, JSON.stringify(words), 'utf-8');
console.log('Successfully written words3655.json at:', jsonOutputPath);

const tsContent = `import { Word } from '../types';
import rawWords from './words3655.json';

export const MASTER_WORDS: Word[] = rawWords as Word[];

export function getWordsRange(startNo: number, endNo: number): Word[] {
  return MASTER_WORDS.filter((w) => w.no >= startNo && w.no <= endNo);
}

export function getWordById(id: number): Word | undefined {
  return MASTER_WORDS.find((w) => w.id === id);
}
`;

fs.writeFileSync(outputPath, tsContent, 'utf-8');
console.log('Successfully written wordsMaster.ts at:', outputPath);
