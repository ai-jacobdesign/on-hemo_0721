import React, { useState, useRef } from 'react';
import { 
  Activity, 
  User, 
  Download, 
  Plus, 
  Trash2, 
  Calendar, 
  Info, 
  Sparkles, 
  ChevronRight, 
  AlertTriangle, 
  CheckCircle, 
  FileText, 
  Clock, 
  ShieldAlert,
  Sliders,
  TrendingUp,
  ChevronDown
} from 'lucide-react';
import { toPng } from 'html-to-image';
import { FOUR_WEEK_MEAL_PLAN_TEMPLATE, DailyMealPlan } from './data';
import CsvValidator from './components/CsvValidator';
import mealBulgogi from './assets/images/meal_bulgogi.jpg';
import mealFish from './assets/images/meal_fish.jpg';
import mealTofu from './assets/images/meal_tofu.jpg';
import mealChicken from './assets/images/meal_chicken.jpg';
import mealPork from './assets/images/meal_pork.jpg';
import mealVegetarian from './assets/images/meal_vegetarian.jpg';

const MEAL_IMAGES: Record<string, string> = {
  bulgogi: mealBulgogi,
  fish: mealFish,
  tofu: mealTofu,
  chicken: mealChicken,
  pork: mealPork,
  vegetarian: mealVegetarian
};

interface LabRecord {
  id: string;
  date: string;
  potassium: number;
  phosphorus: number;
  calcium: number;
  hemoglobin?: number;
}

// 4. Custom SVG Logo component matching the uploaded On Hemodialysis Center Logo
export function OnLogo({ className = "w-10 h-10" }: { className?: string }) {
  const gradientId = React.useId().replace(/:/g, '');
  return (
    <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* Bright orange gradient representing dialysis/blood filtration fluid */}
        <linearGradient id={`on-logo-gradient-${gradientId}`} x1="50" y1="6" x2="50" y2="94" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#f97316" />
          <stop offset="100%" stopColor="#ea580c" />
        </linearGradient>
      </defs>
      
      {/* Water/Fluid Drop pointed shape */}
      <path 
        d="M50 6C50 6 88 45 88 70A38 38 0 1 1 12 70C12 45 50 6 50 6Z" 
        fill={`url(#on-logo-gradient-${gradientId})`} 
      />
      
      {/* Upper white sweeping arc representing premium flow */}
      <path 
        d="M20 44C27 33 42 27 52 27" 
        stroke="#ffffff" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />
      
      {/* Lower white wave sweeping arc */}
      <path 
        d="M36 78C38 65 52 58 70 58C80 58 84 62 85 64" 
        stroke="#ffffff" 
        strokeWidth="4" 
        strokeLinecap="round" 
      />

      {/* Central "on" lowercase bold rounded letters */}
      <text 
        x="50" 
        y="62" 
        textAnchor="middle" 
        fill="#ffffff" 
        fontFamily="Arial, sans-serif"
        className="font-sans font-black select-none" 
        style={{ fontSize: '30px', fontWeight: 900, letterSpacing: '-1px' }}
      >
        on
      </text>
    </svg>
  );
}

export function adjustMealDescription(
  description: string,
  m_k: number,
  m_p: number,
  m_ca: number
): string {
  const parts = description.split(', ');
  const adjustedParts = parts.map(part => {
    let multiplier = 1.0;
    if (part.includes('밥') || part.includes('죽')) {
      multiplier = 1.0;
    } else if (
      part.includes('나물') || part.includes('채소') || part.includes('야채') ||
      part.includes('버섯') || part.includes('가지') || part.includes('시금치') ||
      part.includes('청경채') || part.includes('콜리플라워') || part.includes('숙주') ||
      part.includes('무') || part.includes('오이') || part.includes('파프리카') ||
      part.includes('양배추') || part.includes('샐러드') || part.includes('감자') ||
      part.includes('양파') || part.includes('당근') || part.includes('참나물') ||
      part.includes('배추') || part.includes('호박') || part.includes('아스파라거스') ||
      part.includes('애호박') || part.includes('고사리') || part.includes('도라지')
    ) {
      multiplier = m_k;
    } else if (
      part.includes('두부') || part.includes('연두부') || part.includes('계란') ||
      part.includes('달걀') || part.includes('치즈') || part.includes('우유')
    ) {
      multiplier = Math.min(m_p, m_ca);
    } else if (
      part.includes('소고기') || part.includes('돼지고기') || part.includes('닭') ||
      part.includes('오리') || part.includes('삼치') || part.includes('동태') ||
      part.includes('생선') || part.includes('가자미') || part.includes('오징어') ||
      part.includes('대구') || part.includes('굴비') || part.includes('너비아니') ||
      part.includes('함박') || part.includes('스테이크') || part.includes('돈가스') ||
      part.includes('수육') || part.includes('보쌈') || part.includes('육') ||
      part.includes('조기') || part.includes('갈치') || part.includes('샤브') ||
      part.includes('완자') || part.includes('북어') || part.includes('황태')
    ) {
      multiplier = m_p;
    } else {
      multiplier = Math.min(m_k, m_p, m_ca);
    }

    return part.replace(/(\d+)\s*g/g, (match, p1) => {
      const originalWeight = parseInt(p1, 10);
      let adjustedWeight = originalWeight * multiplier;
      
      if (originalWeight > 10) {
        adjustedWeight = Math.round(adjustedWeight / 5) * 5;
      } else {
        adjustedWeight = Math.round(adjustedWeight);
      }
      
      if (adjustedWeight < 5) adjustedWeight = 5;
      return `${adjustedWeight}g`;
    });
  });

  return adjustedParts.join(', ');
}

