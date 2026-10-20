# 눈의 구조 · 보건 수업용 3D 자료

중학교 보건 수업에서 쓰는 3차원 눈 해부 자료입니다.
눈을 돌려 보고, 분해하고, 눌러서 한글 설명을 확인할 수 있습니다.

## 초보자 연수: 내 계정으로 복사하고 배포하기

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2FByeongeo%2Feye-anatomy&project-name=eye-anatomy-lab&repository-name=eye-anatomy-lab)

위 버튼으로 본인 GitHub 계정에 복사하고 Vercel에 배포할 수 있습니다.
이 앱은 API 키나 환경 변수를 요구하지 않습니다. Vite 배포 설정과 실행에 필요한 눈 모델이 포함되어 있습니다.

1. GitHub 계정이 없으면 [가입](https://github.com/signup)하고 이메일을 인증합니다.
2. [Vercel](https://vercel.com/signup)에 GitHub 계정으로 가입하거나 로그인합니다.
3. 위 Deploy 버튼을 누르고 개인 GitHub 계정을 선택한 뒤 Create / Deploy를 진행합니다.
4. 배포가 Ready가 되면 Visit를 눌러 실행합니다.

배포된 앱의 `/training-guide.html`에서 단계별 한국어 연수 안내서를 열 수 있습니다.
파일 하나로 배포할 때는 `public/training-guide.html`을 내려받아 브라우저로 여세요.
안내서의 강사용 설정에서 원본 주소를 바꾸고 설정을 담은 HTML을 내려받을 수 있습니다.

## 담긴 내용

부품 59개를 다섯 묶음으로 나누어 담았습니다.

| 묶음 | 부품 | 구조 |
|---|---|---|
| 눈알 | 22개 | 각막, 공막, 홍채, 수정체, 맥락막, 망막, 유리체, 앞방, 섬모체, 섬모체띠 |
| 눈 근육 | 14개 | 위·아래·안쪽·가쪽곧은근, 위·아래빗근, 위눈꺼풀올림근 |
| 눈물 기관 | 10개 | 눈물샘, 눈물소관, 눈물주머니, 눈물호, 코눈물관 |
| 시각 신경 | 8개 | 시각신경, 시각교차, 시각로 |
| 눈꺼풀 | 5개 | 눈꺼풀판, 눈썹 |

## 쓰는 법

- **끌기**로 돌리고 **휠**로 확대합니다.
- 부위를 **누르면** 오른쪽에 이름과 설명이 나옵니다.
- 화면 아래 **눈 분해하기** 막대를 밀면 부품이 흩어집니다.
- **이 구조만 보기**를 누르면 그 부위만 크게 나옵니다.
- 오른쪽 위 **구조 찾기**에서 한글로 검색할 수 있습니다.

### 수업에서 쓰기 좋은 순서

1. 구조 찾기에서 `오른쪽 눈알`을 검색합니다.
2. **이 구조만 보기**를 누릅니다.
3. **눈 분해하기**를 끝까지 밀면 눈알이 11개 층으로 갈라집니다.
4. 각막, 홍채, 수정체, 망막을 차례로 눌러 설명을 보여 줍니다.

## 개발

Node.js 22.13 이상이 필요합니다.

```sh
npm ci
npm run dev
```

http://localhost:3016 에서 열립니다. 배포용 빌드는 `npm run build`이고 결과물은 `dist`에 생깁니다.

### 자료를 다시 만들 때

`source-data/models`에 원본 전신 자료가 있어야 합니다. 저장소에는 포함하지 않습니다.

```sh
node scripts/build-eye-atlas.mjs
```

구조 이름이나 묶음을 바꾸려면 `scripts/build-eye-atlas.mjs`의 `TERMS`와 `GROUPS`를 고친 뒤 다시 실행합니다. 설명문은 `app/anatomy.ts`의 `EXPLANATIONS`에 있습니다.

## 배포

Vercel에 Vite 프로젝트로 올립니다. `vercel.json`에 설정이 들어 있습니다.

```sh
vercel login
vercel --prod
```

## 출처와 이용 조건

형상은 BodyParts3D(CC BY 4.0), 화면 프로그램은 Human Atlas(MIT)를 바탕으로 했습니다. 자세한 내용은 [ATTRIBUTION.md](public/ATTRIBUTION.md)에 있습니다.

용어와 설명은 수업에 쓰기 전에 담당 선생님께서 확인해 주시기 바랍니다. 학습용 자료이며 진단이나 치료에 쓰는 자료가 아닙니다.
