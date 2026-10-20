/**
 * 눈 단원용 데이터 추출 스크립트
 *
 * 전체 2,234개 부품에서 눈 관련 구조만 골라내고,
 * 계통을 눈 수업에 맞는 5개 묶음으로 다시 나눈 뒤,
 * 필요한 형상 데이터만 새 파일 하나로 다시 묶는다.
 *
 * 실행: node scripts/build-eye-atlas.mjs
 */
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { join } from 'node:path';

const SRC = 'source-data/models';
const OUT = 'public/models-eye';

// ── 눈 수업용 5개 묶음 ────────────────────────────────────────────────
// id는 코드에서 쓰는 값, name은 화면에 보이는 이름
export const GROUPS = [
  { id: 'eyeball', name: '눈알', color: '#c2d4da' },
  { id: 'eyemuscle', name: '눈 근육', color: '#b5675c' },
  { id: 'tear', name: '눈물 기관', color: '#7fa8c4' },
  { id: 'opticnerve', name: '시각 신경', color: '#d8b565' },
  { id: 'eyelid', name: '눈꺼풀', color: '#d3a389' },
];

// ── 영어 구조명 → { 한글명, 묶음 } ────────────────────────────────────
// 키는 좌우 표기를 뗀 소문자 기준명
const TERMS = {
  'cornea':                       { ko: '각막',           group: 'eyeball' },
  'sclera':                       { ko: '공막',           group: 'eyeball' },
  'iris':                         { ko: '홍채',           group: 'eyeball' },
  'lens':                         { ko: '수정체',         group: 'eyeball' },
  'choroid':                      { ko: '맥락막',         group: 'eyeball' },
  'retina':                       { ko: '망막',           group: 'eyeball' },
  'vitreous body':                { ko: '유리체',         group: 'eyeball' },
  'anterior chamber':             { ko: '앞방',           group: 'eyeball' },
  'suspensory ligament':          { ko: '섬모체띠',       group: 'eyeball' },
  'corona ciliaris':              { ko: '섬모체',         group: 'eyeball' },

  'superior rectus':              { ko: '위곧은근',       group: 'eyemuscle' },
  'inferior rectus':              { ko: '아래곧은근',     group: 'eyemuscle' },
  'medial rectus':                { ko: '안쪽곧은근',     group: 'eyemuscle' },
  'lateral rectus':               { ko: '가쪽곧은근',     group: 'eyemuscle' },
  'superior oblique':             { ko: '위빗근',         group: 'eyemuscle' },
  'inferior oblique':             { ko: '아래빗근',       group: 'eyemuscle' },
  'levator palpebrae superioris': { ko: '위눈꺼풀올림근', group: 'eyemuscle' },

  'lacrimal gland':               { ko: '눈물샘',         group: 'tear' },
  'lacrimal canaliculus':         { ko: '눈물소관',       group: 'tear' },
  'lacrimal sac':                 { ko: '눈물주머니',     group: 'tear' },
  'lacrimal lake':                { ko: '눈물호',         group: 'tear' },
  'nasolacrimal duct':            { ko: '코눈물관',       group: 'tear' },

  'optic nerve':                  { ko: '시각신경',       group: 'opticnerve' },
  'optic chiasm':                 { ko: '시각교차',       group: 'opticnerve' },
  'optic tract':                  { ko: '시각로',         group: 'opticnerve' },

  'tarsal plate':                 { ko: '눈꺼풀판',       group: 'eyelid' },
  'eyebrow':                      { ko: '눈썹',           group: 'eyelid' },
};

