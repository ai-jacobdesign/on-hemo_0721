const fs = require('fs');

const categories = ['bulgogi', 'fish', 'tofu', 'chicken', 'pork', 'vegetarian'];

const proteins = {
  bulgogi: [
    { name: '소고기 불고기 영양', desc: '소고기 불고기 80g(양파·당근 데쳐서 조리)', k: 450, p: 120, ca: 45, pr: 22 },
    { name: '한우 소불고기 웰빙', desc: '소불고기 80g(양파·새송이 데쳐 조리)', k: 460, p: 125, ca: 42, pr: 22 },
    { name: '뚝배기 버섯 소불고기', desc: '뚝배기 소불고기 80g(느타리버섯·양파 데쳐 조리)', k: 470, p: 128, ca: 44, pr: 23 },
    { name: '소고기 샤브 전골', desc: '소고기 샤브 건더기 80g(육수 제외)', k: 455, p: 122, ca: 41, pr: 22 },
    { name: '프리미엄 너비아니 구이', desc: '수제 너비아니 구이 80g(소량 가열 조리, 2장)', k: 505, p: 135, ca: 50, pr: 22 },
    { name: '수제 함박 스테이크', desc: '수제 함박 스테이크 90g(데친 양파 배합)', k: 520, p: 140, ca: 55, pr: 23 },
    { name: '소고기 수제 완자전', desc: '수제 소고기 완자전 80g(3알)', k: 515, p: 139, ca: 51, pr: 23 },
    { name: '안창살 허브 구이', desc: '소 안창살 허브 구이 80g', k: 480, p: 120, ca: 40, pr: 21 },
    { name: '차돌박이 숙주 볶음', desc: '차돌박이 숙주 볶음 80g(숙주 듬뿍 데쳐서)', k: 460, p: 110, ca: 42, pr: 18 },
    { name: '소고기 장조림', desc: '소고기 메추리알 장조림 80g(국물 제외)', k: 450, p: 130, ca: 48, pr: 20 },
  ],
  fish: [
    { name: '삼치 소금구이 담백', desc: '삼치 소금구이 80g(작은 1토막)', k: 410, p: 110, ca: 50, pr: 20 },
    { name: '담백한 가자미 소금구이', desc: '가자미 소금구이 80g(1토막)', k: 400, p: 105, ca: 48, pr: 19 },
    { name: '데리야끼 삼치 조림', desc: '삼치 데리야끼 조림 80g(1토막)', k: 420, p: 115, ca: 52, pr: 21 },
    { name: '가슴 깊이 갈치 구이', desc: '갈치 소금구이 80g(1토막)', k: 415, p: 112, ca: 52, pr: 19 },
    { name: '대구 생선까스 건강', desc: '대구 생선가스 80g(데친 아스파라거스 가니쉬 20g)', k: 410, p: 110, ca: 47, pr: 18 },
    { name: '임연수 카레 구이', desc: '임연수 카레 가루 구이 80g(1토막)', k: 430, p: 118, ca: 55, pr: 20 },
    { name: '고등어 무조림', desc: '고등어 무조림 80g(무 위주 섭취)', k: 450, p: 125, ca: 60, pr: 21 },
    { name: '꽁치 간장 구이', desc: '꽁치 간장 구이 80g(1마리)', k: 440, p: 120, ca: 58, pr: 20 },
    { name: '동태전 담백 구이', desc: '담백한 동태전 80g(3조각)', k: 400, p: 100, ca: 45, pr: 18 },
    { name: '조기 소금 구이', desc: '조기 구이 80g(중간 1마리)', k: 420, p: 110, ca: 50, pr: 19 },
  ],
  tofu: [
    { name: '들기름 두부 부침', desc: '들기름 두부 부침 100g(두부 3조각)', k: 380, p: 95, ca: 65, pr: 18 },
    { name: '건강 연두부 버섯 샐러드', desc: '연두부 100g(1모, 간장 소량)', k: 375, p: 94, ca: 60, pr: 17 },
    { name: '저염 두부 버섯 전골', desc: '저염 두부 버섯 전골 건더기 100g(두부 50g, 데친 느타리 30g)', k: 380, p: 96, ca: 58, pr: 17 },
    { name: '마파두부 덮밥 소스', desc: '마파두부 100g(두부 위주, 소스 소량)', k: 390, p: 98, ca: 62, pr: 16 },
    { name: '순두부 맑은 탕', desc: '순두부 맑은 탕 건더기 100g', k: 360, p: 90, ca: 55, pr: 15 },
    { name: '두부 강정', desc: '두부 강정 100g(간장 소스)', k: 400, p: 100, ca: 68, pr: 18 },
    { name: '두부 야채 볶음', desc: '두부 채소 볶음 100g(야채 데침)', k: 385, p: 95, ca: 60, pr: 17 },
    { name: '두부 카프레제', desc: '두부 카프레제 100g(토마토 대신 데친 야채)', k: 370, p: 92, ca: 58, pr: 16 },
    { name: '두부 스테이크', desc: '두부 함박 스테이크 100g', k: 410, p: 105, ca: 70, pr: 19 },
    { name: '두부 조림', desc: '저염 간장 두부 조림 100g', k: 395, p: 97, ca: 63, pr: 17 },
  ],
  chicken: [
    { name: '저염 닭안심 소금구이', desc: '닭안심 소금구이 80g', k: 390, p: 100, ca: 30, pr: 21 },
    { name: '닭가슴살 큐브 볶음', desc: '닭가슴살 큐브 볶음 80g', k: 385, p: 98, ca: 32, pr: 20 },
    { name: '저염 훈제오리 구이', desc: '훈제오리 오븐구이 80g(기름기 배출)', k: 430, p: 110, ca: 36, pr: 19 },
    { name: '저염 닭가슴살 간장 조림', desc: '닭가슴살 간장 조림 80g', k: 395, p: 102, ca: 34, pr: 20 },
    { name: '촉촉한 닭안심 살구이', desc: '닭안심 살구이 80g', k: 390, p: 100, ca: 31, pr: 20 },
    { name: '닭봉 간장 오븐구이', desc: '닭봉 간장 구이 80g(3조각)', k: 410, p: 105, ca: 35, pr: 19 },
    { name: '닭가슴살 냉채', desc: '닭가슴살 찢어 데친 야채와 냉채 80g', k: 380, p: 95, ca: 30, pr: 21 },
    { name: '찜닭 건더기', desc: '안동찜닭 건더기 80g(감자 물에 담가 사용)', k: 420, p: 110, ca: 38, pr: 18 },
    { name: '닭가슴살 카레 볶음', desc: '닭가슴살 카레 볶음 80g', k: 400, p: 103, ca: 33, pr: 20 },
    { name: '오리주물럭', desc: '오리주물럭 80g(야채 듬뿍, 고추장 소량)', k: 440, p: 115, ca: 37, pr: 18 },
  ],
  pork: [
    { name: '약선 돼지고기 보쌈 수육', desc: '돼지고기 보쌈 수육 80g(기름기 뺀 것)', k: 490, p: 135, ca: 35, pr: 24 },
    { name: '담백한 돼지안심 수육', desc: '돼지안심 수육 80g', k: 480, p: 130, ca: 38, pr: 25 },
    { name: '등심 수제 돈가스', desc: '수제 돈가스 90g(소스는 부어먹지 않고 소량 찍어먹기)', k: 510, p: 138, ca: 52, pr: 24 },
    { name: '약선 돼지 보쌈', desc: '돼지 목살 보쌈 수육 80g', k: 495, p: 136, ca: 40, pr: 25 },
    { name: '웰빙 웰던 스팀 수육', desc: '스팀 돼지고기 수육 80g', k: 485, p: 132, ca: 37, pr: 24 },
    { name: '돼지고기 메추리알 장조림', desc: '돼지 안심 장조림 80g(국물 제외)', k: 470, p: 125, ca: 36, pr: 22 },
    { name: '제육 볶음', desc: '돼지 앞다리살 제육 볶음 80g(고추장 소량)', k: 500, p: 140, ca: 39, pr: 21 },
    { name: '돼지 갈비 찜', desc: '돼지 갈비찜 살코기 80g(국물 제외)', k: 510, p: 145, ca: 42, pr: 20 },
    { name: '돼지 고추장 불고기', desc: '돼지 고추장 불고기 80g', k: 505, p: 138, ca: 40, pr: 22 },
    { name: '동그랑땡 구이', desc: '돼지고기 수제 동그랑땡 80g', k: 490, p: 130, ca: 45, pr: 20 },
  ],
  vegetarian: [
    { name: '버섯 보양 잡채', desc: '버섯 잡채 100g(데친 표고·목이버섯 30g 사용)', k: 350, p: 85, ca: 40, pr: 14 },
    { name: '부드러운 오징어 숙회', desc: '오징어 숙회 80g(끓는 물에 푹 데침)', k: 360, p: 90, ca: 42, pr: 15 },
    { name: '궁중 떡볶이', desc: '간장 떡볶이 100g(야채 데침)', k: 340, p: 80, ca: 38, pr: 12 },
    { name: '새우살 브로콜리 볶음', desc: '새우살 60g, 데친 브로콜리 40g', k: 370, p: 95, ca: 45, pr: 16 },
    { name: '쭈꾸미 맑은 볶음', desc: '쭈꾸미 맑은 볶음 80g', k: 365, p: 92, ca: 43, pr: 15 },
    { name: '해물 부추전', desc: '오징어/새우 다진 해물 부추전 80g', k: 380, p: 98, ca: 46, pr: 14 },
    { name: '조개살 미역국 건더기', desc: '조개살 듬뿍 미역국 건더기 100g', k: 390, p: 100, ca: 48, pr: 16 },
    { name: '낙지 데침 무침', desc: '낙지 데쳐서 무친 요리 80g', k: 375, p: 96, ca: 44, pr: 15 },
    { name: '게살 채소 볶음', desc: '크래미/게살 볶음 80g(데친 야채)', k: 355, p: 88, ca: 40, pr: 13 },
    { name: '묵무침', desc: '도토리묵 무침 100g(간장 소량)', k: 330, p: 75, ca: 35, pr: 10 },
  ]
};

