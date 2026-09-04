import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './build-data.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const project = path.resolve(here, '..');
const source = path.resolve(project, '../../work/data');
const decode = buffer => new TextDecoder('shift_jis', { fatal: true }).decode(buffer).replace(/^\uFEFF/, '');
const clean = value => String(value || '').replace(/<[^>]*>/g, '').trim();
const selectTen = rows => Array.from({ length: 10 }, (_, index) => rows[Math.floor(index * (rows.length - 1) / 9)]);

const itemRows = parseCsv(decode(fs.readFileSync(path.join(source, 'chuo-items.csv')))).slice(1).filter(row => row.some(Boolean));
const scheduleRows = parseCsv(decode(fs.readFileSync(path.join(source, 'chuo-schedule.csv')))).slice(1).filter(row => row.some(Boolean));
const generated = JSON.parse(fs.readFileSync(path.join(project, 'data/items.json'), 'utf8'));
const items = selectTen(itemRows);
const schedules = selectTen(scheduleRows);
const evidence = [];

for (const item of items) {
  const generatedItem = generated.items.find(candidate => candidate.name === clean(item[3]) && candidate.category === clean(item[4]));
  if (!generatedItem) throw new Error(`公式品目と生成データが不一致: ${item[3]}`);
  for (const schedule of schedules) {
    const generatedSchedule = generated.schedules.find(candidate => candidate.town === clean(schedule[2]) && candidate.block === (clean(schedule[3]) || '全域'));
    if (!generatedSchedule) throw new Error(`公式町丁目と生成データが不一致: ${schedule[2]} ${schedule[3]}`);
    const officialDay = clean(schedule[['燃やすごみ','燃やさないごみ','プラマーク','資源','粗大ごみ'].indexOf(generatedItem.category) + 4]);
    if (generatedSchedule.days[generatedItem.category] !== officialDay) throw new Error(`曜日不一致: ${generatedItem.name} / ${generatedSchedule.town}`);
    evidence.push(`| ${evidence.length + 1} | ${generatedItem.name} | ${generatedItem.category} | ${generatedSchedule.town} ${generatedSchedule.block} | ${officialDay || '曜日データなし'} | PASS |`);
  }
}

const report = `# 中央区公式CSV 100ケース照合\n\n検証日: 2026-09-04  
対象: 公式品目CSVから等間隔10件 × 公式町丁目別曜日CSVから等間隔10件  
方法: CP932原文を再読込し、生成JSONの品目名、分別区分、町名、範囲、該当区分の通常曜日を照合  
結果: **${evidence.length}/${evidence.length} PASS**\n\n| No. | 品目 | 分別 | 町丁目 | 公式CSV通常曜日 | 結果 |\n|---:|---|---|---|---|---|\n${evidence.join('\n')}\n`;

const output = path.resolve(project, '../../workspace/audit/chuo-gomi-100-cases.md');
fs.writeFileSync(output, report);
console.log(`Verified ${evidence.length}/100 cases: ${output}`);
