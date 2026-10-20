/**
 * 카메라와 분해 배치를 눈 크기에 맞춘다.
 *
 * 원본은 키 1.7m 사람 전신을 기준으로 숫자가 박혀 있다.
 * 눈 자료는 11cm 크기라 그대로 두면 화면에서 점처럼 보인다.
 * 자료의 실제 범위를 읽어 카메라 거리와 높이를 다시 잡고,
 * 전신용 바닥판과 받침대는 감춘다.
 *
 * 실행: node scripts/fit-camera-to-eye.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';

const edits = [];
const add = (from, to) => edits.push([from, to]);

// ── 1) 자료의 실제 범위를 계산하는 코드를 넣는다 ──────────────────────
add(
  "const abort=new AbortController();",
  "const abort=new AbortController();\n" +
  "  // 자료의 실제 크기에 맞춰 화면을 잡는다 (전신이 아니라 눈 한 쌍)\n" +
  "  const modelBox=new T.Box3();atlas.parts.forEach(p=>modelBox.union(new T.Box3(new T.Vector3().fromArray(p.bounds[0]),new T.Vector3().fromArray(p.bounds[1]))));\n" +
  "  const modelCenter=modelBox.getCenter(new T.Vector3()),modelSize=modelBox.getSize(new T.Vector3());\n" +
  "  const focusY=modelCenter.y,modelSpan=Math.max(modelSize.x,modelSize.y,modelSize.z);"
);

// ── 2) 카메라 초기 위치와 거리 한계 ───────────────────────────────────
add(
  "camera.position.set(1.4,1.05,3.6);controls.target.set(0,.85,0);controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=.07;controls.maxDistance=40;",
  "const baseDistance=modelSpan/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)));\n" +
  "  camera.position.set(modelCenter.x+baseDistance*.7,focusY+baseDistance*.35,modelCenter.z+baseDistance*2);controls.target.set(modelCenter.x,focusY,modelCenter.z);\n" +
  "  controls.enableDamping=true;controls.dampingFactor=.085;controls.minDistance=modelSpan*.15;controls.maxDistance=modelSpan*40;"
);

// ── 3) 화면 맞춤 거리 ─────────────────────────────────────────────────
add(
  "normalDistance=mobile?Math.max(4.5,1.8*el.clientHeight/Math.max(160,el.clientHeight-350)/(2*Math.tan(T.MathUtils.degToRad(camera.fov/2)))):4",
  "normalDistance=baseDistance*(mobile?3.1:2.25)"
);

// ── 4) 분해 상태에서의 목표 지점 높이 ─────────────────────────────────
add(
  "controls.target.set(extent>.1&&el.clientWidth>767?-packingWidth*.12:0,extent>.1||mobile?.85:.68,0);",
  "controls.target.set(extent>.1&&el.clientWidth>767?-packingWidth*.12:modelCenter.x,extent>.1?focusY:focusY,extent>.1?0:modelCenter.z);"
);

// ── 5) 분해 배치의 기준 높이 ──────────────────────────────────────────
add(
  "offsets[i]=cell?new T.Vector3(cell.x,cell.y+.85,0):centers[i].clone();",
  "offsets[i]=cell?new T.Vector3(cell.x,cell.y+focusY,0):centers[i].clone();"
);
add(
  "dx=Math.sin(angle)*t*.48;dy=(c.y-.85)*t*.28;dz=Math.cos(angle)*t*.48;",
  "dx=Math.sin(angle)*t*modelSpan*1.6;dy=(c.y-focusY)*t*.28;dz=Math.cos(angle)*t*modelSpan*1.6;"
);
add(
  "dx=T.MathUtils.lerp(Math.sin(angle)*.48,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-.85)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*.48,-c.z,t);",
  "dx=T.MathUtils.lerp(Math.sin(angle)*modelSpan*1.6,destination.x-c.x,t);dy=T.MathUtils.lerp((c.y-focusY)*.28,destination.y-c.y,t);dz=T.MathUtils.lerp(Math.cos(angle)*modelSpan*1.6,modelCenter.z-c.z,t);"
);

// ── 6) 전신용 바닥판과 받침대를 감춘다 ────────────────────────────────
add(
  "ground.visible=platform.visible=ring.visible=innerRing.visible=amount<.5&&!s.isolate;",
  "ground.visible=platform.visible=ring.visible=innerRing.visible=false;"
);

// ── 7) 분해 격자 칸 크기를 눈 부품 크기에 맞춘다 ──────────────────────
const layoutEdits = [
  ["Math.max(.035,p.bounds[1][0]-p.bounds[0][0])+.04", "Math.max(.008,p.bounds[1][0]-p.bounds[0][0])+.009"],
  ["Math.max(.035,p.bounds[1][1]-p.bounds[0][1])+.04", "Math.max(.008,p.bounds[1][1]-p.bounds[0][1])+.009"],
  ["maxWidth=Math.max(.3,...cards.map(c=>c.width))", "maxWidth=Math.max(.05,...cards.map(c=>c.width))"],
];

function apply(file, list) {
  let src = readFileSync(file, 'utf8');
  let ok = 0;
  const missed = [];
  for (const [from, to] of list) {
    if (!src.includes(from)) { missed.push(from.slice(0, 60)); continue; }
    src = src.split(from).join(to);
    ok++;
  }
  writeFileSync(file, src);
  console.log(`${file}: ${ok}/${list.length}개 적용`);
  missed.forEach(m => console.log('  못 찾음 · ' + m));
  return missed.length;
}

let failed = 0;
failed += apply('app/scene.tsx', edits);
failed += apply('app/explosion-layout.ts', layoutEdits);
process.exit(failed ? 1 : 0);
