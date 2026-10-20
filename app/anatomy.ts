export type SystemId='eyeball'|'eyemuscle'|'tear'|'opticnerve'|'eyelid';
export const SYSTEMS:{id:SystemId;name:string;color:string;description:string}[]=[
 {id:'eyeball',name:'눈알',color:'#c2d4da',description:'눈알은 빛을 받아들여 상을 맺는 공 모양의 기관입니다. 각막과 수정체가 빛을 모으고, 안쪽 벽의 망막이 그 빛을 전기 신호로 바꿉니다.'},
 {id:'eyemuscle',name:'눈 근육',color:'#b5675c',description:'눈알에는 여섯 개의 근육이 붙어 있습니다. 이 근육들이 짝을 이루어 당기면서 눈동자를 위아래와 좌우로 움직입니다.'},
 {id:'tear',name:'눈물 기관',color:'#7fa8c4',description:'눈물을 만들어 눈을 적시고 다시 코로 내보내는 길입니다. 눈물은 눈을 촉촉하게 하고 먼지와 세균을 씻어 냅니다.'},
 {id:'opticnerve',name:'시각 신경',color:'#d8b565',description:'망막이 만든 신호를 뇌까지 전달하는 신경입니다. 두 눈에서 나온 신경은 뇌 아래에서 한 번 만난 뒤 뇌 속으로 이어집니다.'},
 {id:'eyelid',name:'눈꺼풀',color:'#d3a389',description:'눈을 덮어 보호하고 눈물을 고르게 펴 주는 부분입니다. 눈으로 들어오는 먼지와 땀을 막는 역할도 합니다.'},
];
export interface Part {id:string;name:string;nameEn?:string;conceptId:string;system:SystemId;chunk:number;positions:number;normals:number;indices:number;vertexCount:number;indexCount:number;bounds:[number[],number[]]}
export interface Concept {id:string;name:string;elements:string[]}
export interface Atlas {version:string;sex?:'male';source?:string;scope?:string;parts:Part[];concepts:Concept[];chunks:{url:string;bytes:number;gzip?:string;gzipBytes?:number}[];triangles:number}
export type View='three-quarter'|'front'|'back'|'side';
export interface SceneState {inspectorOpen?:boolean;explode:number;visible:SystemId[];selected:string[];isolate:boolean;view:View;rotate:boolean;reset:number}
export const DEFAULT_VISIBLE:SystemId[]=['eyeball','eyemuscle','tear','opticnerve','eyelid'];

/** 화면 이름에서 좌우와 위아래 표기를 떼어 기준 용어를 얻는다. */
export function baseTerm(name:string){return name.replace(/^(왼쪽|오른쪽)\s*/,'').replace(/^(위|아래)\s+/,'').trim();}