export function getAdjustedMealPlan(
  potassium: number,
  phosphorus: number,
  calcium: number,
  patientName: string = '',
  patientId: string = ''
): DailyMealPlan[] {
  // Simple seed based on patient name and ID
  const seedString = `${patientName}-${patientId}`;
  let seed = 0;
  for (let i = 0; i < seedString.length; i++) {
    seed = (seed << 5) - seed + seedString.charCodeAt(i);
    seed |= 0;
  }
  
  // Create a copy of the template and shuffle it based on the seed
  // We want to keep the day names (Mon-Sun) and weeks (1-4) structural, 
  // just shuffle the actual meal contents across the 28 days
  const baseMeals = [...FOUR_WEEK_MEAL_PLAN_TEMPLATE];
  
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };
  
  for (let i = baseMeals.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    // Swap everything except week, dayIndex, dayName
    const temp = { ...baseMeals[i] };
    
    baseMeals[i].mealName = baseMeals[j].mealName;
    baseMeals[i].mealDescription = baseMeals[j].mealDescription;
    baseMeals[i].category = baseMeals[j].category;
    baseMeals[i].potassiumMg = baseMeals[j].potassiumMg;
    baseMeals[i].phosphorusMg = baseMeals[j].phosphorusMg;
    baseMeals[i].calciumMg = baseMeals[j].calciumMg;
    
    baseMeals[j].mealName = temp.mealName;
    baseMeals[j].mealDescription = temp.mealDescription;
    baseMeals[j].category = temp.category;
    baseMeals[j].potassiumMg = temp.potassiumMg;
    baseMeals[j].phosphorusMg = temp.phosphorusMg;
    baseMeals[j].calciumMg = temp.calciumMg;
  }

  // Continuous reduction factor based on where they stand relative to the target's starting point
  const factor_k = potassium > 3.5 ? Math.max(0.4, 1.0 - 0.15 * (potassium - 3.5)) : 1.0;
  const factor_p = phosphorus > 2.5 ? Math.max(0.4, 1.0 - 0.13 * (phosphorus - 2.5)) : 1.0;
  const factor_ca = calcium > 8.5 ? Math.max(0.4, 1.0 - 0.15 * (calcium - 8.5)) : 1.0;

  // Single meal limits scaled continuously
  const l_k = 500 * factor_k;
  const l_p = 140 * factor_p;
  const l_ca = 60 * factor_ca;

  // 2. Compute first-pass meal scaling factors to satisfy meal-level limits
  const mealAdjusted = baseMeals.map(meal => {
    let f_k = factor_k;
    if (meal.potassiumMg * f_k > l_k) {
      f_k = l_k / meal.potassiumMg;
    }

    let f_p = factor_p;
    if (meal.phosphorusMg * f_p > l_p) {
      f_p = l_p / meal.phosphorusMg;
    }

    let f_ca = factor_ca;
    if (meal.calciumMg * f_ca > l_ca) {
      f_ca = l_ca / meal.calciumMg;
    }

    return {
      ...meal,
      f_k,
      f_p,
      f_ca
    };
  });

  // 3. Define weekly maximum caps scaled continuously
  const cap_k = 3000 * factor_k;
  const cap_p = 800 * factor_p;
  const cap_ca = 350 * factor_ca;

  // 4. Adjust each week so weekly sum doesn't exceed caps
  const finalMeals: DailyMealPlan[] = [];

  for (let wk = 1; wk <= 4; wk++) {
    const weekMeals = mealAdjusted.filter(m => m.week === wk);
    
    let sum_k = 0;
    let sum_p = 0;
    let sum_ca = 0;
    weekMeals.forEach(m => {
      sum_k += m.potassiumMg * m.f_k;
      sum_p += m.phosphorusMg * m.f_p;
      sum_ca += m.calciumMg * m.f_ca;
    });

    const w_factor_k = sum_k > cap_k ? cap_k / sum_k : 1.0;
    const w_factor_p = sum_p > cap_p ? cap_p / sum_p : 1.0;
    const w_factor_ca = sum_ca > cap_ca ? cap_ca / sum_ca : 1.0;

    weekMeals.forEach(m => {
      const m_k = m.f_k * w_factor_k;
      const m_p = m.f_p * w_factor_p;
      const m_ca = m.f_ca * w_factor_ca;

      const adjustedK = Math.round(m.potassiumMg * m_k);
      const adjustedP = Math.round(m.phosphorusMg * m_p);
      const adjustedCa = Math.round(m.calciumMg * m_ca);
      const adjustedProtein = Math.round(m.proteinG * (0.8 + 0.2 * m_p) * 10) / 10;

      const adjustedDescription = adjustMealDescription(m.mealDescription, m_k, m_p, m_ca);

      finalMeals.push({
        week: m.week,
        dayIndex: m.dayIndex,
        dayName: m.dayName,
        mealName: m.mealName,
        category: m.category,
        mealDescription: adjustedDescription,
        potassiumMg: adjustedK,
        phosphorusMg: adjustedP,
        calciumMg: adjustedCa,
        proteinG: adjustedProtein
      });
    });
  }

  return finalMeals;
}

