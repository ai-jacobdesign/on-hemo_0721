export interface LabIndicators {
  potassium: number;   // mEq/L (Normal 3.5 - 5.0)
  phosphorus: number;  // mg/dL (Normal 2.5 - 4.5)
  calcium: number;     // mg/dL (Normal 8.5 - 10.5)
  lastUpdated: string;
}

export interface Meal {
  breakfast: string;
  lunch: string;
  dinner: string;
  lunchTag?: string;
}

export interface MealPlanDay {
  id: string;
  dayName: string;     // 월요일, 화요일 ...
  dayShort: string;    // 월, 화 ...
  date: string;
  meals: Meal;
  protein: number;     // g
  potassium: number;   // mg
  phosphorus: number;  // mg
  calcium: number;     // mg
  status: 'calculated' | 'loading' | 'pending';
}

export interface HealthTip {
  id: number;
  title: string;
  content: string;
  category: string;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  image: string;
  prepTime: number; // minutes
  difficulty: '쉬움' | '보통' | '어려움';
  ingredients: string[];
  steps: string[];
  nutrition: {
    potassium: number; // mg
    phosphorus: number; // mg
    sodium: number; // mg
    protein: number; // g
  };
  tip: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  timestamp: Date;
}

export interface FoodAnalysisResult {
  suitability: 'SAFE' | 'CAUTION' | 'AVOID';
  potassiumLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  phosphorusLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  reasoning: string;
  prepTip: string;
  alternatives: string[];
}
