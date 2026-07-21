export interface LabIndicators {
  potassium: number;   // mEq/L (Normal/Target for Dialysis: 3.5 - 5.5)
  phosphorus: number;  // mg/dL (Normal/Target for Dialysis: 3.5 - 5.5)
  calcium: number;     // mg/dL (Normal/Target for Dialysis: 8.4 - 10.2)
}

export interface DailyMealPlan {
  week: number;       // 1, 2, 3, 4
  dayIndex: number;   // 0 (월), 1 (화), ... 6 (일)
  dayName: string;    // 월요일, 화요일 ...
  mealName: string;   // 한끼 식단 명칭 (e.g., '소고기 불고기 영양')
  mealDescription: string; // 상세 식단 내용
  category: 'bulgogi' | 'fish' | 'tofu' | 'chicken' | 'pork' | 'vegetarian';
  potassiumMg: number;   // estimated potassium
  phosphorusMg: number;  // estimated phosphorus
  calciumMg: number;     // estimated calcium
  proteinG: number;      // estimated protein
}

// 4주치 (28일) 매일 한끼 맞춤 식단 데이터베이스 (투석환자를 위한 상세 중량 정보 탑재)
export const FOUR_WEEK_MEAL_PLAN_TEMPLATE: DailyMealPlan[] = [
  // WEEK 1
  {
    week: 1,
    dayIndex: 0,
    dayName: '월요일',
    mealName: '소고기 불고기 영양',
    mealDescription: '소고기 불고기 80g(양파·당근 데쳐서 조리), 흰쌀밥 150g(2/3공기), 데친 숙주나물 볶음 40g, 촉촉한 계란찜 50g(계란 1알)',
    category: 'bulgogi',
    potassiumMg: 450,
    phosphorusMg: 120,
    calciumMg: 45,
    proteinG: 22
  },
  {
    week: 1,
    dayIndex: 1,
    dayName: '화요일',
    mealName: '들기름 두부 부침',
    mealDescription: '들기름 두부 부침 100g(두부 3조각), 흰쌀밥 150g(2/3공기), 데친 가지나물 40g, 담백한 동태전 50g(2조각)',
    category: 'tofu',
    potassiumMg: 380,
    phosphorusMg: 95,
    calciumMg: 65,
    proteinG: 18
  },
  {
    week: 1,
    dayIndex: 2,
    dayName: '수요일',
    mealName: '약선 돼지고기 보쌈 수육',
    mealDescription: '돼지고기 보쌈 수육 80g(기름기 뺀 것), 흰쌀밥 150g(2/3공기), 데친 얼갈이 배추쌈 40g, 저염 오이 초무침 40g',
    category: 'pork',
    potassiumMg: 490,
    phosphorusMg: 135,
    calciumMg: 35,
    proteinG: 24
  },
  {
    week: 1,
    dayIndex: 3,
    dayName: '목요일',
    mealName: '삼치 소금구이 담백',
    mealDescription: '삼치 소금구이 80g(작은 1토막), 흰쌀밥 150g(2/3공기), 무나물 50g, 맑은 두부조개국 120g(두부 20g, 국물은 소량만)',
    category: 'fish',
    potassiumMg: 410,
    phosphorusMg: 110,
    calciumMg: 50,
    proteinG: 20
  },
  {
    week: 1,
    dayIndex: 4,
    dayName: '금요일',
    mealName: '저염 닭안심 소금구이',
    mealDescription: '닭안심 소금구이 80g, 흰쌀밥 150g(2/3공기), 물에 데친 청경채 볶음 40g, 맑은 무국 100g(건더기 위주)',
    category: 'chicken',
    potassiumMg: 390,
    phosphorusMg: 100,
    calciumMg: 30,
    proteinG: 21
  },
  {
    week: 1,
    dayIndex: 5,
    dayName: '토요일',
    mealName: '수제 함박 스테이크',
    mealDescription: '수제 함박 스테이크 90g(데친 양파 배합), 흰쌀밥 150g(2/3공기), 데친 콜리플라워 나물 40g, 맑은 건더기 미역국 100g',
    category: 'bulgogi',
    potassiumMg: 520,
    phosphorusMg: 140,
    calciumMg: 55,
    proteinG: 23
  },
  {
    week: 1,
    dayIndex: 6,
    dayName: '일요일',
    mealName: '버섯 보양 잡채',
    mealDescription: '버섯 잡채 100g(데친 표고·목이버섯 30g 사용), 흰쌀밥 150g(2/3공기), 저염 오이 샐러드 40g, 맑은 계란국 100g',
    category: 'vegetarian',
    potassiumMg: 350,
    phosphorusMg: 85,
    calciumMg: 40,
    proteinG: 14
  },

  // WEEK 2
  {
    week: 2,
    dayIndex: 0,
    dayName: '월요일',
    mealName: '한우 소불고기 웰빙',
    mealDescription: '소불고기 80g(양파·새송이 데쳐 조리), 흰쌀밥 150g(2/3공기), 새콤 무초절임 30g, 데친 애호박 나물 40g',
    category: 'bulgogi',
    potassiumMg: 460,
    phosphorusMg: 125,
    calciumMg: 42,
    proteinG: 22
  },
  {
    week: 2,
    dayIndex: 1,
    dayName: '화요일',
    mealName: '데리야끼 삼치 조림',
    mealDescription: '삼치 데리야끼 조림 80g(1토막), 흰쌀밥 150g(2/3공기), 콩나물 맑은 볶음 40g, 두부 들기름 구이 50g(1.5조각)',
    category: 'fish',
    potassiumMg: 420,
    phosphorusMg: 115,
    calciumMg: 52,
    proteinG: 21
  },
  {
    week: 2,
    dayIndex: 2,
    dayName: '수요일',
    mealName: '담백한 돼지안심 수육',
    mealDescription: '돼지안심 수육 80g, 데친 얼갈이배추 겉절이 40g, 흰쌀밥 150g(2/3공기), 조기 구이 60g(작은 1마리)',
    category: 'pork',
    potassiumMg: 480,
    phosphorusMg: 130,
    calciumMg: 38,
    proteinG: 25
  },
  {
    week: 2,
    dayIndex: 3,
    dayName: '목요일',
    mealName: '담백한 가자미 소금구이',
    mealDescription: '가자미 소금구이 80g(1토막), 데친 시금치 나물 40g, 흰쌀밥 150g(2/3공기), 맑은 소고기 뭇국 120g(건더기 위주)',
    category: 'fish',
    potassiumMg: 400,
    phosphorusMg: 105,
    calciumMg: 48,
    proteinG: 19
  },
  {
    week: 2,
    dayIndex: 4,
    dayName: '금요일',
    mealName: '닭가슴살 큐브 볶음',
    mealDescription: '닭가슴살 큐브 볶음 80g, 아삭 파프리카 슬라이스 30g, 흰쌀밥 150g(2/3공기), 맑은 무국 100g(국물 소량만)',
    category: 'chicken',
    potassiumMg: 385,
    phosphorusMg: 98,
    calciumMg: 32,
    proteinG: 20
  },
  {
    week: 2,
    dayIndex: 5,
    dayName: '토요일',
    mealName: '등심 수제 돈가스',
    mealDescription: '수제 돈가스 90g(소스는 부어먹지 않고 소량 찍어먹기), 양배추 샐러드 40g, 흰쌀밥 150g(2/3공기), 북어 해장국 100g',
    category: 'pork',
    potassiumMg: 510,
    phosphorusMg: 138,
    calciumMg: 52,
    proteinG: 24
  },
  {
    week: 2,
    dayIndex: 6,
    dayName: '일요일',
    mealName: '저염 훈제오리 구이',
    mealDescription: '훈제오리 오븐구이 80g(기름기 배출), 데친 청경채 겉절이 40g, 흰쌀밥 150g(2/3공기), 무나물 50g',
    category: 'chicken',
    potassiumMg: 430,
    phosphorusMg: 110,
    calciumMg: 36,
    proteinG: 19
  },

  // WEEK 3
  {
    week: 3,
    dayIndex: 0,
    dayName: '월요일',
    mealName: '뚝배기 버섯 소불고기',
    mealDescription: '뚝배기 소불고기 80g(느타리버섯·양파 데쳐 조리), 참나물 겉절이 40g(데친 조리), 흰쌀밥 150g(2/3공기), 대구 지리국 120g',
    category: 'bulgogi',
    potassiumMg: 470,
    phosphorusMg: 128,
    calciumMg: 44,
    proteinG: 23
  },
  {
    week: 3,
    dayIndex: 1,
    dayName: '화요일',
    mealName: '저염 닭가슴살 간장 조림',
    mealDescription: '닭가슴살 간장 조림 80g, 저염 오이 초무침 40g, 흰쌀밥 150g(2/3공기), 보들보들 달걀찜 50g',
    category: 'chicken',
    potassiumMg: 395,
    phosphorusMg: 102,
    calciumMg: 34,
    proteinG: 20
  },
  {
    week: 3,
    dayIndex: 2,
    dayName: '수요일',
    mealName: '약선 돼지 보쌈',
    mealDescription: '돼지 목살 보쌈 수육 80g, 데친 배추쌈 40g, 흰쌀밥 150g(2/3공기), 담백 동태전 50g(2조각), 맑은 계란국 100g',
    category: 'pork',
    potassiumMg: 495,
    phosphorusMg: 136,
    calciumMg: 40,
    proteinG: 25
  },
  {
    week: 3,
    dayIndex: 3,
    dayName: '목요일',
    mealName: '가슴 깊이 갈치 구이',
    mealDescription: '갈치 소금구이 80g(1토막), 데친 가지나물 40g, 흰쌀밥 150g(2/3공기), 소고기 맑은 무국 120g(국물은 남김)',
    category: 'fish',
    potassiumMg: 415,
    phosphorusMg: 112,
    calciumMg: 52,
    proteinG: 19
  },
  {
    week: 3,
    dayIndex: 4,
    dayName: '금요일',
    mealName: '건강 연두부 버섯 샐러드',
    mealDescription: '연두부 100g(1모, 간장 소량), 데친 느타리버섯 무침 40g, 호박나물 40g, 흰쌀밥 150g(2/3공기), 맑은 배추국 100g',
    category: 'tofu',
    potassiumMg: 375,
    phosphorusMg: 94,
    calciumMg: 60,
    proteinG: 17
  },
  {
    week: 3,
    dayIndex: 5,
    dayName: '토요일',
    mealName: '프리미엄 너비아니 구이',
    mealDescription: '수제 너비아니 구이 80g(소량 가열 조리, 2장), 오이 무생채 40g, 흰쌀밥 150g(2/3공기), 맑은 건더기 아욱국 100g',
    category: 'bulgogi',
    potassiumMg: 505,
    phosphorusMg: 135,
    calciumMg: 50,
    proteinG: 22
  },
  {
    week: 3,
    dayIndex: 6,
    dayName: '일요일',
    mealName: '부드러운 오징어 숙회',
    mealDescription: '오징어 숙회 80g(끓는 물에 푹 데침), 데친 숙주나물 무침 40g, 흰쌀밥 150g(2/3공기), 맑은 무국 100g',
    category: 'vegetarian',
    potassiumMg: 360,
    phosphorusMg: 90,
    calciumMg: 42,
    proteinG: 15
  },

  // WEEK 4
  {
    week: 4,
    dayIndex: 0,
    dayName: '월요일',
    mealName: '소고기 샤브 전골',
    mealDescription: '소고기 샤브 건더기 80g(육수 제외), 데친 시금치 나물 40g, 굴비 구이 50g(1마리), 흰쌀밥 150g(2/3공기), 무나물 40g',
    category: 'bulgogi',
    potassiumMg: 455,
    phosphorusMg: 122,
    calciumMg: 41,
    proteinG: 22
  },
  {
    week: 4,
    dayIndex: 1,
    dayName: '화요일',
    mealName: '촉촉한 닭안심 살구이',
    mealDescription: '닭안심 살구이 80g, 새콤 양배추 초절임 40g, 흰쌀밥 150g(2/3공기), 무생채 40g, 맑은 계란국 100g',
    category: 'chicken',
    potassiumMg: 390,
    phosphorusMg: 100,
    calciumMg: 31,
    proteinG: 20
  },
  {
    week: 4,
    dayIndex: 2,
    dayName: '수요일',
    mealName: '웰빙 웰던 스팀 수육',
    mealDescription: '스팀 돼지고기 수육 80g, 동태전 50g(2조각), 흰쌀밥 150g(2/3공기), 데친 두부 무침 50g, 맑은 파국 100g',
    category: 'pork',
    potassiumMg: 485,
    phosphorusMg: 132,
    calciumMg: 37,
    proteinG: 24
  },
  {
    week: 4,
    dayIndex: 3,
    dayName: '목요일',
    mealName: '가자미 소금구이',
    mealDescription: '가자미 소금구이 80g(1토막), 데친 무채 나물볶음 40g, 흰쌀밥 150g(2/3공기), 맑은 콩나물국 100g(국물 생략)',
    category: 'fish',
    potassiumMg: 405,
    phosphorusMg: 108,
    calciumMg: 49,
    proteinG: 19
  },
  {
    week: 4,
    dayIndex: 4,
    dayName: '금요일',
    mealName: '대구 생선까스 건강',
    mealDescription: '대구 생선가스 80g(데친 아스파라거스 가니쉬 20g), 데친 배추나물 40g, 흰쌀밥 150g(2/3공기), 맑은 무국 100g',
    category: 'fish',
    potassiumMg: 410,
    phosphorusMg: 110,
    calciumMg: 47,
    proteinG: 18
  },
  {
    week: 4,
    dayIndex: 5,
    dayName: '토요일',
    mealName: '소고기 수제 완자전',
    mealDescription: '수제 소고기 완자전 80g(3알), 데친 두부 조림 50g, 애호박 볶음 40g, 흰쌀밥 150g(2/3공기), 맑은 황태국 100g',
    category: 'bulgogi',
    potassiumMg: 515,
    phosphorusMg: 139,
    calciumMg: 51,
    proteinG: 23
  },
  {
    week: 4,
    dayIndex: 6,
    dayName: '일요일',
    mealName: '저염 두부 버섯 전골',
    mealDescription: '저염 두부 버섯 전골 건더기 100g(두부 50g, 데친 느타리 30g), 물에 20분 담가 전분/칼륨 제거한 감자채 볶음 40g, 흰쌀밥 150g',
    category: 'tofu',
    potassiumMg: 380,
    phosphorusMg: 96,
    calciumMg: 58,
    proteinG: 17
  }
];