export default function App() {
  // 1. Patient Profiles State
  const [patientName, setPatientName] = useState<string>('김온원');
  const [patientId, setPatientId] = useState<string>('HN-2026');
  
  // 2. Current Input Labs State
  const [potassiumStr, setPotassiumStr] = useState<string>('5.4');
  const potassium = Number(potassiumStr) || 0;
  const [phosphorusStr, setPhosphorusStr] = useState<string>('4.2');
  const phosphorus = Number(phosphorusStr) || 0;
  const [calciumStr, setCalciumStr] = useState<string>('9.1');
  const calcium = Number(calciumStr) || 0;
  const [hemoglobinStr, setHemoglobinStr] = useState<string>('11.2');
  const hemoglobin = Number(hemoglobinStr) || 0;

  // 3. Lab Records List (Historical trend data)
  const [records, setRecords] = useState<LabRecord[]>([
    { id: '1', date: '04/15', potassium: 5.1, phosphorus: 4.8, calcium: 8.8, hemoglobin: 10.5 },
    { id: '2', date: '05/18', potassium: 4.8, phosphorus: 4.0, calcium: 9.3, hemoglobin: 10.8 },
    { id: '3', date: '06/15', potassium: 5.4, phosphorus: 4.2, calcium: 9.1, hemoglobin: 11.2 }
  ]);

  // Record Form Inputs
  const [inputDate, setInputDate] = useState<string>('06/28');
  const [isAddingRecord, setIsAddingRecord] = useState<boolean>(false);

  // Interactive Navigation Tabs for Live Meal Plan View
  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<'k' | 'p' | 'ca' | 'hb'>('k');

  // Image Export States
  const [isGeneratingImage, setIsGeneratingImage] = useState<boolean>(false);
  const [exportMessage, setExportMessage] = useState<string>('');

  // DOM Ref for html-to-image export
  const exportAreaRef = useRef<HTMLDivElement>(null);

  // Reset records when patient name or ID changes to start empty for a new patient
  const prevPatientRef = useRef({ name: patientName, id: patientId });
  React.useEffect(() => {
    if (patientName !== prevPatientRef.current.name || patientId !== prevPatientRef.current.id) {
      setRecords([]);
      prevPatientRef.current = { name: patientName, id: patientId };
    }
  }, [patientName, patientId]);

  // Add current inputs as a historical record
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputDate.trim()) {
      alert("날짜를 입력해주세요.");
      return;
    }
    const newRecord: LabRecord = {
      id: Date.now().toString(),
      date: inputDate,
      potassium,
      phosphorus,
      calcium,
      hemoglobin
    };
    setRecords(prev => [...prev, newRecord]);
    setIsAddingRecord(false);
  };

  // Delete a historical record
  const handleDeleteRecord = (id: string) => {
    if (confirm("이 기록을 삭제하시겠습니까?")) {
      setRecords(prev => prev.filter(r => r.id !== id));
    }
  };

  // Get active status feedback based on dialysis patient guidelines
  const getPotassiumStatus = (val: number) => {
    if (val < 3.5) return { text: '낮음 (저칼륨혈증 우려)', color: 'text-amber-600 bg-amber-50 border-amber-200', severity: 'warning' };
    if (val > 5.5) return { text: '높음 (고칼륨혈증 위험)', color: 'text-rose-600 bg-rose-50 border-rose-200', severity: 'danger' };
    return { text: '적정 (투석 목표 범위)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', severity: 'safe' };
  };

  const getPhosphorusStatus = (val: number) => {
    if (val < 2.5) return { text: '낮음', color: 'text-amber-600 bg-amber-50 border-amber-200', severity: 'warning' };
    if (val > 5.5) return { text: '높음 (인 축적/합병증 우려)', color: 'text-rose-600 bg-rose-50 border-rose-200', severity: 'danger' };
    return { text: '적정 (투석 목표 범위)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', severity: 'safe' };
  };

  const getCalciumStatus = (val: number) => {
    if (val < 8.5) return { text: '낮음 (저칼슘혈증)', color: 'text-amber-600 bg-amber-50 border-amber-200', severity: 'warning' };
    if (val > 10.2) return { text: '높음 (고칼슘혈증)', color: 'text-rose-600 bg-rose-50 border-rose-200', severity: 'danger' };
    return { text: '적정 (투석 목표 범위)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', severity: 'safe' };
  };

  const getHemoglobinStatus = (val: number) => {
    if (val < 10.0) return { text: '낮음 (빈혈 우려)', color: 'text-amber-600 bg-amber-50 border-amber-200', severity: 'warning' };
    if (val > 11.0) return { text: '높음 (혈전/합병증 우려)', color: 'text-rose-600 bg-rose-50 border-rose-200', severity: 'danger' };
    return { text: '적정 (투석 목표 범위)', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', severity: 'safe' };
  };

  const kStatus = getPotassiumStatus(potassium);
  const pStatus = getPhosphorusStatus(phosphorus);
  const caStatus = getCalciumStatus(calcium);
  const hbStatus = getHemoglobinStatus(hemoglobin);

  // Dynamic clinical recommendations based on inputs
  const getClinicalRecommendation = () => {
    const alerts: string[] = [];
    if (potassium > 5.5) {
      alerts.push("⚠️ 고칼륨 위험군: 채소를 잘게 썰어 끓는 물에 20분 이상 충분히 데쳐 칼륨을 50% 이상 배출하고 드세요. 날채소, 과일 주스, 잡곡밥은 절대 피하고 흰쌀밥과 흰죽을 주식으로 합니다.");
    } else if (potassium < 3.5) {
      alerts.push("⚠️ 저칼륨군: 투석액 유실 등으로 칼륨이 부족한 상태입니다. 의사 진단 하에 저칼륨 과일(사과, 포도)을 소량씩 섭취하는 것이 도움이 됩니다.");
    } else {
      alerts.push("✓ 칼륨 양호: 현재의 저칼륨 조리법(채소 물에 담그기 및 데치기)을 그대로 유지해 주세요.");
    }

    if (phosphorus > 5.5) {
      alerts.push("⚠️ 고인산 위험군: 무기 인(가공 첨가제)이 함유된 치즈, 우유, 아이스크림 등의 유제품 및 가공육, 탄산음료, 견과류는 엄격히 금지됩니다. 천연 단백질 위주로 인산염 흡수제를 복용하며 드세요.");
    } else {
      alerts.push("✓ 인 양호: 인 수치가 투석환자 목표치 내에 있습니다. 인/단백질 비율이 낮은 고품질 가금류 및 흰살 생선 위주 식단을 지속하세요.");
    }

    if (calcium < 8.5) {
      alerts.push("⚠️ 저칼슘 우려: 뼈 약화 및 부갑상선 기능 항진 위험이 있습니다. 칼슘 함량이 조절된 두부 부침이나 동태전 등의 식사를 권장합니다.");
    } else if (calcium > 10.2) {
      alerts.push("⚠️ 고칼슘 위험: 혈관 석회화 유발 인자입니다. 인공신장실 처방에 맞게 약제 조절이 동반되어야 하며, 인산염 바인더 중 칼슘 계열 처방 조절이 필요할 수 있습니다.");
    } else {
      alerts.push("✓ 칼슘 양호: 칼슘-인 전해질 밸런스가 매우 안정적입니다.");
    }

    return alerts;
  };

  // SVG Drawing Helpers for Trend Graph
  const drawTrendLine = (type: 'potassium' | 'phosphorus' | 'calcium' | 'hemoglobin', strokeColor: string, yMin: number, yMax: number) => {
    if (records.length === 0) return null;
    const width = 500;
    const height = 150;
    const paddingX = 40;
    const paddingY = 25;

    // Calculate chart dimensions
    const chartW = width - paddingX * 2;
    const chartH = height - paddingY * 2;

    // Map record values to coordinates
    const points = records.map((rec, idx) => {
      const val = type === 'potassium' ? rec.potassium : type === 'phosphorus' ? rec.phosphorus : type === 'calcium' ? rec.calcium : (rec.hemoglobin || 10);
      const x = paddingX + (idx / Math.max(1, records.length - 1)) * chartW;
      // Normalizing Y value on the scale [yMin, yMax]
      const normalizedY = (val - yMin) / (yMax - yMin);
      const y = height - paddingY - normalizedY * chartH;
      return { x, y, value: val, date: rec.date };
    });

    // Create Path SVG d attribute
    let pathD = "";
    if (points.length > 0) {
      pathD = `M ${points[0].x} ${points[0].y}`;
      for (let i = 1; i < points.length; i++) {
        pathD += ` L ${points[i].x} ${points[i].y}`;
      }
    }

    // Area Under Curve path
    const areaD = points.length > 0
      ? `${pathD} L ${points[points.length - 1].x} ${height - paddingY} L ${points[0].x} ${height - paddingY} Z`
      : "";

    // Target Range Guideline Box
    const kTargetMinY = height - paddingY - ((3.5 - yMin) / (yMax - yMin)) * chartH;
    const kTargetMaxY = height - paddingY - ((5.5 - yMin) / (yMax - yMin)) * chartH;

    const pTargetMinY = height - paddingY - ((2.5 - yMin) / (yMax - yMin)) * chartH;
    const pTargetMaxY = height - paddingY - ((5.5 - yMin) / (yMax - yMin)) * chartH;

    const caTargetMinY = height - paddingY - ((8.5 - yMin) / (yMax - yMin)) * chartH;
    const caTargetMaxY = height - paddingY - ((10.2 - yMin) / (yMax - yMin)) * chartH;
    
    const hbTargetMinY = height - paddingY - ((10.0 - yMin) / (yMax - yMin)) * chartH;
    const hbTargetMaxY = height - paddingY - ((11.0 - yMin) / (yMax - yMin)) * chartH;

    const tMinY = type === 'calcium' ? caTargetMinY : (type === 'phosphorus' ? pTargetMinY : type === 'hemoglobin' ? hbTargetMinY : kTargetMinY);
    const tMaxY = type === 'calcium' ? caTargetMaxY : (type === 'phosphorus' ? pTargetMaxY : type === 'hemoglobin' ? hbTargetMaxY : kTargetMaxY);

    return (
      <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${width} ${height}`}>
        {/* Draw Guideline Grid Background */}
        <line x1={paddingX} y1={paddingY} x2={width - paddingX} y2={paddingY} stroke="#e2e8f0" strokeDasharray="3 3" />
        <line x1={paddingX} y1={height/2} x2={width - paddingX} y2={height/2} stroke="#e2e8f0" strokeDasharray="3 3" />
        <line x1={paddingX} y1={height - paddingY} x2={width - paddingX} y2={height - paddingY} stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Draw Safe Dialysis Range Band (Shaded light green) */}
        <rect 
          x={paddingX} 
          y={tMaxY} 
          width={chartW} 
          height={Math.abs(tMinY - tMaxY)} 
          fill="#34d399" 
          fillOpacity="0.1" 
          stroke="#10b981" 
          strokeWidth="0.5" 
          strokeDasharray="2 2"
        />
        <text x={width - paddingX - 100} y={tMaxY + 12} className="text-[9px] fill-emerald-600 font-medium">
          투석환자 목표범위
        </text>

        {/* Draw Area path */}
        {areaD && <path d={areaD} fill={`url(#gradient-${type})`} />}

        {/* Draw Line path */}
        {pathD && <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />}

        {/* Draw Data Points and Tooltips */}
        {points.map((pt, idx) => (
          <g key={idx}>
            <circle cx={pt.x} cy={pt.y} r="5" fill="#ffffff" stroke={strokeColor} strokeWidth="3" />
            <circle cx={pt.x} cy={pt.y} r="2" fill={strokeColor} />
            {/* Value Text */}
            <text x={pt.x} y={pt.y - 10} textAnchor="middle" className="text-[11px] font-bold fill-slate-800">
              {pt.value}
            </text>
            {/* X-Axis Date labels */}
            <text x={pt.x} y={height - 8} textAnchor="middle" className="text-[10px] font-medium fill-slate-500">
              {pt.date}
            </text>
          </g>
        ))}

        {/* Define Gradients */}
        <defs>
          <linearGradient id={`gradient-${type}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={strokeColor} stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>
    );
  };

  // Dynamically calculate adjusted meal plans based on current patient lab values
  const adjustedMealPlan = React.useMemo(() => {
    return getAdjustedMealPlan(potassium, phosphorus, calcium, patientName, patientId);
  }, [potassium, phosphorus, calcium, patientName, patientId]);

  // 4-Week Custom-highlighted Meal Selection
  const filteredMeals = adjustedMealPlan.filter(m => m.week === activeWeek);

  // Handle PNG Image Download using html-to-image
  const handleDownloadMealPlanAsImage = async () => {
    const targetElement = document.getElementById('printable-export-container');
    if (!targetElement) {
      alert("다운로드 대상을 찾을 수 없습니다.");
      return;
    }

    setIsGeneratingImage(true);
    setExportMessage("인공신장실 전용 4주 식단표 고해상도 이미지를 생성하고 있습니다...");

    try {
      // Temporarily remove hidden styles to render properly, or just use it as is because we positioned it off-screen
      await new Promise((resolve) => setTimeout(resolve, 600));

      const dataUrl = await toPng(targetElement, {
        quality: 0.98,
        pixelRatio: 2.5, // Crisp high density
        backgroundColor: '#f8fafc',
        style: {
          visibility: 'visible',
          display: 'flex'
        }
      });

      const downloadLink = document.createElement('a');
      downloadLink.href = dataUrl;
      downloadLink.download = `온의원_투석환자_식단표_${patientName}_${patientId}.png`;
      downloadLink.click();
      
      setExportMessage("성공적으로 다운로드되었습니다! (앨범/폴더에서 확인하세요)");
      setTimeout(() => setExportMessage(''), 4000);
    } catch (err) {
      console.error(err);
      alert("식단표 이미지 다운로드 중 에러가 발생했습니다. 브라우저 환경 및 팝업 제한을 해제하고 다시 시도하세요.");
      setExportMessage('');
    } finally {
      setIsGeneratingImage(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased pb-20">
      {/* 1. Header Banner */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            {/* Custom OnLogo reflecting the uploaded image style */}
            <OnLogo className="w-12 h-12 flex-shrink-0" />
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md border border-orange-200">
                  사)누가온의원
                </span>
                <span className="text-xs text-slate-500 font-extrabold tracking-wider">
                  프리미엄 혈액투석센터 • 인공신장실
                </span>
              </div>
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                투석환자 맞춤 건강 전해질 식단 플래너
              </h1>
            </div>
          </div>
          
          <div className="flex items-center gap-2 bg-slate-100 p-3 rounded-xl border border-slate-200">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-white rounded-md shadow-xs text-xs font-medium">
              <User className="w-5 h-5 text-slate-500" />
              <span>환자: <strong>{patientName || '미지정'}</strong></span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 text-[11px] font-mono">No.{patientId || '0000'}</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        
        {/* TOP PANEL: Inputs + Live Dialysis Guidelines */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          
          {/* A. 환자 및 전해질 수치 입력부 (Left Card) */}
          <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-100">
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 bg-orange-600 rounded-full"></span>
                  환자 정보 및 전해질 수치 입력
                </h2>
                <span className="text-xs text-slate-400 font-mono">Real-time matching</span>
              </div>

              <div className="space-y-4">
                {/* Name and ID row */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">환자명</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-orange-500 focus:bg-white font-medium transition"
                      value={patientName}
                      onChange={(e) => setPatientName(e.target.value)}
                      placeholder="이름 입력"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">환자번호</label>
                    <input 
                      type="text"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-hidden focus:border-orange-500 focus:bg-white font-mono transition"
                      value={patientId}
                      onChange={(e) => setPatientId(e.target.value)}
                      placeholder="환자번호 입력"
                    />
                  </div>
                </div>

                {/* Potassium */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>칼륨 수치 (K)</span>
                      <span className="text-[10px] text-slate-400 font-normal">(목표: 3.5 - 5.5 mEq/L)</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-orange-600">{potassium} mEq/L</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="range"
                      min="2.0"
                      max="7.5"
                      step="0.1"
                      className="grow accent-orange-600"
                      value={potassiumStr}
                      onChange={(e) => setPotassiumStr(e.target.value)}
                    />
                    <input 
                      type="number"
                      step="0.1"
                      min="2.0"
                      max="7.5"
                      className="w-16 text-center py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold focus:outline-hidden"
                      value={potassiumStr}
                      onChange={(e) => setPotassiumStr(e.target.value)}
                    />
                  </div>
                  <div className={`mt-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1.5 ${kStatus.color}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                    <span>칼륨 상태: <strong>{kStatus.text}</strong></span>
                  </div>
                </div>

                {/* Phosphorus */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>인 수치 (P)</span>
                      <span className="text-[10px] text-slate-400 font-normal">(목표: 2.5 - 5.5 mg/dL)</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-orange-600">{phosphorus} mg/dL</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="range"
                      min="1.5"
                      max="13.0"
                      step="0.1"
                      className="grow accent-orange-600"
                      value={phosphorusStr}
                      onChange={(e) => setPhosphorusStr(e.target.value)}
                    />
                    <input 
                      type="number"
                      step="0.1"
                      min="1.5"
                      max="13.0"
                      className="w-16 text-center py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold focus:outline-hidden"
                      value={phosphorusStr}
                      onChange={(e) => setPhosphorusStr(e.target.value)}
                    />
                  </div>
                  <div className={`mt-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1.5 ${pStatus.color}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                    <span>인 상태: <strong>{pStatus.text}</strong></span>
                  </div>
                </div>

                {/* Calcium */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>칼슘 수치 (Ca)</span>
                      <span className="text-[10px] text-slate-400 font-normal">(목표: 8.5 - 10.2 mg/dL)</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-orange-600">{calcium} mg/dL</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="range"
                      min="6.0"
                      max="13.0"
                      step="0.1"
                      className="grow accent-orange-600"
                      value={calciumStr}
                      onChange={(e) => setCalciumStr(e.target.value)}
                    />
                    <input 
                      type="number"
                      step="0.1"
                      min="6.0"
                      max="13.0"
                      className="w-16 text-center py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold focus:outline-hidden"
                      value={calciumStr}
                      onChange={(e) => setCalciumStr(e.target.value)}
                    />
                  </div>
                  <div className={`mt-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1.5 ${caStatus.color}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                    <span>칼슘 상태: <strong>{caStatus.text}</strong></span>
                  </div>
                </div>

                {/* Hemoglobin */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
                      <span>혈색소 (Hb)</span>
                      <span className="text-[10px] text-slate-400 font-normal">(목표: 10.0 - 11.0 g/dL)</span>
                    </label>
                    <span className="text-xs font-mono font-bold text-orange-600">{hemoglobin} g/dL</span>
                  </div>
                  <div className="flex gap-3 items-center">
                    <input 
                      type="range"
                      min="5.0"
                      max="16.0"
                      step="0.1"
                      className="grow accent-orange-600"
                      value={hemoglobinStr}
                      onChange={(e) => setHemoglobinStr(e.target.value)}
                    />
                    <input 
                      type="number"
                      step="0.1"
                      min="5.0"
                      max="16.0"
                      className="w-16 text-center py-1 bg-slate-50 border border-slate-200 rounded-md text-xs font-bold focus:outline-hidden"
                      value={hemoglobinStr}
                      onChange={(e) => setHemoglobinStr(e.target.value)}
                    />
                  </div>
                  <div className={`mt-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border flex items-center gap-1.5 ${hbStatus.color}`}>
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-current" />
                    <span>혈색소 상태: <strong>{hbStatus.text}</strong></span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
              <button 
                onClick={() => setIsAddingRecord(true)}
                className="w-full flex items-center justify-center gap-2 py-2 px-4 border border-orange-200 hover:border-orange-400 text-orange-700 hover:bg-orange-50 rounded-xl text-xs font-semibold transition active:scale-98"
              >
                <Plus className="w-3.5 h-3.5" />
                이 수치로 변화 대조 그래프에 새 기록 추가
              </button>
            </div>
          </div>

          {/* B. 수치 변화 대조 그래프 및 대조 검사지표 (Right Card) */}
          <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-orange-600" />
                  <h2 className="text-base font-bold text-slate-900">
                    전해질 수치의 변화 대조 그래프 (Clinical Trend)
                  </h2>
                </div>
                {/* Metric Selector Tabs */}
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs self-start sm:self-auto">
                  <button 
                    onClick={() => setActiveTab('k')}
                    className={`px-3 py-1 rounded-md font-semibold transition ${activeTab === 'k' ? 'bg-white shadow-xs text-orange-600' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    칼륨 (K)
                  </button>
                  <button 
                    onClick={() => setActiveTab('p')}
                    className={`px-3 py-1 rounded-md font-semibold transition ${activeTab === 'p' ? 'bg-white shadow-xs text-orange-600' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    인 (P)
                  </button>
                  <button 
                    onClick={() => setActiveTab('ca')}
                    className={`px-3 py-1 rounded-md font-semibold transition ${activeTab === 'ca' ? 'bg-white shadow-xs text-orange-600' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    칼슘 (Ca)
                  </button>
                  <button 
                    onClick={() => setActiveTab('hb')}
                    className={`px-3 py-1 rounded-md font-semibold transition ${activeTab === 'hb' ? 'bg-white shadow-xs text-orange-600' : 'text-slate-600 hover:text-slate-900'}`}
                  >
                    혈색소 (Hb)
                  </button>
                </div>
              </div>

              {/* Render Selected Trend Graph */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col items-center justify-center min-h-[190px]">
                {records.length === 0 ? (
                  <div className="text-center py-6 text-slate-400">
                    <TrendingUp className="w-8 h-8 mx-auto mb-2 opacity-40 text-orange-600" />
                    <p className="text-xs font-semibold text-slate-700">대조 그래프 기록이 비어있습니다.</p>
                    <p className="text-[10px] text-slate-400 mt-1 max-w-[280px] mx-auto">
                      새로운 환자입니다. 왼쪽 하단의 <strong>'이 수치로 변화 대조 그래프에 새 기록 추가'</strong> 버튼을 눌러 첫 기록을 입력해보세요!
                    </p>
                  </div>
                ) : (
                  <>
                    {activeTab === 'k' && (
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1 px-1">
                          <span className="text-xs font-semibold text-slate-500">칼륨 수치 이력 대조 (단위: mEq/L)</span>
                          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm">목표: 3.5 ~ 5.5</span>
                        </div>
                        {drawTrendLine('potassium', '#f97316', 2.0, 7.5)}
                      </div>
                    )}
                    {activeTab === 'p' && (
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1 px-1">
                          <span className="text-xs font-semibold text-slate-500">인 수치 이력 대조 (단위: mg/dL)</span>
                          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm">목표: 2.5 ~ 5.5</span>
                        </div>
                        {drawTrendLine('phosphorus', '#ec4899', 1.5, 13.0)}
                      </div>
                    )}
                    {activeTab === 'ca' && (
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1 px-1">
                          <span className="text-xs font-semibold text-slate-500">칼슘 수치 이력 대조 (단위: mg/dL)</span>
                          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm">목표: 8.5 ~ 10.2</span>
                        </div>
                        {drawTrendLine('calcium', '#f59e0b', 6.0, 13.0)}
                      </div>
                    )}
                    {activeTab === 'hb' && (
                      <div className="w-full">
                        <div className="flex justify-between items-center mb-1 px-1">
                          <span className="text-xs font-semibold text-slate-500">혈색소 수치 이력 대조 (단위: g/dL)</span>
                          <span className="text-xs text-emerald-600 font-bold bg-emerald-50 px-2 py-0.5 rounded-sm">목표: 10.0 ~ 11.0</span>
                        </div>
                        {drawTrendLine('hemoglobin', '#8b5cf6', 5.0, 16.0)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* List of historical records & Add dialog */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-xs font-bold text-slate-700">기록된 지표 변화 대조표</h3>
                {records.length > 0 && <span className="text-[11px] text-slate-400">최근순 정렬</span>}
              </div>
              {records.length === 0 ? (
                <div className="text-center py-4 bg-slate-50/50 border border-dashed border-slate-200 rounded-xl text-[11px] text-slate-400 font-medium">
                  환자 정보 변경으로 기록이 초기화되었습니다. 신규 검사 수치 대조선 데이터를 등록할 수 있습니다.
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-h-[85px] overflow-y-auto pr-1">
                  {records.map((r, i) => (
                    <div key={r.id} className="bg-slate-50 p-2 rounded-lg border border-slate-150 flex flex-col justify-between relative group hover:border-orange-200 transition">
                      <div className="flex justify-between items-center text-[10px] text-slate-400 mb-1">
                        <span className="font-semibold text-slate-600">{r.date} 검사</span>
                        <button 
                          onClick={() => handleDeleteRecord(r.id)}
                          className="text-slate-400 hover:text-rose-600 transition"
                          title="기록 삭제"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-4 text-center text-xs font-mono">
                        <div>
                          <div className="text-[9px] text-slate-400">K</div>
                          <div className="font-bold text-orange-600">{r.potassium}</div>
                        </div>
                        <div className="border-x border-slate-200">
                          <div className="text-[9px] text-slate-400">P</div>
                          <div className="font-bold text-pink-600">{r.phosphorus}</div>
                        </div>
                        <div className="border-r border-slate-200">
                          <div className="text-[9px] text-slate-400">Ca</div>
                          <div className="font-bold text-amber-600">{r.calcium}</div>
                        </div>
                        <div>
                          <div className="text-[9px] text-slate-400">Hb</div>
                          <div className="font-bold text-purple-600">{r.hemoglobin || '-'}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* PROMPT/DIALOG TO ADD RECORD */}
        {isAddingRecord && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 w-full max-w-sm shadow-xl animate-in fade-in zoom-in-95">
              <h3 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-orange-600" />
                지표 변화 대조 기록 추가
              </h3>
              <form onSubmit={handleAddRecord} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">검사 측정일 (예: 06/28, 07/15)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="MM/DD"
                    value={inputDate} 
                    onChange={(e) => setInputDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-mono focus:outline-hidden focus:border-orange-500"
                  />
                </div>
                <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs space-y-1.5 font-mono">
                  <div className="flex justify-between text-slate-600">
                    <span>칼륨 (Potassium):</span>
                    <strong className="text-orange-600">{potassium} mEq/L</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>인 (Phosphorus):</span>
                    <strong className="text-pink-600">{phosphorus} mg/dL</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>칼슘 (Calcium):</span>
                    <strong className="text-amber-600">{calcium} mg/dL</strong>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>혈색소 (Hemoglobin):</span>
                    <strong className="text-purple-600">{hemoglobin} g/dL</strong>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingRecord(false)}
                    className="w-1/2 py-2 px-3 bg-slate-100 hover:bg-slate-200 rounded-lg text-xs font-semibold text-slate-700 transition"
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="w-1/2 py-2 px-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg text-xs font-semibold transition flex items-center justify-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    대조선 추가
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* CLINICAL RECOMMENDATION BULLETINS */}
        <div className="bg-gradient-to-r from-orange-50/60 to-amber-50/40 border border-orange-100 rounded-2xl p-6 mb-8 shadow-xs">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="bg-orange-100 p-3 rounded-xl text-orange-700">
              <Info className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              송현철 대표원장의 전해질 기반 식단 가이드라인 및 주의사항
            </h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            {getClinicalRecommendation().map((rec, index) => {
              const isWarning = rec.includes('⚠️');
              return (
                <div 
                  key={index} 
                  className={`p-3 rounded-xl border ${isWarning ? 'bg-rose-50/70 border-rose-100 text-rose-950' : 'bg-emerald-50/50 border-emerald-100 text-emerald-950'}`}
                >
                  <div className="font-semibold leading-relaxed">{rec}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CSV Nutritional Validation Hub */}
        <CsvValidator 
          mealPlan={adjustedMealPlan} 
          potassium={potassium} 
          phosphorus={phosphorus} 
          calcium={calcium} 
        />

        {/* 2. MEAL PLAN RESULTS HEADER & CONTROL */}
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs mb-8">
          
          <div className="p-6 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="w-5 h-5 text-orange-600" />
                <h2 className="text-base font-extrabold text-slate-900">
                  이번 달 투석환자 건강 맞춤 식단표 (4주 패키지)
                </h2>
              </div>
              <p className="text-xs text-slate-500">
                환자의 현재 칼륨/인/칼슘 수치를 고려하여 조리 방식 경고 스티커가 자동 연동된 식단표입니다.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Export Button */}
              <button
                onClick={handleDownloadMealPlanAsImage}
                disabled={isGeneratingImage}
                className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 disabled:bg-slate-400 text-white px-4 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs active:scale-98"
              >
                <Download className="w-4 h-4" />
                {isGeneratingImage ? "식단 이미지 생성 중..." : "4주 전체 식단표 이미지 다운로드"}
              </button>
            </div>
          </div>

          {/* Feedback message overlay */}
          {exportMessage && (
            <div className="bg-orange-600 text-white text-xs px-6 py-2.5 flex items-center justify-center gap-2 animate-pulse">
              <Sparkles className="w-4 h-4" />
              <span>{exportMessage}</span>
            </div>
          )}

          {/* WEEK SELECTOR TABS FOR INTERACTIVE VIEW */}
          <div className="border-b border-slate-100 bg-white flex justify-center py-3">
            <div className="inline-flex p-1 bg-slate-100 rounded-xl border border-slate-200">
              {[1, 2, 3, 4].map((wk) => (
                <button
                  key={wk}
                  onClick={() => setActiveWeek(wk)}
                  className={`px-6 py-1.5 rounded-lg text-xs font-bold transition ${activeWeek === wk ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
                >
                  {wk}주차 식단
                </button>
              ))}
            </div>
          </div>

          {/* INTERACTIVE MEAL WEEK TABLE (7 DAYS) */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {filteredMeals.map((day) => {
                const isHighPotassium = potassium > 5.5;
                const isHighPhosphorus = phosphorus > 5.5;
                const cleanMealName = day.mealName.replace(/\s*식단$/, '');
                return (
                  <div key={day.dayIndex} className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:shadow-md transition">
                    {/* Header */}
                    <div className="bg-slate-100 px-3 py-2 border-b border-slate-200 flex justify-between items-center">
                      <span className="font-bold text-sm text-slate-800">{day.dayName}</span>
                      <span className="text-[10px] font-semibold font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-md">
                        {activeWeek}주-{day.dayIndex + 1}일
                      </span>
                    </div>

                    {/* Meal Content */}
                    <div className="flex flex-col grow">
                      {/* Info and ingredients */}
                      <div className="p-4 grow flex flex-col justify-between gap-3 bg-white">
                        <div className="space-y-2">
                          {/* Category Badge */}
                          <div className="inline-block whitespace-nowrap text-[10px] font-extrabold text-orange-600 bg-orange-50 px-2 py-0.5 rounded">
                            {day.category === 'bulgogi' ? '🥩 소고기' :
                             day.category === 'fish' ? '🐟 생선류' :
                             day.category === 'tofu' ? '🌱 두부류' :
                             day.category === 'chicken' ? '🐔 닭고기' :
                             day.category === 'pork' ? '🐖 돼지고기' : '🥗 채식/기타'}
                          </div>
                          
                          <h4 className="text-[15px] font-extrabold text-slate-950 tracking-tight leading-snug hover:text-orange-600 transition-colors">
                            {cleanMealName}
                          </h4>
                          <div className="bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                            <p className="text-[11px] text-slate-800 font-bold leading-relaxed">
                              {day.mealDescription}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Footer Warning Badges based on laboratory inputs */}
                    {(isHighPotassium || isHighPhosphorus) && (
                      <div className="p-2 bg-white border-t border-slate-100 text-[10px] space-y-1">
                        {isHighPotassium && (
                          <div className="bg-rose-50 text-rose-700 border border-rose-100 rounded-sm py-0.5 px-1.5 font-semibold text-center leading-tight">
                            ⚠️ 칼륨 경고: 채소 데쳐먹기 필수
                          </div>
                        )}
                        {isHighPhosphorus && (
                          <div className="bg-amber-50 text-amber-700 border border-amber-100 rounded-sm py-0.5 px-1.5 font-semibold text-center leading-tight">
                            ⚠️ 인 경고: 유제품 가공식 금지
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      {/* 
        3. PRINTABLE HIDDEN OFFSCREEN HIGH-RESOLUTION CONTAINER 
        This is captured by html-to-image. It formats all 4 weeks * 7 days inside a magnificent table.
        It uses A3 portrait dimensions (1122x1587) to dynamically 
        scale the table font size to perfectly fit 1 page regardless of available space.
      */}
      <div className="absolute -left-[9999px] -top-[9999px] overflow-hidden" style={{ width: '1122px' }}>
        <div 
          id="printable-export-container" 
          ref={exportAreaRef} 
          className="bg-white p-6 w-[1122px] h-[1587px] border border-slate-300 flex flex-col gap-3"
        >
          {/* Export Header */}
          <div className="bg-white border-2 border-orange-500 rounded-xl p-3 flex justify-between items-center shrink-0">
            <div className="flex items-center gap-4">
              <OnLogo className="w-16 h-16 flex-shrink-0" />
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[12px] bg-orange-600 text-white font-extrabold px-2 py-0.5 rounded-sm uppercase tracking-wide">
                    Clinical Dialysis Diet
                  </span>
                  <span className="text-[14px] text-slate-500 font-bold font-mono">ON Renal Care Center</span>
                </div>
                <h1 className="text-[26px] font-extrabold text-slate-900 tracking-tight leading-none mb-2">
                  온의원 인공신장실 맞춤형 투석 환자 4주 건강 식단표
                </h1>
                <p className="text-[14px] text-slate-500 font-semibold">
                  본 식단은 투석 환자의 혈액검사 전해질 지표(칼륨, 인, 칼슘) 상태를 반영하여 영양사가 구성한 안심 식단 가이드라인입니다.
                </p>
              </div>
            </div>
            
            {/* Patient Badge */}
            <div className="bg-slate-50 border border-slate-200 p-3 rounded-lg text-right flex flex-col gap-1.5 min-w-[220px]">
              <div className="text-[13px] text-slate-500 font-bold">환자 정보 (Patient Info)</div>
              <div className="text-[20px] font-extrabold text-slate-900">
                {patientName || '미지정'}님
              </div>
              <div className="text-[12px] font-mono text-slate-400">
                환자번호: {patientId || '0000'} | 발행일: {new Date().toLocaleDateString('ko-KR')}
              </div>
            </div>
          </div>

          {/* Current Labs Indicator Row */}
          <div className="grid grid-cols-4 gap-4 bg-slate-50/50 p-2 border border-slate-200 rounded-xl text-center shrink-0">
            <div className={`p-2 bg-white rounded-lg border ${kStatus.color}`}>
              <div className="text-[13px] font-bold text-slate-500">측정 칼륨 (K)</div>
              <div className="text-[22px] font-extrabold font-mono mt-1 text-emerald-600">{potassium} mEq/L</div>
              <div className="text-[12px] mt-1 font-semibold text-emerald-600">{kStatus.text}</div>
            </div>
            <div className={`p-2 bg-white rounded-lg border ${pStatus.color}`}>
              <div className="text-[13px] font-bold text-slate-500">측정 인 (P)</div>
              <div className="text-[22px] font-extrabold font-mono mt-1 text-emerald-600">{phosphorus} mg/dL</div>
              <div className="text-[12px] mt-1 font-semibold text-emerald-600">{pStatus.text}</div>
            </div>
            <div className={`p-2 bg-white rounded-lg border ${caStatus.color}`}>
              <div className="text-[13px] font-bold text-slate-500">측정 칼슘 (Ca)</div>
              <div className="text-[22px] font-extrabold font-mono mt-1 text-emerald-600">{calcium} mg/dL</div>
              <div className="text-[12px] mt-1 font-semibold text-emerald-600">{caStatus.text}</div>
            </div>
            <div className={`p-2 bg-white rounded-lg border border-rose-200 bg-rose-50 text-rose-600`}>
              <div className="text-[13px] font-bold text-slate-500">측정 혈색소 (Hb)</div>
              <div className="text-[22px] font-extrabold font-mono mt-1">{hemoglobin} g/dL</div>
              <div className="text-[12px] mt-1 font-semibold">높음 (혈전/합병증 우려)</div>
            </div>
          </div>

          {/* Clinical Directives */}
          <div className="bg-amber-50/70 border border-amber-200 rounded-lg p-3 text-[14px] shrink-0">
            <h4 className="font-bold text-slate-950 flex items-center gap-1.5 mb-2 text-[15px]">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              송현철 대표원장 정밀 식사조리 지시사항 (Essential Guidelines)
            </h4>
            <div className="space-y-1.5 text-slate-800 leading-snug font-semibold">
              <div>• <strong>저칼륨 수칙:</strong> 채소는 얇게 채썰어 뜨거운 물에 20분 이상 데쳐 물은 버리고 섭취. 모든 과일은 껍질과 씨를 제거하고 소량만.</div>
              <div>• <strong>저인 수칙:</strong> 가공 소스 및 보존제 인산염이 든 인스턴트 가공식품, 가공치즈, 유제품 등 절대 금지. 식사 때 인결합제를 처방대로 반드시 복용.</div>
              <div>• <strong>단백질 밸런스:</strong> 과다한 적색육 대신 계란 흰자, 닭안심, 대구 등 담백한 흰살생선으로 필요 단백질을 안전하게 보충할 것.</div>
            </div>
          </div>

          {/* FULL 4-WEEK GRID SUMMARY TABLE */}
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col min-h-0">
            {[1, 2, 3, 4].map((wk) => {
              const weekMeals = adjustedMealPlan.filter(m => m.week === wk);
              
              const weekThemes = {
                1: { headerBg: 'bg-blue-100', headerText: 'text-blue-900', border: 'border-blue-200', dayHeaderBg: 'bg-blue-50/80', dayBorder: 'border-blue-100', dayText: 'text-blue-950' },
                2: { headerBg: 'bg-emerald-100', headerText: 'text-emerald-900', border: 'border-emerald-200', dayHeaderBg: 'bg-emerald-50/80', dayBorder: 'border-emerald-100', dayText: 'text-emerald-950' },
                3: { headerBg: 'bg-purple-100', headerText: 'text-purple-900', border: 'border-purple-200', dayHeaderBg: 'bg-purple-50/80', dayBorder: 'border-purple-100', dayText: 'text-purple-950' },
                4: { headerBg: 'bg-orange-100', headerText: 'text-orange-900', border: 'border-orange-200', dayHeaderBg: 'bg-orange-50/80', dayBorder: 'border-orange-100', dayText: 'text-orange-950' },
              } as const;
              
              const theme = weekThemes[wk as keyof typeof weekThemes];

              return (
                <div key={wk} className={`border-b last:border-b-0 ${theme.border} flex-1 flex flex-col min-h-0`}>
                  <div className={`${theme.headerBg} px-4 py-2 font-extrabold ${theme.headerText} border-b ${theme.border} flex items-center justify-between shrink-0 text-[16px]`}>
                    <span>{wk}주차 맞춤 식단 (Week {wk} Menu Plan)</span>
                    <span className="opacity-75 font-normal text-[13px]">월요일 ~ 일요일 전체 플랜</span>
                  </div>
                  <div className="grid grid-cols-7 divide-x divide-slate-200 bg-white flex-1 min-h-0">
                    {weekMeals.map((day) => {
                      const cleanMealName = day.mealName.replace(/\s*식단$/, '');
                      const showWarning = potassium > 5.5 || phosphorus > 5.5;
                      return (
                        <div key={day.dayIndex} className="p-2 flex flex-col h-full bg-white min-h-0 overflow-hidden">
                          <div>
                            <div className={`font-extrabold ${theme.dayText} border-b ${theme.dayBorder} pb-1 mb-2 text-center ${theme.dayHeaderBg} py-1 rounded-sm text-[15px]`}>
                              {day.dayName}
                            </div>
                            
                            <div className="space-y-1.5 flex flex-col">
                              {/* Category Small Label */}
                              <div className="self-start inline-block whitespace-nowrap font-extrabold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200 text-[11px]">
                                {day.category === 'bulgogi' ? '🥩 소고기' :
                                 day.category === 'fish' ? '🐟 생선류' :
                                 day.category === 'tofu' ? '🌱 두부류' :
                                 day.category === 'chicken' ? '🐔 닭고기' :
                                 day.category === 'pork' ? '🐖 돼지고기' : '🥗 채식/기타'}
                              </div>
                              <div className="font-extrabold text-slate-950 leading-tight tracking-tight mt-1 text-[15px]">
                                {cleanMealName}
                              </div>
                              <div className="text-slate-800 leading-[1.4] font-semibold bg-slate-50/85 p-1.5 mt-1 rounded-sm border border-slate-100 text-[13px]">
                                {day.mealDescription}
                              </div>
                            </div>
                          </div>

                          {/* Warn badges inside printable table (only when warning exists) */}
                          {showWarning && (
                            <div className="mt-auto pt-2 font-bold text-center text-[12px]">
                              {potassium > 5.5 ? (
                                <span className="text-rose-600 bg-rose-50 px-1 py-0.5 rounded-xs block">K 경고: 데친채소</span>
                              ) : phosphorus > 5.5 ? (
                                <span className="text-amber-600 bg-amber-50 px-1 py-0.5 rounded-xs block">P 경고: 유제품제한</span>
                              ) : null}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Export Footer */}
          <div className="text-[13px] text-slate-400 font-semibold border-t border-slate-200 pt-2 flex justify-between items-center shrink-0">
            <span>본 식단표는 대한신장학회 지침 및 온의원 인공신장실 의료 자문을 바탕으로 구성된 안심 식단 가이드라인입니다.</span>
            <span>원장 송현철 전문의 (직인 생략)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