/** 영어 부품명에서 좌우 표기와 수식어를 떼어 기준명과 좌우를 얻는다. */
function normalize(raw) {
  let s = raw.trim();
  let side = '';

  // "Optic part of left retina" 같은 형태를 먼저 정리
  const optic = s.match(/^Optic part of (left|right)\s+(.+)$/i);
  if (optic) { side = optic[1].toLowerCase(); s = optic[2]; }

  // 앞에 붙은 Left / Right
  const lead = s.match(/^(Left|Right)\s+(.+)$/i);
  if (lead) { side = lead[1].toLowerCase(); s = lead[2]; }

  // "... of left eyeball", "... of right wrist" 처럼 뒤에 붙은 부위 수식
  const trail = s.match(/^(.+?)\s+of\s+(left|right)\s+.+$/i);
  if (trail) { if (!side) side = trail[2].toLowerCase(); s = trail[1]; }

  // "Tarsal plate of left upper eyelid" -> 위/아래 눈꺼풀 구분 보존
  const lid = raw.match(/(upper|lower)\s+eyelid/i);

  return { key: s.toLowerCase().trim(), side, lid: lid ? lid[1].toLowerCase() : '' };
}

function koreanName(raw) {
  const { key, side, lid } = normalize(raw);
  const term = TERMS[key];
  if (!term) return null;
  const sideKo = side === 'left' ? '왼쪽 ' : side === 'right' ? '오른쪽 ' : '';
  const lidKo = lid === 'upper' ? '위 ' : lid === 'lower' ? '아래 ' : '';
  return { ko: `${sideKo}${lidKo}${term.ko}`.trim(), group: term.group, base: term.ko };
}

// ── 실행 ──────────────────────────────────────────────────────────────
const atlas = JSON.parse(readFileSync(join(SRC, 'atlas.json'), 'utf8'));

// 1) 눈 부품 선별
const picked = [];
for (const p of atlas.parts) {
  const m = koreanName(p.name);
  if (!m) continue;
  // 손목 굽힘근지지띠(flexor retinaculum)가 retina 철자에 걸리는 것을 배제
  if (/retinaculum/i.test(p.name)) continue;
  picked.push({ part: p, ...m });
}

console.log(`눈 부품 ${picked.length}개 선별`);
const missing = Object.keys(TERMS).filter(k => !picked.some(x => normalize(x.part.name).key === k));
if (missing.length) console.log(`주의: 데이터에서 못 찾은 용어 -> ${missing.join(', ')}`);

// 2) 필요한 청크만 읽기
const chunkIds = [...new Set(picked.map(x => x.part.chunk))].sort((a, b) => a - b);
console.log(`필요한 원본 묶음: ${chunkIds.join(', ')}`);
const buffers = new Map();
for (const ci of chunkIds) {
  const file = join(SRC, `body-${ci}.bin`);
  if (!existsSync(file)) throw new Error(`원본 파일 없음: ${file}`);
  buffers.set(ci, readFileSync(file));
}

// 3) 형상 데이터를 새 파일 하나로 다시 묶기 (4바이트 정렬 유지)
const blocks = [];
let cursor = 0;
const align = () => { const pad = (4 - (cursor % 4)) % 4; if (pad) { blocks.push(Buffer.alloc(pad)); cursor += pad; } };

const newParts = picked.map((x, i) => {
  const p = x.part, src = buffers.get(p.chunk);

  align(); const posAt = cursor;
  const posLen = p.vertexCount * 3 * 4;
  blocks.push(src.subarray(p.positions, p.positions + posLen)); cursor += posLen;

  align(); const nrmAt = cursor;
  const nrmLen = p.vertexCount * 3 * 2;
  blocks.push(src.subarray(p.normals, p.normals + nrmLen)); cursor += nrmLen;

  align(); const idxAt = cursor;
  const idxLen = p.indexCount * 4;
  blocks.push(src.subarray(p.indices, p.indices + idxLen)); cursor += idxLen;

  return {
    id: p.id,
    name: x.ko,
    nameEn: p.name,
    conceptId: p.conceptId,
    system: x.group,
    chunk: 0,
    positions: posAt,
    normals: nrmAt,
    indices: idxAt,
    vertexCount: p.vertexCount,
    indexCount: p.indexCount,
    bounds: p.bounds,
  };
});

const bin = Buffer.concat(blocks);
console.log(`형상 데이터: ${(bin.length / 1048576).toFixed(2)} MB`);