export const EXPLANATIONS:Record<string,string>={
 '각막':'눈알 가장 앞쪽을 덮는 투명한 막입니다. 빛을 눈 속으로 들여보내며 처음으로 꺾어 줍니다. 혈관이 없어 투명하고, 상처가 나면 시력이 크게 나빠집니다.',
 '공막':'눈알 바깥을 감싸는 하얗고 질긴 막입니다. 흔히 흰자위라고 부르며, 눈의 둥근 모양을 지키고 속을 보호합니다.',
 '홍채':'각막 뒤에 있는 도넛 모양의 색깔 있는 막입니다. 가운데 구멍인 동공의 크기를 조절합니다. 밝을 때는 동공을 좁히고 어두울 때는 넓힙니다.',
 '수정체':'홍채 뒤에 있는 볼록하고 투명한 렌즈입니다. 두께를 바꿔 먼 곳과 가까운 곳에 초점을 맞춥니다. 나이가 들면 딱딱해져 가까운 글씨가 잘 안 보입니다.',
 '맥락막':'공막과 망막 사이에 있는 혈관이 많은 막입니다. 망막에 영양과 산소를 주고 남는 빛을 흡수합니다.',
 '망막':'눈알 안쪽 벽을 덮고 있는 얇은 신경 막입니다. 들어온 빛을 받아 전기 신호로 바꾸어 줍니다. 카메라의 필름이나 센서와 비슷한 역할을 합니다.',
 '유리체':'수정체 뒤쪽 눈알 속을 채운 투명한 젤리입니다. 눈알이 둥근 모양을 지키게 하고 빛을 통과시킵니다.',
 '앞방':'각막과 홍채 사이에 있는 작은 공간입니다. 방수라는 맑은 액체가 차서 눈 속 압력을 지킵니다.',
 '섬모체띠':'수정체 가장자리와 섬모체를 잇는 가는 실입니다. 수정체를 붙잡고 당기는 힘을 바꿔 두께를 조절합니다.',
 '섬모체':'수정체를 둘러싼 고리 모양의 조직입니다. 여기서 뻗어 나온 가는 실이 수정체를 붙들고 두께를 조절합니다.',
 '시각신경':'눈알 뒤쪽에서 뇌로 이어지는 굵은 신경입니다. 망막이 만든 신호를 뇌까지 전달합니다. 이 신경이 빠져나가는 자리는 빛을 못 느끼는 맹점입니다.',
 '시각교차':'두 눈의 시각신경이 뇌 아래쪽에서 만나는 곳입니다. 각 눈의 안쪽 신경섬유가 반대쪽으로 건너갑니다.',
 '시각로':'시각교차에서 뇌 안쪽으로 이어지는 신경 다발입니다. 두 눈에서 온 신호를 모아 뇌 속 중계소로 보냅니다.',
 '위곧은근':'눈알 위쪽에 붙어 있는 가늘고 긴 근육입니다. 눈동자를 위쪽으로 들어 올리는 일을 합니다.',
 '아래곧은근':'눈알 아래쪽에 붙어 있는 가늘고 긴 근육입니다. 눈동자를 아래쪽으로 내리는 일을 합니다.',
 '안쪽곧은근':'눈알의 코 쪽 옆면에 붙어 있는 근육입니다. 눈동자를 코 쪽, 곧 안쪽으로 돌립니다.',
 '가쪽곧은근':'눈알의 귀 쪽 옆면에 붙어 있는 근육입니다. 눈동자를 귀 쪽, 곧 바깥쪽으로 돌립니다.',
 '위빗근':'눈알 위쪽을 비스듬히 지나가는 긴 근육입니다. 눈동자를 아래 바깥쪽으로 돌리는 것을 돕습니다.',
 '아래빗근':'눈알 아래쪽을 비스듬히 지나가는 긴 근육입니다. 눈동자를 위 바깥쪽으로 돌리는 것을 돕습니다.',
 '위눈꺼풀올림근':'위 눈꺼풀 속에 들어 있는 얇은 근육입니다. 위 눈꺼풀을 들어 올려 눈을 뜨게 합니다.',
 '눈꺼풀판':'눈꺼풀 속에 들어 있는 단단한 섬유 판입니다. 눈꺼풀 모양을 잡아 주고 눈알을 잘 덮게 합니다.',
 '눈물샘':'눈의 바깥 위쪽 눈두덩 속에 있는 샘입니다. 눈물을 만들어 눈 표면으로 내보냅니다. 눈물은 눈을 촉촉하게 하고 먼지와 세균을 씻어 냅니다.',
 '눈물소관':'위아래 눈꺼풀 안쪽 끝에 있는 가는 관입니다. 눈물점으로 들어온 눈물을 눈물주머니로 보냅니다.',
 '눈물주머니':'코 옆, 눈 안쪽 구석에 있는 작은 주머니입니다. 모인 눈물을 잠시 담았다가 아래로 내려보냅니다.',
 '눈물호':'눈 안쪽 구석에 눈물이 고이는 얕은 공간입니다. 눈을 적신 눈물이 여기 모였다가 눈물점으로 빠집니다.',
 '코눈물관':'눈물주머니에서 코안으로 이어지는 긴 관입니다. 남은 눈물을 코로 보내며, 울면 콧물이 나는 이유입니다.',
 '눈썹':'눈 위 이마 아래쪽에 가로로 난 짧은 털입니다. 이마에서 흘러내리는 땀과 빗물을 옆으로 흘려보냅니다.',
};
export function explanation(name:string,system:SystemId){return EXPLANATIONS[baseTerm(name)]??SYSTEMS.find(s=>s.id===system)?.description??'';}