const sides1 = [
  '데친 숙주나물 볶음 40g', '데친 가지나물 40g', '데친 얼갈이 배추쌈 40g', '무나물 50g', '물에 데친 청경채 볶음 40g',
  '데친 콜리플라워 나물 40g', '저염 오이 샐러드 40g', '새콤 무초절임 30g', '콩나물 맑은 볶음 40g', '데친 배추나물 40g',
  '물에 담근 감자채 볶음 40g', '데친 시금치 나물 40g', '참나물 겉절이 40g(데친 조리)', '저염 오이 초무침 40g', '애호박 볶음 40g',
  '아삭 파프리카 슬라이스 30g', '양배추 샐러드 40g', '데친 청경채 겉절이 40g', '데친 느타리버섯 무침 40g', '오이 무생채 40g'
];

const sides2 = [
  '촉촉한 계란찜 50g(계란 1알)', '담백한 동태전 50g(2조각)', '맑은 두부조개국 120g(국물 소량)', '맑은 무국 100g(건더기 위주)',
  '맑은 건더기 미역국 100g', '맑은 계란국 100g', '두부 들기름 구이 50g(1.5조각)', '조기 구이 60g(작은 1마리)',
  '맑은 소고기 뭇국 120g(건더기 위주)', '북어 해장국 100g', '보들보들 달걀찜 50g', '맑은 건더기 아욱국 100g',
  '굴비 구이 50g(1마리)', '맑은 황태국 100g', '맑은 콩나물국 100g(국물 생략)', '데친 두부 조림 50g',
  '대구 지리국 120g', '맑은 파국 100g', '데친 두부 무침 50g', '동태전 50g(2조각)'
];

const output = [];

for (let i = 0; i < 300; i++) {
  const cat = categories[i % categories.length];
  const proteinList = proteins[cat];
  
  const main = proteinList[Math.floor(Math.random() * proteinList.length)];
  const side1 = sides1[Math.floor(Math.random() * sides1.length)];
  const side2 = sides2[Math.floor(Math.random() * sides2.length)];
  
  const desc = `${main.desc}, 흰쌀밥 150g(2/3공기), ${side1}, ${side2}`;
  
  // To ensure uniqueness, we'll append a tiny unique marker if needed, or just let random combinations create unique meals.
  output.push({
    id: i + 1,
    mealName: main.name,
    mealDescription: desc,
    category: cat,
    potassiumMg: main.k,
    phosphorusMg: main.p,
    calciumMg: main.ca,
    proteinG: main.pr
  });
}

// deduplicate logic (though with so many combinations, few will be strictly identical in description)

fs.writeFileSync('src/mealDatabase.ts', `export const MEAL_DATABASE = ${JSON.stringify(output, null, 2)};`);
console.log('Done');