// 4) 개념(묶음 이름) 정리 — 눈 부품만 포함된 것만 남기고 한글명을 붙인다
const partIds = new Set(newParts.map(p => p.id));
const koById = new Map(newParts.map(p => [p.id, p.name]));
const CONCEPT_KO = {
  'right eye': '오른쪽 눈 전체', 'left eye': '왼쪽 눈 전체',
  'right eyeball': '오른쪽 눈알', 'left eyeball': '왼쪽 눈알',
  'eyeball': '눈알', 'optic nerve': '시각신경', 'optic chiasm': '시각교차',
  'optic tract': '시각로', 'lacrimal gland': '눈물샘', 'eyebrow': '눈썹',
  'wall of right eyeball': '오른쪽 눈알 벽', 'wall of left eyeball': '왼쪽 눈알 벽',
  'orbital part of right eye': '오른쪽 눈확 부분', 'orbital part of left eye': '왼쪽 눈확 부분',
};
const newConcepts = [];
for (const c of atlas.concepts) {
  const kept = c.elements.filter(e => partIds.has(e));
  if (!kept.length) continue;
  if (kept.length < c.elements.length) continue; // 눈 밖 부품이 섞인 개념은 제외
  const ko = CONCEPT_KO[c.name.toLowerCase()];
  newConcepts.push({ id: c.id, name: ko ?? (kept.length === 1 ? koById.get(kept[0]) : c.name), elements: kept });
}
// 눈알 묶음을 수업용으로 다시 구성한다.
// 원본에서는 망막·앞방·섬모체가 눈알 개념 밖에 있어 단면 분해에서 빠진다.
for (const side of ['오른쪽', '왼쪽']) {
  const ball = newParts.filter(p => p.system === 'eyeball' && p.name.startsWith(side)).map(p => p.id);
  const whole = newParts.filter(p => p.name.startsWith(side)).map(p => p.id);
  const put = (name, elements) => {
    if (!elements.length) return;
    const at = newConcepts.findIndex(c => c.name === name);
    const entry = { id: `EYE:${side}:${name}`, name, elements };
    if (at >= 0) newConcepts[at] = entry; else newConcepts.push(entry);
  };
  put(`${side} 눈알`, ball);
  put(`${side} 눈 전체`, whole);
}

// 개별 부품도 검색되도록 1개짜리 개념 보강
for (const p of newParts) {
  if (newConcepts.some(c => c.elements.length === 1 && c.elements[0] === p.id)) continue;
  newConcepts.push({ id: p.conceptId + ':' + p.id, name: p.name, elements: [p.id] });
}

const out = {
  version: atlas.version,
  sex: atlas.sex,
  source: atlas.source,
  scope: '성인 남성 표준 인체 · 눈 단원',
  parts: newParts,
  concepts: newConcepts,
  chunks: [{ url: '/models-eye/eye-0.bin', bytes: bin.length, gzip: '/models-eye/eye-0.bin.gz', gzipBytes: 0 }],
  triangles: newParts.reduce((s, p) => s + p.indexCount / 3, 0),
  groups: GROUPS,
};

const gz = gzipSync(bin, { level: 9 });
out.chunks[0].gzipBytes = gz.length;

if (!existsSync(OUT)) mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'eye-0.bin'), bin);
writeFileSync(join(OUT, 'eye-0.bin.gz'), gz);
writeFileSync(join(OUT, 'atlas.json'), JSON.stringify(out));

const meta = readFileSync(join(OUT, 'atlas.json')).length;
console.log('');
console.log(`부품 ${newParts.length}개 · 삼각형 ${out.triangles.toLocaleString()}개 · 검색 항목 ${newConcepts.length}개`);
console.log(`형상 ${(bin.length / 1048576).toFixed(2)} MB -> 압축 ${(gz.length / 1048576).toFixed(2)} MB`);
console.log(`목록 파일 ${(meta / 1024).toFixed(0)} KB`);
console.log(`합계 내려받기 약 ${((gz.length + meta) / 1048576).toFixed(2)} MB`);
