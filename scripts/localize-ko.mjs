/**
 * 화면 문구 한글화 스크립트
 * app/page.tsx 와 web/index.html 의 영어 문구를 한국어로 바꾼다.
 * 바뀌지 않은 항목이 있으면 경고를 내보내 누락을 막는다.
 *
 * 실행: node scripts/localize-ko.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const edits = [
  // ── 데이터 경로 ──
  ["'/models/atlas.json'", "'/models-eye/atlas.json'"],

  // ── 기본으로 검색창에 뜨는 추천 항목 ──
  ["['heart','brain','liver','stomach','spleen','pancreas','urinary bladder','trachea']",
   "['오른쪽 눈 전체','오른쪽 눈알','각막','홍채','수정체','망막','시각신경','눈물샘']"],

  // ── 눈알만 / 눈 주변 프리셋 ──
  ["state.visible.length===1&&state.visible[0]==='skeletal'", "state.visible.length===1&&state.visible[0]==='eyeball'"],
  ["visible:['skeletal']", "visible:['eyeball']"],
  ["}))}>Skeleton</Button>", "}))}>눈알만</Button>"],
  ["state.visible.length===6&&['cardiac','respiratory','digestive','urinary','endocrine','reproductive'].every(id=>state.visible.includes(id as SystemId))",
   "state.visible.length===4&&['eyemuscle','tear','opticnerve','eyelid'].every(id=>state.visible.includes(id as SystemId))"],
  ["visible:['cardiac','respiratory','digestive','urinary','endocrine','reproductive']",
   "visible:['eyemuscle','tear','opticnerve','eyelid']"],
  ["}))}>Organs</Button>", "}))}>눈 주변</Button>"],
  ["}))}>All</Button>", "}))}>전체</Button>"],

  // ── 머리말 ──
  ["INTERACTIVE ANATOMY", "3D 눈 해부 학습"],
  ["<h1>Human Atlas<Badge", "<h1>눈의 구조<Badge"],
  ["modeled pieces <span>·</span> BodyParts3D", "개 부품 <span>·</span> 보건 수업용"],
  ["{atlas?atlas.parts.length.toLocaleString():'2,234'}", "{atlas?atlas.parts.length.toLocaleString():'59'}"],

  // ── 검색 ──
  ['aria-label="Search anatomy"', 'aria-label="구조 검색"'],
  ["<span>Find a structure</span>", "<span>구조 찾기</span>"],
  ["<span>Find a structure</span><Button", "<span>구조 찾기</span><Button"],
  ['aria-label="About this atlas"', 'aria-label="자료 안내"'],
  ['aria-label="Close search"', 'aria-label="검색 닫기"'],
  ['placeholder="Heart, femur, cranial nerve…"', 'placeholder="각막, 수정체, 눈물샘…"'],
  ['aria-label="Search named anatomical structures"', 'aria-label="구조 이름으로 검색"'],
  ["<ComboboxEmpty>No structures match your search.</ComboboxEmpty>", "<ComboboxEmpty>찾는 구조가 없습니다.</ComboboxEmpty>"],
  ["{c.elements.length} {c.elements.length===1?'piece':'pieces'}", "{c.elements.length}개"],
  ["{query?'Showing up to 80 matches. Refine your search to find smaller structures.':'Start with a major organ, or search every named structure.'}",
   "{query?'이름의 일부만 넣어도 찾을 수 있습니다.':'눈의 부위 이름을 넣어 보세요.'}"],
  ['aria-label="Find anatomy"', 'aria-label="구조 찾기"'],

  // ── 묶음 패널 ──
  ['aria-label="Anatomical layers"', 'aria-label="부위 묶음"'],
  ["<span>Systems</span>", "<span>부위 묶음</span>"],
  ['aria-label="Close systems"', 'aria-label="묶음 닫기"'],
  ["title={`Show only ${s.name.toLowerCase()}`}", "title={`${s.name}만 보기`}"],
  ["aria-label={`Show ${s.name.toLowerCase()}`}", "aria-label={`${s.name} 켜고 끄기`}"],
  ["<span>{visibleCount.toLocaleString()} pieces visible</span>", "<span>{visibleCount.toLocaleString()}개 보이는 중</span>"],
  ["}))}>Hide all</Button>", "}))}>모두 숨기기</Button>"],

  // ── 보기 조작 ──
  ['aria-label="Camera controls"', 'aria-label="보기 조작"'],
  ["['¾','F','S','B']", "['¾','앞','옆','뒤']"],
  ["title={`${v} view`} aria-label={`${v} view`}",
   "title={({'three-quarter':'비스듬히 보기',front:'앞에서 보기',side:'옆에서 보기',back:'뒤에서 보기'} as Record<string,string>)[v]} aria-label={({'three-quarter':'비스듬히 보기',front:'앞에서 보기',side:'옆에서 보기',back:'뒤에서 보기'} as Record<string,string>)[v]}"],
  ["aria-label={state.rotate?'Pause rotation':'Rotate body'} title=\"Auto rotate\"",
   "aria-label={state.rotate?'회전 멈추기':'자동 회전'} title=\"자동 회전\""],
  ['aria-label="Reset view and layers" title="Reset"', 'aria-label="처음 상태로" title="처음으로"'],

  // ── 화면 아래 이름표 ──
  ["'SELECTED STRUCTURE'", "'선택한 구조'"],
  ["'ANATOMICAL INVENTORY'", "'부품 목록'"],
  ["'SEPARATED STRUCTURES'", "'분해하는 중'"],
  ["'ADULT HUMAN · MALE'", "'사람의 눈'"],

  // ── 아래 조작 막대 ──
  ['aria-label="Open system layers"><Layers3 size={20}/><span>Systems</span>', 'aria-label="묶음 열기"><Layers3 size={20}/><span>묶음</span>'],
  ['<label id="explode-label">Explode anatomy</label>', '<label id="explode-label">눈 분해하기</label>'],
  ["<span>Assembled</span><span>Every piece</span>", "<span>합친 상태</span><span>모두 분해</span>"],
  ['aria-label="Assemble and reset"><RotateCcw size={18}/><span>Reset</span>', 'aria-label="처음 상태로"><RotateCcw size={18}/><span>처음으로</span>'],

  // ── 바닥글 ──
  ["{state.explode>.8?'Drag to pan':'Drag to orbit'} <b>·</b> Pinch to zoom <b>·</b> Tap to inspect",
   "{state.explode>.8?'끌어서 이동':'끌어서 회전'} <b>·</b> 휠로 확대 <b>·</b> 눌러서 설명 보기"],
  ["Source & credits <ArrowUpRight", "자료 출처 <ArrowUpRight"],

  // ── 불러오는 중 / 오류 ──
  ["<strong>Preparing the anatomy</strong>", "<strong>눈 자료를 준비하고 있습니다</strong>"],
  ["<span>{progress}% · Loading {atlas?.parts.length.toLocaleString()??'2,234'} pieces</span>",
   "<span>{progress}% · 부품 {atlas?.parts.length.toLocaleString()??'59'}개 불러오는 중</span>"],
  ["}}>Reload viewer</Button>", "}}>다시 불러오기</Button>"],
  ["throw new Error('The anatomy catalogue could not be loaded.')", "throw new Error('눈 해부 자료를 불러오지 못했습니다.')"],

  // ── 설명 패널 ──
  ["{system?.name??'ANATOMY'}", "{system?.name??'눈'}"],
  ["<span className=\"context-note\">System overview · structure identified from source anatomy</span>",
   "<span className=\"context-note\">묶음 전체 설명입니다</span>"],
  ["<span>Atlas reference<strong>{chosen?.id}</strong></span>", "<span>자료 번호<strong>{chosen?.id}</strong></span>"],
  ["<span>Selected pieces<strong>{state.selected.length.toLocaleString()}</strong></span>", "<span>선택한 조각<strong>{state.selected.length.toLocaleString()}개</strong></span>"],
  ["<h3>Included structures</h3>", "<h3>포함된 구조</h3>"],
  ["<p>And {selectedParts.length-50} more modeled pieces.</p>", "<p>외 {selectedParts.length-50}개가 더 있습니다.</p>"],
  ["View anatomical source <ArrowUpRight", "원본 자료 보기 <ArrowUpRight"],
  ["{state.isolate?'Show surrounding anatomy':'Isolate structure'}", "{state.isolate?'주변 구조 함께 보기':'이 구조만 보기'}"],
  [">Clear selection</Button>", ">선택 해제</Button>"],

  // ── 자료 안내 ──
  ["<div className=\"eyebrow\">SOURCE & SCOPE</div>", "<div className=\"eyebrow\">자료 출처와 범위</div>"],
  ["<SheetTitle className=\"structure-title\">A body, revealed.</SheetTitle>", "<SheetTitle className=\"structure-title\">눈의 구조 살펴보기</SheetTitle>"],
  ["<SheetDescription>Explore the adult male reference anatomy from BodyParts3D.</SheetDescription>",
   "<SheetDescription>보건 수업을 위해 만든 3차원 눈 해부 자료입니다.</SheetDescription>"],
  ["<p><strong>Male · BodyParts3D</strong><br/>2,234 individual meshes and 3,432 named concepts from an adult male reference anatomy.</p>",
   "<p><strong>보건 수업용 눈 단원</strong><br/>성인 표준 인체 자료에서 눈과 관련된 부품 59개를 골라 담았습니다. 눈알, 눈 근육, 눈물 기관, 시각 신경, 눈꺼풀 다섯 묶음으로 나누어 두었습니다.</p>"],
  ["<p>This reference does not contain every human structure or variation. Named concepts can contain multiple pieces; each source mesh is rendered once.</p>",
   "<p>사람마다 생김새에 차이가 있으므로 이 자료가 모든 경우를 담지는 않습니다. 하나의 이름이 여러 조각으로 이루어진 경우도 있습니다.</p>"],
  ["<p>Colors and system groupings are designed for exploration. The geometry is simplified for the web, and short explanations provide general educational context. This is an anatomical reference, not a diagnostic or surgical tool.</p>",
   "<p>색과 묶음은 학습을 돕기 위해 정한 것입니다. 형상은 웹에서 빠르게 열리도록 단순하게 다듬었습니다. 학습용 자료이며 진단이나 치료에 쓰는 자료가 아닙니다.</p>"],
  ["<h3>Source</h3>", "<h3>원본 자료</h3>"],
  ["<p>BodyParts3D, © The Database Center for Life Science licensed under CC Attribution 4.0 International.</p>",
   "<p>BodyParts3D, © The Database Center for Life Science. CC Attribution 4.0 International 조건에 따라 사용했습니다. 화면과 설명은 한국 중학교 보건 수업에 맞추어 새로 구성했습니다.</p>"],
  [">Dataset license <ArrowUpRight", ">원본 자료 이용 조건 <ArrowUpRight"],
  [">Original geometry & metadata <ArrowUpRight", ">원본 형상과 목록 <ArrowUpRight"],
  [">Read the source publication <ArrowUpRight", ">원본 자료 논문 <ArrowUpRight"],
];

const file = 'app/page.tsx';
let src = readFileSync(file, 'utf8');
let applied = 0;
const missed = [];
for (const [from, to] of edits) {
  if (!src.includes(from)) { missed.push(from.slice(0, 70)); continue; }
  src = src.split(from).join(to);
  applied++;
}
writeFileSync(file, src);

console.log(`${file}: ${applied}/${edits.length}개 문구 교체`);
if (missed.length) {
  console.log('');
  console.log('찾지 못한 문구:');
  missed.forEach(m => console.log('  · ' + m));
}

// 남아 있는 영어 문구 점검
const leftover = [...src.matchAll(/>([A-Z][A-Za-z][A-Za-z .,&'’-]{4,})</g)].map(m => m[1].trim());
if (leftover.length) {
  console.log('');
  console.log('남아 있을 수 있는 영어 문구:');
  [...new Set(leftover)].forEach(t => console.log('  · ' + t));
}
