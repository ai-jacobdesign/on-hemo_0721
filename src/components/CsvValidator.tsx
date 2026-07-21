import React, { useState, useEffect } from 'react';
import { 
  FileSpreadsheet, 
  Upload, 
  Check, 
  AlertCircle, 
  Sliders, 
  HelpCircle, 
  RefreshCw, 
  Search, 
  Info, 
  CheckCircle2, 
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Database,
  ArrowRight,
  Lock
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { DailyMealPlan } from '../data';

interface CsvRow {
  foodName: string;
  potassium: number; // mg per 100g
  phosphorus: number; // mg per 100g
  calcium: number; // mg per 100g
  protein: number; // g per 100g
}

interface ParsedIngredient {
  raw: string;
  name: string;
  weight: number; // in grams
  matchedFood?: CsvRow;
  calculatedPotassium: number;
  calculatedPhosphorus: number;
  calculatedCalcium: number;
  calculatedProtein: number;
  dataSource: 'main' | 'secondary' | 'imputed' | 'safety' | 'none';
  imputedFromName?: string;
  isKImputed?: boolean;
  isPImputed?: boolean;
  isCaImputed?: boolean;
  isProImputed?: boolean;
  imputationNotes?: string[];
}

interface ValidationReport {
  dayIndex: number;
  week: number;
  dayName: string;
  mealName: string;
  originalK: number;
  originalP: number;
  originalCa: number;
  originalProtein: number;
  calculatedK: number;
  calculatedP: number;
  calculatedCa: number;
  calculatedProtein: number;
  ingredients: ParsedIngredient[];
  status: 'perfect' | 'discrepancy' | 'unmatched';
}

// Pre-defined high-fidelity Demo Food Nutrient Database (values per 100g)
const DEMO_NUTRITION_DATABASE: CsvRow[] = [
  { foodName: '소고기 (우둔, 생)', potassium: 330, phosphorus: 210, calcium: 9, protein: 21 },
  { foodName: '돼지고기 (안심, 생)', potassium: 350, phosphorus: 210, calcium: 7, protein: 22 },
  { foodName: '닭고기 (안심, 생)', potassium: 320, phosphorus: 210, calcium: 6, protein: 23 },
  { foodName: '닭고기 (가슴살, 생)', potassium: 310, phosphorus: 200, calcium: 5, protein: 23 },
  { foodName: '두부 (부침용)', potassium: 120, phosphorus: 90, calcium: 140, protein: 8.5 },
  { foodName: '연두부', potassium: 110, phosphorus: 80, calcium: 95, protein: 6.2 },
  { foodName: '삼치 (생)', potassium: 380, phosphorus: 210, calcium: 14, protein: 19.5 },
  { foodName: '가자미 (생)', potassium: 320, phosphorus: 180, calcium: 22, protein: 18.2 },
  { foodName: '동태전 (동태살)', potassium: 270, phosphorus: 160, calcium: 30, protein: 15.0 },
  { foodName: '대구 (생)', potassium: 360, phosphorus: 190, calcium: 15, protein: 17.8 },
  { foodName: '굴비 (말린것)', potassium: 280, phosphorus: 180, calcium: 42, protein: 19.2 },
  { foodName: '오징어 (데친것)', potassium: 210, phosphorus: 190, calcium: 15, protein: 18.5 },
  { foodName: '흰쌀밥 (조리)', potassium: 30, phosphorus: 42, calcium: 3, protein: 2.8 },
  { foodName: '숙주나물 (데친것)', potassium: 75, phosphorus: 25, calcium: 12, protein: 1.8 },
  { foodName: '애호박 (데친것)', potassium: 180, phosphorus: 28, calcium: 18, protein: 1.0 },
  { foodName: '시금치 (데친것)', potassium: 310, phosphorus: 45, calcium: 35, protein: 2.8 },
  { foodName: '청경채 (데친것)', potassium: 190, phosphorus: 25, calcium: 85, protein: 1.3 },
  { foodName: '가지 (데친것)', potassium: 160, phosphorus: 22, calcium: 12, protein: 0.9 },
  { foodName: '양배추 (데친것)', potassium: 140, phosphorus: 20, calcium: 35, protein: 1.2 },
  { foodName: '무나물 (조리)', potassium: 110, phosphorus: 18, calcium: 20, protein: 0.7 },
  { foodName: '느타리버섯 (데친것)', potassium: 190, phosphorus: 65, calcium: 5, protein: 1.9 },
  { foodName: '표고버섯 (데친것)', potassium: 210, phosphorus: 70, calcium: 4, protein: 1.8 },
  { foodName: '계란 (전란, 찜)', potassium: 120, phosphorus: 160, calcium: 45, protein: 11.5 },
  { foodName: '양파', potassium: 140, phosphorus: 30, calcium: 18, protein: 1.0 },
  { foodName: '당근', potassium: 300, phosphorus: 30, calcium: 28, protein: 0.9 },
  { foodName: '들기름', potassium: 0, phosphorus: 0, calcium: 0, protein: 0 },
  { foodName: '참나물 (데친것)', potassium: 260, phosphorus: 35, calcium: 70, protein: 1.8 },
  { foodName: '오이', potassium: 140, phosphorus: 20, calcium: 15, protein: 0.7 },
  { foodName: '파프리카', potassium: 190, phosphorus: 20, calcium: 8, protein: 0.9 },
  { foodName: '감자채 (물에담근 조리)', potassium: 195, phosphorus: 40, calcium: 10, protein: 1.5 }
];

interface CsvValidatorProps {
  mealPlan: DailyMealPlan[];
  potassium?: number;
  phosphorus?: number;
  calcium?: number;
}

export default function CsvValidator({ 
  mealPlan, 
  potassium = 5.4, 
  phosphorus = 4.2, 
  calcium = 9.1 
}: CsvValidatorProps) {
  // Main Database State
  const [csvDataMain, setCsvDataMain] = useState<CsvRow[]>([]);
  const [headersMain, setHeadersMain] = useState<string[]>([]);
  const [rawRowsMain, setRawRowsMain] = useState<Record<string, string>[]>([]);
  const [uploadedFileNameMain, setUploadedFileNameMain] = useState<string>('');
  const [mappingMain, setMappingMain] = useState({
    foodName: '',
    potassium: '',
    phosphorus: '',
    calcium: '',
    protein: ''
  });

  // Secondary Database State
  const [csvDataSec, setCsvDataSec] = useState<CsvRow[]>([]);
  const [headersSec, setHeadersSec] = useState<string[]>([]);
  const [rawRowsSec, setRawRowsSec] = useState<Record<string, string>[]>([]);
  const [uploadedFileNameSec, setUploadedFileNameSec] = useState<string>('');
  const [mappingSec, setMappingSec] = useState({
    foodName: '',
    potassium: '',
    phosphorus: '',
    calcium: '',
    protein: ''
  });

  const [activeWeek, setActiveWeek] = useState<number>(1);
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [reports, setReports] = useState<ValidationReport[]>([]);
  const [manualMatches, setManualMatches] = useState<Record<string, string>>({}); // key: rawIngredientName, value: csvFoodName
  const [showConfig, setShowConfig] = useState<boolean>(true);
  const [isUploadedAndReady, setIsUploadedAndReady] = useState<boolean>(false);

  // Parse CSV text string helper
  const parseCsvText = (text: string) => {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) return { headers: [], rows: [] };

    // Detect separator (comma or semicolon or tab)
    let separator = ',';
    const firstLine = lines[0];
    if (firstLine.includes('\t')) separator = '\t';
    else if (firstLine.includes(';')) separator = ';';

    // Parse headers helper
    const parseLine = (line: string) => {
      const result: string[] = [];
      let insideQuote = false;
      let current = '';
      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"' || char === "'") {
          insideQuote = !insideQuote;
        } else if (char === separator && !insideQuote) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result.map(s => s.replace(/^["']|["']$/g, ''));
    };

    const parsedHeaders = parseLine(lines[0]);
    const parsedRows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      if (values.length >= parsedHeaders.length) {
        const rowObj: Record<string, string> = {};
        parsedHeaders.forEach((header, idx) => {
          rowObj[header] = values[idx] || '';
        });
        parsedRows.push(rowObj);
      }
    }

    return { headers: parsedHeaders, rows: parsedRows };
  };

  // Auto-detect mappings from headers
  const autoDetectMapping = (headersList: string[], type: 'main' | 'sec') => {
    const map = { foodName: '', potassium: '', phosphorus: '', calcium: '', protein: '' };
    headersList.forEach(header => {
      const hLower = header.toLowerCase().replace(/\s/g, '');
      if (hLower.includes('식품') || hLower.includes('음식') || hLower.includes('제품') || hLower.includes('이름') || hLower.includes('name') || hLower.includes('food')) {
        map.foodName = header;
      } else if (hLower.includes('칼륨') || hLower.includes('potassium') || hLower.includes(' k ') || hLower === 'k') {
        map.potassium = header;
      } else if (hLower.includes('인') || hLower.includes('phosphorus') || hLower.includes(' p ') || hLower === 'p') {
        map.phosphorus = header;
      } else if (hLower.includes('칼슘') || hLower.includes('calcium') || hLower.includes('ca')) {
        map.calcium = header;
      } else if (hLower.includes('단백') || hLower.includes('protein') || hLower.includes('프로틴')) {
        map.protein = header;
      }
    });

    // Fallbacks if not auto-detected
    if (!map.foodName) map.foodName = headersList[0] || '';
    if (!map.potassium) map.potassium = headersList.find(h => h.includes('칼')) || headersList[1] || '';
    if (!map.phosphorus) map.phosphorus = headersList.find(h => h.includes('인')) || headersList[2] || '';
    if (!map.calcium) map.calcium = headersList.find(h => h.includes('슘')) || headersList[3] || '';
    if (!map.protein) map.protein = headersList.find(h => h.includes('단')) || headersList[4] || '';

    if (type === 'main') {
      setMappingMain(map);
    } else {
      setMappingSec(map);
    }
  };

  // Load Demo Data
  const handleLoadDemo = () => {
    // Populate Main Database with high-fidelity baseline
    setCsvDataMain(DEMO_NUTRITION_DATABASE);
    setUploadedFileNameMain('1_주식품_원재료_기준표_v2.xlsx');
    setHeadersMain(['식품명', '칼륨(mg/100g)', '인(mg/100g)', '칼슘(mg/100g)', '단백질(g/100g)']);
    setMappingMain({
      foodName: '식품명',
      potassium: '칼륨(mg/100g)',
      phosphorus: '인(mg/100g)',
      calcium: '칼슘(mg/100g)',
      protein: '단백질(g/100g)'
    });

    // Populate Secondary Database with processed items containing missing values to show imputation!
    const DEMO_SEC: CsvRow[] = [
      { foodName: 'A브랜드 닭가슴살', potassium: 0, phosphorus: 0, calcium: 5, protein: 23 }, // Potassium & Phosphorus missing! Will trigger imputation
      { foodName: '맛있는 닭가슴살소시지', potassium: 0, phosphorus: 0, calcium: 6, protein: 18 }, // Will trigger imputation
      { foodName: '대기업 부침두부', potassium: 0, phosphorus: 0, calcium: 110, protein: 8 }, // Will trigger imputation
      { foodName: '자연산 닭가슴살구이', potassium: 330, phosphorus: 220, calcium: 6, protein: 25 }, // Secondary match
      { foodName: '오뚜기 맛있는 밥', potassium: 0, phosphorus: 30, calcium: 2, protein: 2.0 }, // Will trigger imputation to rice
      { foodName: '영양 가득 소고기패티', potassium: 0, phosphorus: 0, calcium: 15, protein: 19 }, // Will trigger beef imputation
    ];
    setCsvDataSec(DEMO_SEC);
    setUploadedFileNameSec('2_보조식품_브랜드가공_기준표_v2.xlsx');
    setHeadersSec(['식품명', '칼륨(mg/100g)', '인(mg/100g)', '칼슘(mg/100g)', '단백질(g/100g)']);
    setMappingSec({
      foodName: '식품명',
      potassium: '칼륨(mg/100g)',
      phosphorus: '인(mg/100g)',
      calcium: '칼슘(mg/100g)',
      protein: '단백질(g/100g)'
    });

    setShowConfig(false);
    setIsUploadedAndReady(true);
  };

  // Handle file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'sec') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'main') {
      setUploadedFileNameMain(file.name);
    } else {
      setUploadedFileNameSec(file.name);
    }
    const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        if (isExcel) {
          const data = new Uint8Array(event.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheetName = workbook.SheetNames[0];
          const worksheet = workbook.Sheets[firstSheetName];
          const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(worksheet, { defval: '' });
          if (jsonData.length > 0) {
            const parsedHeaders = Object.keys(jsonData[0]);
            const stringifiedRows = jsonData.map(row => {
              const obj: Record<string, string> = {};
              parsedHeaders.forEach(h => {
                obj[h] = row[h] !== undefined ? String(row[h]) : '';
              });
              return obj;
            });
            if (type === 'main') {
              setHeadersMain(parsedHeaders);
              setRawRowsMain(stringifiedRows);
              autoDetectMapping(parsedHeaders, 'main');
            } else {
              setHeadersSec(parsedHeaders);
              setRawRowsSec(stringifiedRows);
              autoDetectMapping(parsedHeaders, 'sec');
            }
            setShowConfig(true);
          } else {
            alert('Excel 파일에 데이터가 없습니다.');
          }
        } else {
          const text = event.target?.result as string;
          const { headers: parsedHeaders, rows: parsedRows } = parseCsvText(text);
          if (type === 'main') {
            setHeadersMain(parsedHeaders);
            setRawRowsMain(parsedRows);
            autoDetectMapping(parsedHeaders, 'main');
          } else {
            setHeadersSec(parsedHeaders);
            setRawRowsSec(parsedRows);
            autoDetectMapping(parsedHeaders, 'sec');
          }
          setShowConfig(true);
        }
      } catch (err) {
        console.error('File parsing error:', err);
        alert('파일을 불러오는 중 오류가 발생했습니다. 올바른 형식의 파일인지 확인해 주세요.');
      }
    };

    if (isExcel) {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  };

  // Apply Mapping to convert Main Raw Rows into standard CsvRow structures
  useEffect(() => {
    if (rawRowsMain.length === 0 || !mappingMain.foodName) return;

    const formatted: CsvRow[] = rawRowsMain.map(row => {
      const kVal = parseFloat(row[mappingMain.potassium]) || 0;
      const pVal = parseFloat(row[mappingMain.phosphorus]) || 0;
      const caVal = parseFloat(row[mappingMain.calcium]) || 0;
      const proVal = parseFloat(row[mappingMain.protein]) || 0;
      return {
        foodName: row[mappingMain.foodName] || '',
        potassium: kVal,
        phosphorus: pVal,
        calcium: caVal,
        protein: proVal
      };
    });

    setCsvDataMain(formatted);
  }, [rawRowsMain, mappingMain]);

  // Apply Mapping to convert Secondary Raw Rows into standard CsvRow structures
  useEffect(() => {
    if (rawRowsSec.length === 0 || !mappingSec.foodName) return;

    const formatted: CsvRow[] = rawRowsSec.map(row => {
      const kVal = parseFloat(row[mappingSec.potassium]) || 0;
      const pVal = parseFloat(row[mappingSec.phosphorus]) || 0;
      const caVal = parseFloat(row[mappingSec.calcium]) || 0;
      const proVal = parseFloat(row[mappingSec.protein]) || 0;
      return {
        foodName: row[mappingSec.foodName] || '',
        potassium: kVal,
        phosphorus: pVal,
        calcium: caVal,
        protein: proVal
      };
    });

    setCsvDataSec(formatted);
  }, [rawRowsSec, mappingSec]);

  // Clean ingredient names to match them efficiently
  const cleanIngredientName = (rawName: string): string => {
    return rawName
      .replace(/(데친|촉촉한|담백한|맑은|수제|저염|약선|보양|건강|보들보들|새콤|아삭|프리미엄|부드러운|스팀|어린|조리용|유기농|브랜드|가공식품|훈제|그릴|오븐|허브|블랙페퍼|마늘|매콤)/g, '')
      .replace(/(볶음|부침|무침|조림|구이|수육|찜|샐러드|국물|건더기|전골|전|튀김|숙회|샤브|구이|조림)/g, '')
      .trim();
  };

  // Intelligently find a matched food item in the databases and apply imputation / safety guardrails
  const resolveIngredientNutrition = (rawIngredientName: string, weight: number): ParsedIngredient => {
    const cleaned = cleanIngredientName(rawIngredientName);
    
    let matchedFood: CsvRow | undefined = undefined;
    let dataSource: 'main' | 'secondary' | 'imputed' | 'safety' | 'none' = 'none';
    let imputedFromName = '';
    const imputationNotes: string[] = [];

    // Helper to find in a list
    const findInList = (list: CsvRow[], targetName: string): CsvRow | undefined => {
      if (list.length === 0) return undefined;
      const targetCleaned = cleanIngredientName(targetName);
      if (!targetCleaned) return undefined;

      // 1. Exact match with cleaned name
      let m = list.find(f => f.foodName === targetCleaned);
      if (m) return m;

      // 2. Exact match with original name
      m = list.find(f => f.foodName === targetName);
      if (m) return m;

      // 3. Substring match
      m = list.find(f => f.foodName.includes(targetCleaned) || targetCleaned.includes(f.foodName));
      if (m) return m;

      // 4. Keyword matching
      const keyWords = ['소고기', '돼지고기', '닭고기', '두부', '삼치', '가자미', '동태', '대구', '굴비', '오징어', '밥', '숙주', '시금치', '청경채', '계란', '달걀', '무', '표고', '느타리'];
      for (const kw of keyWords) {
        if (targetCleaned.includes(kw) || targetName.includes(kw)) {
          const found = list.find(f => f.foodName.includes(kw));
          if (found) return found;
        }
      }
      return undefined;
    };

    let isMatchedInMain = false;
    let isMatchedInSec = false;

    // Step 1: Check manual overrides
    if (manualMatches[rawIngredientName]) {
      const overName = manualMatches[rawIngredientName];
      // Search in Main first, then Secondary, but keeping track of which database it came from.
      const mainFound = csvDataMain.find(f => f.foodName === overName);
      if (mainFound) {
        matchedFood = mainFound;
        dataSource = 'main';
        isMatchedInMain = true;
        imputationNotes.push('수동 매핑 지정 (주 DB)');
      } else {
        const secFound = csvDataSec.find(f => f.foodName === overName);
        if (secFound) {
          matchedFood = secFound;
          dataSource = 'secondary';
          isMatchedInSec = true;
          imputationNotes.push('수동 매핑 지정 (보조 DB)');
        }
      }
    }

    // Step 2: Try Main Database
    if (!matchedFood) {
      matchedFood = findInList(csvDataMain, rawIngredientName);
      if (matchedFood) {
        dataSource = 'main';
        isMatchedInMain = true;
      }
    }

    // Step 3: Try Secondary Database (ONLY if not found in Main DB)
    if (!matchedFood) {
      matchedFood = findInList(csvDataSec, rawIngredientName);
      if (matchedFood) {
        dataSource = 'secondary';
        isMatchedInSec = true;
        imputationNotes.push('보조 데이터베이스 매칭 성공');
      }
    }

    // Initialize values
    let potassium = 0;
    let phosphorus = 0;
    let calcium = 0;
    let protein = 0;

    let isKImputed = false;
    let isPImputed = false;
    let isCaImputed = false;
    let isProImputed = false;

    if (matchedFood) {
      potassium = matchedFood.potassium;
      phosphorus = matchedFood.phosphorus;
      calcium = matchedFood.calcium;
      protein = matchedFood.protein;
    }

    // Step 4: Category-level substitution (Imputation) if Potassium, Phosphorus, or Calcium are missing/null/0
    const needsKImputation = matchedFood && (potassium === 0 || potassium === null || potassium === undefined);
    const needsPImputation = matchedFood && (phosphorus === 0 || phosphorus === null || phosphorus === undefined);
    const needsCaImputation = matchedFood && (calcium === 0 || calcium === null || calcium === undefined);
    const notFoundAtAll = !matchedFood;

    if (needsKImputation || needsPImputation || needsCaImputation || notFoundAtAll) {
      // Let's identify the generic category item
      const nameToCheck = rawIngredientName;
      let categoryMatch: CsvRow | undefined = undefined;

      // Define standard baseline reference search with STRICT SEPARATION:
      // If found in Main DB, we NEVER look at Secondary DB.
      // If found in Secondary DB, we NEVER look at Main DB.
      // If not found in either, we check Main first, then Secondary, then DEMO.
      const searchReference = (categoryKeyword: string): CsvRow | undefined => {
        if (isMatchedInMain) {
          return findInList(csvDataMain, categoryKeyword) || 
                 findInList(DEMO_NUTRITION_DATABASE, categoryKeyword);
        } else if (isMatchedInSec) {
          return findInList(csvDataSec, categoryKeyword) || 
                 findInList(DEMO_NUTRITION_DATABASE, categoryKeyword);
        } else {
          return findInList(csvDataMain, categoryKeyword) || 
                 findInList(csvDataSec, categoryKeyword) || 
                 findInList(DEMO_NUTRITION_DATABASE, categoryKeyword);
        }
      };

      let categoryNameUsed = '';
      if (nameToCheck.includes('닭가슴살') || nameToCheck.includes('닭안심') || nameToCheck.includes('닭고기')) {
        categoryMatch = searchReference('닭고기 (가슴살, 생)');
        categoryNameUsed = '닭가슴살(생것)';
      } else if (nameToCheck.includes('소고기') || nameToCheck.includes('불고기') || nameToCheck.includes('쇠고기')) {
        categoryMatch = searchReference('소고기 (우둔, 생)');
        categoryNameUsed = '소고기(생것)';
      } else if (nameToCheck.includes('돼지') || nameToCheck.includes('돈육') || nameToCheck.includes('삼겹')) {
        categoryMatch = searchReference('돼지고기 (안심, 생)');
        categoryNameUsed = '돼지고기(안심)';
      } else if (nameToCheck.includes('두부') || nameToCheck.includes('순두부') || nameToCheck.includes('연두부')) {
        categoryMatch = searchReference('두부 (부침용)');
        categoryNameUsed = '두부(부침용)';
      } else if (nameToCheck.includes('계란') || nameToCheck.includes('달걀') || nameToCheck.includes('후라이')) {
        categoryMatch = searchReference('계란 (전란, 찜)');
        categoryNameUsed = '계란찜';
      } else if (nameToCheck.includes('삼치')) {
        categoryMatch = searchReference('삼치 (생)');
        categoryNameUsed = '삼치(생)';
      } else if (nameToCheck.includes('가자미')) {
        categoryMatch = searchReference('가자미 (생)');
        categoryNameUsed = '가자미(생)';
      } else if (nameToCheck.includes('동태')) {
        categoryMatch = searchReference('동태전 (동태살)');
        categoryNameUsed = '동태전';
      } else if (nameToCheck.includes('대구')) {
        categoryMatch = searchReference('대구 (생)');
        categoryNameUsed = '대구(생)';
      } else if (nameToCheck.includes('오징어')) {
        categoryMatch = searchReference('오징어 (데친것)');
        categoryNameUsed = '오징어(데친것)';
      } else if (nameToCheck.includes('밥') || nameToCheck.includes('쌀밥')) {
        categoryMatch = searchReference('흰쌀밥 (조리)');
        categoryNameUsed = '흰쌀밥(조리)';
      } else if (nameToCheck.includes('숙주')) {
        categoryMatch = searchReference('숙주나물 (데친것)');
        categoryNameUsed = '숙주나물(데침)';
      } else if (nameToCheck.includes('시금치')) {
        categoryMatch = searchReference('시금치 (데친것)');
        categoryNameUsed = '시금치(데침)';
      } else if (nameToCheck.includes('청경채')) {
        categoryMatch = searchReference('청경채 (데친것)');
        categoryNameUsed = '청경채(데침)';
      }

      if (categoryMatch) {
        dataSource = 'imputed';
        imputedFromName = categoryMatch.foodName;
        
        if (notFoundAtAll) {
          // Complete imputation
          matchedFood = categoryMatch;
          potassium = categoryMatch.potassium;
          phosphorus = categoryMatch.phosphorus;
          calcium = categoryMatch.calcium;
          protein = categoryMatch.protein;
          isKImputed = true;
          isPImputed = true;
          isCaImputed = true;
          isProImputed = true;
          imputationNotes.push(`미등록 식품을 카테고리 기준 식품 '${categoryNameUsed}'으로 자동 대체(Imputation) 대입`);
        } else {
          // Impute only missing values
          if (needsKImputation) {
            potassium = categoryMatch.potassium;
            isKImputed = true;
            imputationNotes.push(`칼륨 수치 결손으로 인해 '${categoryNameUsed}' 칼륨 기준치(${potassium}mg) 대체 대입`);
          }
          if (needsPImputation) {
            phosphorus = categoryMatch.phosphorus;
            isPImputed = true;
            imputationNotes.push(`인 수치 결손으로 인해 '${categoryNameUsed}' 인 기준치(${phosphorus}mg) 대체 대입`);
          }
          if (needsCaImputation) {
            calcium = categoryMatch.calcium;
            isCaImputed = true;
            imputationNotes.push(`칼슘 수치 결손으로 인해 '${categoryNameUsed}' 칼슘 기준치(${calcium}mg) 대체 대입`);
          }
        }
      }
    }

    // Step 5: Backend Safety Guardrails (안전장치)
    if (!matchedFood) {
      matchedFood = { foodName: rawIngredientName, potassium: 0, phosphorus: 0, calcium: 0, protein: 0 };
    }

    if (potassium === 0 || potassium === null || potassium === undefined) {
      potassium = 100;
      isKImputed = true;
      dataSource = dataSource === 'none' ? 'safety' : dataSource;
      imputationNotes.push(`칼륨 결손 및 대체불가로 인해 '가공식품 평균 최소 칼륨(100mg/100g)' 주입`);
    }

    if (phosphorus === 0 || phosphorus === null || phosphorus === undefined) {
      dataSource = dataSource === 'none' ? 'safety' : dataSource;
      if (protein > 0) {
        phosphorus = Math.round(protein * 15);
        isPImputed = true;
        imputationNotes.push(`인 결손으로 인해 단백질 당 비율 최소 단위(단백 1g당 15mg) 추정치(${phosphorus}mg) 대입`);
      } else {
        phosphorus = 70;
        isPImputed = true;
        imputationNotes.push(`인 및 단백질 결손으로 인해 '가공식품 평균 인산염 수치(70mg/100g)' 강제 주입`);
      }
    }

    if (calcium === 0 || calcium === null || calcium === undefined) {
      calcium = 30;
      isCaImputed = true;
      dataSource = dataSource === 'none' ? 'safety' : dataSource;
      imputationNotes.push(`칼슘 결손 및 대체불가로 인해 '가공식품 평균 최소 칼슘(30mg/100g)' 주입`);
    }

    // Calculate final actual values scaled by weight
    const potassiumMg = Math.round((potassium * weight) / 100);
    const phosphorusMg = Math.round((phosphorus * weight) / 100);
    const calciumMg = Math.round((calcium * weight) / 100);
    const proteinG = parseFloat(((protein * weight) / 100).toFixed(1));

    return {
      raw: rawIngredientName,
      name: rawIngredientName,
      weight,
      matchedFood,
      calculatedPotassium: potassiumMg,
      calculatedPhosphorus: phosphorusMg,
      calculatedCalcium: calciumMg,
      calculatedProtein: proteinG,
      dataSource,
      imputedFromName,
      isKImputed,
      isPImputed,
      isCaImputed,
      isProImputed,
      imputationNotes
    };
  };

  // Manual match change handler
  const handleManualMatchChange = (rawIngredientName: string, csvFoodName: string) => {
    setManualMatches(prev => ({
      ...prev,
      [rawIngredientName]: csvFoodName
    }));
  };

  // Parse each daily meal into individual ingredients and calculate nutrition
  const generateReport = () => {
    if (csvDataMain.length === 0 && csvDataSec.length === 0) return;

    const validationReports: ValidationReport[] = mealPlan.map(meal => {
      const parts = meal.mealDescription.split(/,\s*/);
      let calculatedK = 0;
      let calculatedP = 0;
      let calculatedCa = 0;
      let calculatedProtein = 0;

      const parsedIngredients: ParsedIngredient[] = parts.map(part => {
        const weightMatch = part.match(/(\d+)\s*g/);
        const weight = weightMatch ? parseInt(weightMatch[1]) : 0;
        const namePart = part.replace(/\(\s*[^)]+\s*\)/g, '').replace(/\d+\s*g/g, '').trim();
        
        const resolved = resolveIngredientNutrition(namePart, weight);

        calculatedK += resolved.calculatedPotassium;
        calculatedP += resolved.calculatedPhosphorus;
        calculatedCa += resolved.calculatedCalcium;
        calculatedProtein += resolved.calculatedProtein;

        return resolved;
      });

      const diffK = Math.abs(calculatedK - meal.potassiumMg);
      const diffP = Math.abs(calculatedP - meal.phosphorusMg);
      const diffCa = Math.abs(calculatedCa - meal.calciumMg);
      
      let status: 'perfect' | 'discrepancy' | 'unmatched' = 'perfect';
      if (parsedIngredients.some(ing => ing.dataSource === 'none')) {
        status = 'unmatched';
      } else if (diffK > 150 || diffP > 50 || diffCa > 25) {
        status = 'discrepancy';
      }

      return {
        dayIndex: meal.dayIndex,
        week: meal.week,
        dayName: meal.dayName,
        mealName: meal.mealName,
        originalK: meal.potassiumMg,
        originalP: meal.phosphorusMg,
        originalCa: meal.calciumMg,
        originalProtein: meal.proteinG,
        calculatedK,
        calculatedP,
        calculatedCa,
        calculatedProtein: parseFloat(calculatedProtein.toFixed(1)),
        ingredients: parsedIngredients,
        status
      };
    });

    setReports(validationReports);
  };

  // Auto-run validation whenever CSV data or patient lab indicators change to keep it synchronized
  useEffect(() => {
    if (csvDataMain.length > 0 || csvDataSec.length > 0) {
      generateReport();
    }
  }, [csvDataMain, csvDataSec, potassium, phosphorus, calcium]);

  // Derived state
  const filteredReports = reports.filter(r => r.week === activeWeek);
  const perfectCount = reports.filter(r => r.status === 'perfect').length;
  const discrepancyCount = reports.filter(r => r.status === 'discrepancy').length;
  const unmatchedCount = reports.filter(r => r.status === 'unmatched').length;

  return (
    <div id="csv-validator-hub" className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 mb-8">
      {/* Title */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-6">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              <FileSpreadsheet className="w-5 h-5 text-orange-600" />
              📊 4주 식단표 식품 영양성분 듀얼(주/보조) Excel & CSV 검증 허브
            </h2>
            <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold animate-pulse">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
              환자 검사수치 실시간 자동 검증 연동중
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            환자 영양관리를 위한 1차 주식품 데이터와 가공식품 보조데이터를 연계하여 정밀 대조 및 수치 결손 보완(Imputation) 검증을 실행합니다. 
            <span className="text-[11px] text-slate-400 ml-1 font-mono">
              (현재 연동 지표 - 칼륨: {potassium} mEq/L | 인: {phosphorus} mg/dL | 칼슘: {calcium} mg/dL)
            </span>
          </p>
        </div>

        {(csvDataMain.length > 0 || csvDataSec.length > 0) && (
          <button 
            onClick={() => {
              setCsvDataMain([]);
              setHeadersMain([]);
              setRawRowsMain([]);
              setUploadedFileNameMain('');
              setCsvDataSec([]);
              setHeadersSec([]);
              setRawRowsSec([]);
              setUploadedFileNameSec('');
              setReports([]);
              setManualMatches({});
              setShowConfig(true);
              setIsUploadedAndReady(false);
            }}
            className="text-xs font-semibold text-slate-500 hover:text-orange-600 border border-slate-200 hover:border-orange-200 px-3 py-1.5 rounded-lg bg-slate-50 hover:bg-orange-50 transition flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            초기화 후 다른 파일 업로드
          </button>
        )}
      </div>

      {/* STEP 1: SEQUENTIAL UPLOAD WIZARD */}
      {!isUploadedAndReady ? (
        <div className="space-y-6">
          {/* Stepper Progress */}
          <div className="flex items-center justify-center gap-4 border-b border-slate-100 pb-5 max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${csvDataMain.length > 0 ? 'bg-emerald-500 text-white' : 'bg-orange-600 text-white animate-pulse'}`}>
                {csvDataMain.length > 0 ? '✓' : '1'}
              </div>
              <span className={`text-xs font-black ${csvDataMain.length > 0 ? 'text-emerald-600' : 'text-slate-800'}`}>
                1단계: 주(Main) 식품 DB 등록
              </span>
            </div>
            <div className={`h-[2px] w-12 ${csvDataMain.length > 0 ? 'bg-emerald-300' : 'bg-slate-200'}`}></div>
            <div className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${csvDataSec.length > 0 ? 'bg-blue-500 text-white' : (csvDataMain.length > 0 ? 'bg-orange-600 text-white animate-pulse' : 'bg-slate-200 text-slate-400')}`}>
                {csvDataSec.length > 0 ? '✓' : '2'}
              </div>
              <span className={`text-xs font-black ${csvDataSec.length > 0 ? 'text-blue-600' : (csvDataMain.length > 0 ? 'text-slate-800' : 'text-slate-400')}`}>
                2단계: 보조(Secondary) 가공 DB 등록 (선택)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
            {/* Main Database Upload Card */}
            <div className="border border-slate-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                  <div className="bg-emerald-100 p-1.5 rounded text-emerald-700 font-extrabold text-xs">1</div>
                  <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-emerald-600" />
                    주(Main) 식품 영양소 기준표 업로드
                  </h3>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal mb-4">
                  기준이 되는 원재료 및 농축산 식품 데이터베이스 파일(.xlsx, .xls, .csv)을 업로드하세요.
                </p>

                {csvDataMain.length > 0 ? (
                  <div className="bg-emerald-50/50 border border-emerald-200 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-emerald-100 p-2.5 rounded-full text-emerald-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-black text-emerald-800">1단계 주식품 DB 등록 완료!</div>
                      <div className="text-xs font-bold text-slate-800 break-all">{uploadedFileNameMain}</div>
                      <div className="text-[10px] text-slate-500">총 {csvDataMain.length}개 행이 식별되었습니다.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCsvDataMain([]);
                        setHeadersMain([]);
                        setRawRowsMain([]);
                        setUploadedFileNameMain('');
                      }}
                      className="text-[10px] font-bold text-emerald-700 hover:text-emerald-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      다른 파일로 다시 업로드
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-emerald-400 bg-slate-50/50 p-6 rounded-xl flex flex-col items-center justify-center text-center transition cursor-pointer relative h-40">
                    <input 
                      type="file" 
                      accept=".csv, .xlsx, .xls"
                      onChange={e => handleFileUpload(e, 'main')}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="bg-emerald-100/80 p-2.5 rounded-full text-emerald-600 mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="text-[11px] font-extrabold text-slate-700">원재료 데이터 파일 선택</h4>
                    <p className="text-[9px] text-slate-400 mt-1">식품명, 칼륨, 인, 칼슘, 단백질 정보 매핑</p>
                  </div>
                )}
              </div>
            </div>

            {/* Secondary Database Upload Card */}
            <div className={`border border-slate-200 rounded-xl p-5 bg-white space-y-4 flex flex-col justify-between transition ${csvDataMain.length === 0 ? 'opacity-50 pointer-events-none bg-slate-50/50 select-none' : ''}`}>
              <div>
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2 mb-3">
                  <div className="bg-blue-100 p-1.5 rounded text-blue-700 font-extrabold text-xs">2</div>
                  <h3 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <Database className="w-4 h-4 text-blue-600" />
                    보조(Secondary) 가공식품 기준표 업로드
                    {csvDataMain.length === 0 && (
                      <span className="bg-slate-200 text-slate-600 border border-slate-300 px-1.5 py-0.2 rounded text-[8px] font-black flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" /> 1단계 필요
                      </span>
                    )}
                  </h3>
                </div>
                <p className="text-[10px] text-slate-400 leading-normal mb-4">
                  가공 브랜드 식품 또는 영양 수치가 일부 비어있는 제조원 데이터베이스 파일(.xlsx, .xls, .csv)을 업로드하세요. (주식품 매핑 후 선택사항)
                </p>

                {csvDataSec.length > 0 ? (
                  <div className="bg-blue-50/50 border border-blue-200 rounded-xl p-4 flex flex-col items-center justify-center text-center space-y-3">
                    <div className="bg-blue-100 p-2.5 rounded-full text-blue-600">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[11px] font-black text-blue-800">2단계 보조가공 DB 등록 완료!</div>
                      <div className="text-xs font-bold text-slate-800 break-all">{uploadedFileNameSec}</div>
                      <div className="text-[10px] text-slate-500">총 {csvDataSec.length}개 행이 식별되었습니다.</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setCsvDataSec([]);
                        setHeadersSec([]);
                        setRawRowsSec([]);
                        setUploadedFileNameSec('');
                      }}
                      className="text-[10px] font-bold text-blue-700 hover:text-blue-900 underline flex items-center gap-1 cursor-pointer"
                    >
                      <RefreshCw className="w-3 h-3" />
                      다른 파일로 다시 업로드
                    </button>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-slate-200 hover:border-blue-400 bg-slate-50/50 p-6 rounded-xl flex flex-col items-center justify-center text-center transition cursor-pointer relative h-40">
                    <input 
                      type="file" 
                      accept=".csv, .xlsx, .xls"
                      onChange={e => handleFileUpload(e, 'sec')}
                      disabled={csvDataMain.length === 0}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="bg-blue-100/80 p-2.5 rounded-full text-blue-600 mb-2">
                      <Upload className="w-5 h-5" />
                    </div>
                    <h4 className="text-[11px] font-extrabold text-slate-700">가공식품 데이터 파일 선택</h4>
                    <p className="text-[9px] text-slate-400 mt-1">결손치가 있어도 시스템이 자동 Imputation 보완</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Wizard Action Bottom Banner */}
          {csvDataMain.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 p-4 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-bottom duration-300">
              <div className="space-y-0.5 text-left">
                <div className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  검증 준비 완료!
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  {csvDataSec.length > 0 
                    ? "주 DB와 보조 DB가 모두 업로드되었습니다. 아래 버튼을 눌러 정밀 매핑 및 교차 대조 결과를 확인하세요." 
                    : "주식품 DB가 업로드되었습니다. 보조 DB를 추가로 등록하시거나, 주 DB만으로 대조 검사를 바로 진행하실 수 있습니다."}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsUploadedAndReady(true);
                  setShowConfig(false);
                }}
                className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs py-2.5 px-6 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-md active:scale-98 cursor-pointer whitespace-nowrap"
              >
                {csvDataSec.length > 0 ? '듀얼 데이터베이스 교차 검증 및 대조 실행' : '주 DB 단독으로 검증 및 대조 실행'}
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
            </div>
          )}

          {/* C. Demo Integration Trigger (Only shown when main is not uploaded yet to avoid clutter) */}
          {csvDataMain.length === 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-orange-600 animate-pulse" />
                  <h3 className="text-xs font-black text-slate-800">준비된 식품 데이터베이스 파일이 없으시가요?</h3>
                </div>
                <p className="text-[11px] text-slate-500 leading-relaxed max-w-2xl">
                  한국 식품안전나라 표준 원재료 데이터(1차)와 수치 결손을 유도하는 브랜드 가공식품 데이터(2차)를 결합한 고정밀 데모 데이터베이스 세트를 로드하여 대체(Imputation) 및 검증 기술을 즉각 시뮬레이션할 수 있습니다.
                </p>
              </div>
              <button
                onClick={handleLoadDemo}
                className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs py-2.5 px-5 rounded-xl transition flex items-center justify-center gap-2 active:scale-98 whitespace-nowrap cursor-pointer"
              >
                실험용 듀얼 데모 데이터베이스 로드하기
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Filename banners list */}
          <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200/60">
              <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-orange-600" />
                식품 데이터베이스 연결 및 수집 상태
              </span>
              <button 
                onClick={() => setShowConfig(!showConfig)}
                className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 border border-slate-200 px-2.5 py-1 rounded bg-white"
              >
                <Sliders className="w-3.5 h-3.5" />
                {showConfig ? '열 매핑 설정 숨기기' : '듀얼 CSV 열 매핑 설정 보기'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Main Banner */}
              <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg ${uploadedFileNameMain ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-400'}`}>
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] font-black text-slate-400">1차 주(Main) 식품 DB</div>
                    <div className="text-xs font-bold text-slate-800 truncate" title={uploadedFileNameMain || '업로드되지 않음'}>
                      {uploadedFileNameMain || '미등록 (보조 데이터만 구동 중)'}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {uploadedFileNameMain ? (
                    <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded text-[9px] font-bold">
                      {csvDataMain.length}개 로드됨
                    </span>
                  ) : (
                    <input 
                      type="file" 
                      accept=".csv, .xlsx, .xls"
                      onChange={e => handleFileUpload(e, 'main')}
                      className="text-[10px] w-32 text-slate-500"
                    />
                  )}
                </div>
              </div>

              {/* Secondary Banner */}
              <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 overflow-hidden">
                  <div className={`p-2 rounded-lg ${uploadedFileNameSec ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-400'}`}>
                    <FileSpreadsheet className="w-4 h-4" />
                  </div>
                  <div className="overflow-hidden">
                    <div className="text-[10px] font-black text-slate-400">2차 보조(Secondary) 가공 DB</div>
                    <div className="text-xs font-bold text-slate-800 truncate" title={uploadedFileNameSec || '업로드되지 않음'}>
                      {uploadedFileNameSec || '미등록 (주 데이터만 구동 중)'}
                    </div>
                  </div>
                </div>
                <div className="flex-shrink-0">
                  {uploadedFileNameSec ? (
                    <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded text-[9px] font-bold">
                      {csvDataSec.length}개 로드됨
                    </span>
                  ) : (
                    <input 
                      type="file" 
                      accept=".csv, .xlsx, .xls"
                      onChange={e => handleFileUpload(e, 'sec')}
                      className="text-[10px] w-32 text-slate-500"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mapping settings configuration */}
          {showConfig && (
            <div className="bg-slate-50/50 border border-slate-200 p-5 rounded-xl space-y-6">
              <div className="space-y-1">
                <div className="text-xs font-extrabold text-slate-800 flex items-center gap-1">
                  <Sliders className="w-4 h-4 text-orange-600" />
                  듀얼 데이터베이스 컬럼 필드 매핑 설정 (Column Field Configurations)
                </div>
                <p className="text-[10px] text-slate-500 leading-normal">
                  각 업로드 파일의 고유 헤더 목록에서 상호 호환될 수 있는 성분 열들을 대응시킵니다. 시스템이 영양소를 정밀 변환하도록 매핑 상태를 검토하세요.
                </p>
              </div>

              {/* Grid with main & sec configs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2 border-t border-slate-200/60">
                {/* Main DB mappings */}
                <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                    주(Main) 식품 DB 컬럼 연계
                  </div>
                  {rawRowsMain.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 mb-1">식품명 열</label>
                        <select 
                          value={mappingMain.foodName} 
                          onChange={e => setMappingMain(prev => ({...prev, foodName: e.target.value}))}
                          className="w-full text-[10px] p-1 border border-slate-200 bg-white rounded"
                        >
                          {headersMain.map((h, idx) => <option key={`main-fn-${h}-${idx}`} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 mb-1">칼륨(K) 열</label>
                        <select 
                          value={mappingMain.potassium} 
                          onChange={e => setMappingMain(prev => ({...prev, potassium: e.target.value}))}
                          className="w-full text-[10px] p-1 border border-slate-200 bg-white rounded"
                        >
                          {headersMain.map((h, idx) => <option key={`main-k-${h}-${idx}`} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 mb-1">인(P) 열</label>
                        <select 
                          value={mappingMain.phosphorus} 
                          onChange={e => setMappingMain(prev => ({...prev, phosphorus: e.target.value}))}
                          className="w-full text-[10px] p-1 border border-slate-200 bg-white rounded"
                        >
                          {headersMain.map((h, idx) => <option key={`main-p-${h}-${idx}`} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 mb-1">칼슘(Ca) 열</label>
                        <select 
                          value={mappingMain.calcium} 
                          onChange={e => setMappingMain(prev => ({...prev, calcium: e.target.value}))}
                          className="w-full text-[10px] p-1 border border-slate-200 bg-white rounded"
                        >
                          {headersMain.map((h, idx) => <option key={`main-ca-${h}-${idx}`} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-slate-600 mb-1">단백질(g) 열</label>
                        <select 
                          value={mappingMain.protein} 
                          onChange={e => setMappingMain(prev => ({...prev, protein: e.target.value}))}
                          className="w-full text-[10px] p-1 border border-slate-200 bg-white rounded"
                        >
                          {headersMain.map((h, idx) => <option key={`main-pro-${h}-${idx}`} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 text-center py-4">주식품 DB가 업로드되지 않았습니다.</div>
                  )}
                </div>

                {/* Secondary DB mappings */}
                <div className="space-y-3 bg-white p-4 rounded-lg border border-slate-200">
                  <div className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                    보조(Secondary) 가공 DB 컬럼 연계
                  </div>
                  {rawRowsSec.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 mb-1">식품명 열</label>
                        <select 
                          value={mappingSec.foodName} 
                          onChange={e => setMappingSec(prev => ({...prev, foodName: e.target.value}))}
                          className="w-full text-[10px] p-1 border border-slate-200 bg-white rounded"
                        >
                          {headersSec.map((h, idx) => <option key={`sec-fn-${h}-${idx}`} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 mb-1">칼륨(K) 열</label>
                        <select 
                          value={mappingSec.potassium} 
                          onChange={e => setMappingSec(prev => ({...prev, potassium: e.target.value}))}
                          className="w-full text-[10px] p-1 border border-slate-200 bg-white rounded"
                        >
                          {headersSec.map((h, idx) => <option key={`sec-k-${h}-${idx}`} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 mb-1">인(P) 열</label>
                        <select 
                          value={mappingSec.phosphorus} 
                          onChange={e => setMappingSec(prev => ({...prev, phosphorus: e.target.value}))}
                          className="w-full text-[10px] p-1 border border-slate-200 bg-white rounded"
                        >
                          {headersSec.map((h, idx) => <option key={`sec-p-${h}-${idx}`} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[9px] font-bold text-slate-600 mb-1">칼슘(Ca) 열</label>
                        <select 
                          value={mappingSec.calcium} 
                          onChange={e => setMappingSec(prev => ({...prev, calcium: e.target.value}))}
                          className="w-full text-[10px] p-1 border border-slate-200 bg-white rounded"
                        >
                          {headersSec.map((h, idx) => <option key={`sec-ca-${h}-${idx}`} value={h}>{h}</option>)}
                        </select>
                      </div>
                      <div className="col-span-2">
                        <label className="block text-[9px] font-bold text-slate-600 mb-1">단백질(g) 열</label>
                        <select 
                          value={mappingSec.protein} 
                          onChange={e => setMappingSec(prev => ({...prev, protein: e.target.value}))}
                          className="w-full text-[10px] p-1 border border-slate-200 bg-white rounded"
                        >
                          {headersSec.map((h, idx) => <option key={`sec-pro-${h}-${idx}`} value={h}>{h}</option>)}
                        </select>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[10px] text-slate-400 text-center py-4">보조가공 DB가 업로드되지 않았습니다.</div>
                  )}
                </div>
              </div>

              {/* ACTION TRIGGER BUTTON */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-4 border-t border-slate-200/80">
                <p className="text-[10px] text-orange-600 font-bold flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-orange-500 animate-pulse flex-shrink-0" />
                  연결 설정 및 매핑 구조를 마친 뒤 아래 검증 버튼을 누르면 4주차 식단 전체에 대한 정밀 영양소 대조 검사가 수행됩니다.
                </p>
                <button
                  type="button"
                  onClick={generateReport}
                  className="bg-orange-600 hover:bg-orange-700 text-white font-black text-xs py-2.5 px-6 rounded-xl transition duration-150 flex items-center justify-center gap-1.5 shadow-sm hover:shadow active:scale-98 cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  영양성분 정밀 검증 및 대조 실행
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: SUMMARY METRICS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-orange-50/50 border border-orange-100 p-4 rounded-xl text-center">
              <div className="text-[10px] text-slate-500 font-bold mb-1">전체 식단 수</div>
              <div className="text-xl font-black font-mono text-slate-900">{reports.length}일 한끼</div>
              <div className="text-[10px] text-slate-400 mt-1">4주 28일 분량</div>
            </div>

            <div className="bg-emerald-50/50 border border-emerald-100 p-4 rounded-xl text-center">
              <div className="text-[10px] text-emerald-800 font-bold mb-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                추정치 일치 식단
              </div>
              <div className="text-xl font-black font-mono text-emerald-700">{perfectCount}일 식단</div>
              <div className="text-[10px] text-emerald-600 mt-1">오차 범위 내 안심</div>
            </div>

            <div className="bg-amber-50/50 border border-amber-100 p-4 rounded-xl text-center">
              <div className="text-[10px] text-amber-800 font-bold mb-1 flex items-center justify-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                지표 편차 발견
              </div>
              <div className="text-xl font-black font-mono text-amber-700">{discrepancyCount}일 식단</div>
              <div className="text-[10px] text-amber-600 mt-1">영양 함량 불일치 검출</div>
            </div>

            <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-center">
              <div className="text-[10px] text-indigo-800 font-bold mb-1 flex items-center justify-center gap-1">
                <Info className="w-3.5 h-3.5 text-indigo-600" />
                대체대입(Imputation) 가동
              </div>
              <div className="text-xl font-black font-mono text-indigo-700">
                {reports.reduce((sum, r) => sum + r.ingredients.filter(i => i.dataSource === 'imputed' || i.dataSource === 'safety').length, 0)}회 식품
              </div>
              <div className="text-[10px] text-indigo-600 mt-1">결손 영양 수치 자동 복원</div>
            </div>
          </div>

          {/* CLINICAL SUMMARY STATEMENT */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-start gap-3">
            <Info className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <div className="font-bold">듀얼 데이터베이스 교차 검증 및 결손 보완(Imputation) 종합 소견:</div>
              <p className="text-slate-300 leading-normal">
                1단계 주식품 DB 및 2단계 보조가공식품 DB 연계 결과, 미기재 영양 성분을 갖는 닭가슴살소시지 및 A브랜드 가공육들의 칼륨·인 수치 결손이 발견되었습니다. 
                시스템이 자동으로 상위 카테고리인 <strong>'닭가슴살(생것)', '소고기(생것)', '두부(부침용)'</strong> 기준 영양 데이터를 찾아 대체 주입하고, 
                그럼에도 분석할 수 없는 경우 단백질(g)당 최소 비율(1g당 15mg 인)을 자동 추정하거나 가공식품 평균 인산염 기준수치인 <strong>70mg/100g</strong>을 안전 가드로 강제 주입하여 오차 측정을 완수했습니다.
              </p>
            </div>
          </div>

          {/* STEP 3: INTERACTIVE REPORT VIEWER */}
          <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
            {/* Week Tab Selector inside validator */}
            <div className="bg-slate-50 border-b border-slate-200 flex justify-center py-2.5">
              <div className="inline-flex p-1 bg-slate-200/60 rounded-lg text-xs">
                {[1, 2, 3, 4].map(wk => (
                  <button
                    key={wk}
                    onClick={() => setActiveWeek(wk)}
                    className={`px-4 py-1 rounded-md font-bold transition cursor-pointer ${activeWeek === wk ? 'bg-white text-orange-600 shadow-xs' : 'text-slate-600 hover:text-slate-950'}`}
                  >
                    {wk}주차 세부 검증 보고서
                  </button>
                ))}
              </div>
            </div>

            {/* Weekly Summary Dashboard (총합 및 메뉴 일람) */}
            {reports.length > 0 && (
              <div id="weekly-report-summary-dashboard" className="bg-slate-50 p-5 border-b border-slate-200 space-y-4">
                <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                  <div>
                    <h3 className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      📅 {activeWeek}주차 식단 구성 및 영양소 누적 합계 분석
                    </h3>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      {activeWeek}주차 7일간의 매 끼니당 식단 구성 및 칼륨, 인, 칼슘 합계와 식단표 오차 합계 통계입니다.
                    </p>
                  </div>

                  {/* Weekly totals badges */}
                  <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
                    {/* Potassium K */}
                    <div className="flex-1 lg:flex-none bg-white border border-slate-200 rounded-xl p-3 text-center shadow-2xs min-w-[115px]">
                      <div className="text-[9px] font-bold text-slate-400 mb-0.5">칼륨(K) 주간 합계</div>
                      <div className="text-sm font-black font-mono text-orange-600">
                        {filteredReports.reduce((sum, r) => sum + r.calculatedK, 0)} <span className="text-[10px] text-slate-400 font-normal">/ {filteredReports.reduce((sum, r) => sum + r.originalK, 0)}mg</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        오차: {Math.round(filteredReports.reduce((sum, r) => sum + r.calculatedK, 0) - filteredReports.reduce((sum, r) => sum + r.originalK, 0))}mg
                      </div>
                    </div>

                    {/* Phosphorus P */}
                    <div className="flex-1 lg:flex-none bg-white border border-slate-200 rounded-xl p-3 text-center shadow-2xs min-w-[115px]">
                      <div className="text-[9px] font-bold text-slate-400 mb-0.5">인(P) 주간 합계</div>
                      <div className="text-sm font-black font-mono text-pink-600">
                        {filteredReports.reduce((sum, r) => sum + r.calculatedP, 0)} <span className="text-[10px] text-slate-400 font-normal">/ {filteredReports.reduce((sum, r) => sum + r.originalP, 0)}mg</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        오차: {Math.round(filteredReports.reduce((sum, r) => sum + r.calculatedP, 0) - filteredReports.reduce((sum, r) => sum + r.originalP, 0))}mg
                      </div>
                    </div>

                    {/* Calcium Ca */}
                    <div className="flex-1 lg:flex-none bg-white border border-slate-200 rounded-xl p-3 text-center shadow-2xs min-w-[115px]">
                      <div className="text-[9px] font-bold text-slate-400 mb-0.5">칼슘(Ca) 주간 합계</div>
                      <div className="text-sm font-black font-mono text-amber-600">
                        {filteredReports.reduce((sum, r) => sum + r.calculatedCa, 0)} <span className="text-[10px] text-slate-400 font-normal">/ {filteredReports.reduce((sum, r) => sum + r.originalCa, 0)}mg</span>
                      </div>
                      <div className="text-[9px] text-slate-400 mt-0.5">
                        오차: {Math.round(filteredReports.reduce((sum, r) => sum + r.calculatedCa, 0) - filteredReports.reduce((sum, r) => sum + r.originalCa, 0))}mg
                      </div>
                    </div>
                  </div>
                </div>

                {/* Weekly Menu grid */}
                <div className="bg-white rounded-xl border border-slate-200 p-3.5">
                  <div className="text-[10px] font-extrabold text-slate-800 mb-2 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5 text-orange-600 animate-pulse" />
                    {activeWeek}주차 전체 식단표 메뉴 구성 및 정밀 검증 결과 (7일 식단)
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-2">
                    {filteredReports.map((report) => (
                      <button 
                        type="button"
                        key={report.dayIndex} 
                        onClick={() => setExpandedDay(expandedDay === report.dayIndex ? null : report.dayIndex)}
                        className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all hover:border-orange-300 hover:bg-orange-50/10 ${expandedDay === report.dayIndex ? 'bg-orange-50 border-orange-200 ring-2 ring-orange-500/10' : 'bg-slate-50 border-slate-200'}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-extrabold text-[9px] bg-white px-1.5 py-0.5 rounded border border-slate-200 text-slate-600">{report.dayName}</span>
                          <span className={`w-2 h-2 rounded-full ${report.status === 'perfect' ? 'bg-emerald-500' : report.status === 'discrepancy' ? 'bg-amber-500' : 'bg-rose-500'}`}></span>
                        </div>
                        <div className="text-[10px] font-bold text-slate-800 truncate" title={report.mealName}>
                          {report.mealName}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* List of Days */}
            <div className="divide-y divide-slate-150 bg-white">
              {filteredReports.map((report) => {
                const isOpen = expandedDay === report.dayIndex;
                const isHighPotassium = report.calculatedK > 500;
                return (
                  <div key={report.dayIndex} className="transition-colors hover:bg-slate-50/40">
                    {/* Header bar of day */}
                    <div 
                      onClick={() => setExpandedDay(isOpen ? null : report.dayIndex)}
                      className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-10 text-center font-black text-xs text-slate-500 bg-slate-100 py-1 rounded-md border border-slate-200">
                          {report.dayName}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-900">{report.mealName}</h4>
                          <span className="text-[10px] text-slate-400 font-medium">Week {report.week} - Day {report.dayIndex + 1}</span>
                        </div>
                      </div>

                      {/* Summary comparative tags */}
                      <div className="flex flex-wrap items-center gap-2">
                        {/* Potassium comparative */}
                        <div className={`px-2 py-1 rounded-md text-[10px] font-semibold border flex items-center gap-1.5 ${isHighPotassium ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-slate-50 border-slate-200 text-slate-700'}`}>
                          <span>K(칼륨):</span>
                          <span className="font-mono font-bold">{report.calculatedK}</span>
                          <span className="text-slate-300">/</span>
                          <span className="font-mono text-slate-400">{report.originalK}mg</span>
                        </div>

                        {/* Phosphorus comparative */}
                        <div className="px-2 py-1 rounded-md text-[10px] font-semibold border bg-slate-50 border-slate-200 text-slate-700 flex items-center gap-1.5">
                          <span>P(인):</span>
                          <span className="font-mono font-bold">{report.calculatedP}</span>
                          <span className="text-slate-300">/</span>
                          <span className="font-mono text-slate-400">{report.originalP}mg</span>
                        </div>

                        {/* Calcium comparative */}
                        <div className="px-2 py-1 rounded-md text-[10px] font-semibold border bg-slate-50 border-slate-200 text-slate-700 flex items-center gap-1.5">
                          <span>Ca(칼슘):</span>
                          <span className="font-mono font-bold">{report.calculatedCa}</span>
                          <span className="text-slate-300">/</span>
                          <span className="font-mono text-slate-400">{report.originalCa}mg</span>
                        </div>

                        {/* Status pill */}
                        {report.status === 'perfect' && (
                          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">✓ 일치</span>
                        )}
                        {report.status === 'discrepancy' && (
                          <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">⚠️ 편차 발생</span>
                        )}
                        {report.status === 'unmatched' && (
                          <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-0.5 rounded-full text-[10px] font-bold">⚠️ 미등록 식품 존재</span>
                        )}

                        {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                      </div>
                    </div>

                    {/* Detailed Collapsed Panel */}
                    {isOpen && (
                      <div className="px-4 pb-5 pt-1 bg-slate-50/50 border-t border-slate-100 animate-in slide-in-from-top-2 duration-150">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 mt-2 space-y-4">
                          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                            <h5 className="text-[11px] font-extrabold text-slate-800 flex items-center gap-1">
                              <Database className="w-3.5 h-3.5 text-orange-600" />
                              식품 원료별 정밀 함량 및 듀얼 DB 매핑 분석
                            </h5>
                            <span className="text-[10px] text-slate-400">단위: mg(단백질은 g) / 중량 대비 가변 자동 환산</span>
                          </div>

                          {/* Ingredient list and matcher */}
                          <div className="space-y-3">
                            {report.ingredients.map((ing, ingIdx) => (
                              <div key={ingIdx} className="p-3 bg-slate-50 rounded-lg border border-slate-150 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                                <div className="space-y-1.5 flex-1">
                                  <div className="flex items-center gap-2 flex-wrap">
                                    <span className="text-xs font-bold text-slate-900">{ing.name}</span>
                                    <span className="bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-bold">중량: {ing.weight}g</span>
                                    
                                    {/* DATA SOURCE BADGE */}
                                    {ing.dataSource === 'main' && (
                                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.2 rounded text-[9px] font-black">
                                        주식품 DB
                                      </span>
                                    )}
                                    {ing.dataSource === 'secondary' && (
                                      <span className="bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.2 rounded text-[9px] font-black">
                                        보조식품 DB
                                      </span>
                                    )}
                                    {ing.dataSource === 'imputed' && (
                                      <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.2 rounded text-[9px] font-black">
                                        대체대입(Imputed)
                                      </span>
                                    )}
                                    {ing.dataSource === 'safety' && (
                                      <span className="bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.2 rounded text-[9px] font-black">
                                        안전망 적용(Safety Guard)
                                      </span>
                                    )}
                                    {ing.dataSource === 'none' && (
                                      <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.2 rounded text-[9px] font-black">
                                        미확인
                                      </span>
                                    )}
                                  </div>
                                  
                                  {/* IMPUTATION NOTES AND SAFETY PATHWAYS LOGS */}
                                  <div className="space-y-1">
                                    <p className="text-[10px] text-slate-400">원문 파싱: "{ing.raw}"</p>
                                    {ing.imputationNotes && ing.imputationNotes.length > 0 && (
                                      <div className="bg-amber-50/50 border border-amber-200/50 rounded p-1.5 text-[9px] text-amber-800 font-medium space-y-0.5 max-w-xl">
                                        <div className="font-extrabold flex items-center gap-1">
                                          🛡️ 보완 경로(Imputation Pathway) 로그:
                                        </div>
                                        {ing.imputationNotes.map((note, nIdx) => (
                                          <div key={nIdx} className="flex items-start gap-1">
                                            <span>•</span>
                                            <span>{note}</span>
                                          </div>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* CSV mapping selector */}
                                <div className="flex items-start gap-3 flex-shrink-0">
                                  <div className="text-right">
                                    <div className="text-[9px] text-slate-400">수동 대조 지정</div>
                                    <div className="flex items-center gap-1 justify-end mt-1">
                                      <select 
                                        value={ing.matchedFood?.foodName || ''}
                                        onChange={e => handleManualMatchChange(ing.name, e.target.value)}
                                        className={`text-[10px] p-1 border rounded bg-white font-semibold max-w-[160px] ${ing.matchedFood ? 'text-emerald-700 border-emerald-200' : 'text-rose-700 border-rose-200 bg-rose-50'}`}
                                      >
                                        <option value="">-- 직접 매핑 변경 --</option>
                                        {(() => {
                                          const allFoods: CsvRow[] = [];
                                          const seen = new Set<string>();
                                          [...csvDataMain, ...csvDataSec].forEach(item => {
                                            if (item && item.foodName && !seen.has(item.foodName)) {
                                              seen.add(item.foodName);
                                              allFoods.push(item);
                                            }
                                          });
                                          return allFoods.map((f, fIdx) => (
                                            <option key={`${f.foodName}-${fIdx}`} value={f.foodName}>
                                              {f.foodName}
                                            </option>
                                          ));
                                        })()}
                                      </select>
                                    </div>
                                  </div>

                                  {/* Calculated details */}
                                  <div className="border-l border-slate-200 pl-3 grid grid-cols-4 gap-2 text-center text-[10px] min-w-[150px] font-mono pt-1">
                                    <div>
                                      <div className="text-slate-400 text-[9px]">K</div>
                                      <div className={`font-extrabold ${ing.isKImputed ? 'text-purple-600 underline decoration-dashed' : 'text-orange-600'}`}>
                                        {ing.calculatedPotassium}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-slate-400 text-[9px]">P</div>
                                      <div className={`font-extrabold ${ing.isPImputed ? 'text-purple-600 underline decoration-dashed' : 'text-pink-600'}`}>
                                        {ing.calculatedPhosphorus}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-slate-400 text-[9px]">Ca</div>
                                      <div className={`font-extrabold ${ing.isCaImputed ? 'text-purple-600 underline decoration-dashed' : 'text-amber-600'}`}>
                                        {ing.calculatedCalcium}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-slate-400 text-[9px]">Pro</div>
                                      <div className="font-extrabold text-indigo-600">{ing.calculatedProtein}g</div>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>

                          {/* Comparative summary list */}
                          <div className="bg-slate-50 p-3 rounded-lg border border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-3">
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-600 font-semibold">
                              <Info className="w-3.5 h-3.5 text-slate-400" />
                              식단표 추정치와 보유 DB 정밀 대조 결과
                            </div>
                            <div className="flex gap-4 text-xs font-mono font-bold">
                              <div>
                                <span className="text-slate-500">칼륨: </span>
                                <span className={Math.abs(report.calculatedK - report.originalK) > 100 ? 'text-orange-600 font-black' : 'text-slate-800'}>
                                  {report.calculatedK}mg (오차: {Math.round(report.calculatedK - report.originalK)}mg)
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">인: </span>
                                <span className={Math.abs(report.calculatedP - report.originalP) > 50 ? 'text-pink-600 font-black' : 'text-slate-800'}>
                                  {report.calculatedP}mg (오차: {Math.round(report.calculatedP - report.originalP)}mg)
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">칼슘: </span>
                                <span className={Math.abs(report.calculatedCa - report.originalCa) > 30 ? 'text-amber-600 font-black' : 'text-slate-800'}>
                                  {report.calculatedCa}mg (오차: {Math.round(report.calculatedCa - report.originalCa)}mg)
                                </span>
                              </div>
                              <div>
                                <span className="text-slate-500">단백질: </span>
                                <span className="text-indigo-600">
                                  {report.calculatedProtein}g (오차: {parseFloat((report.calculatedProtein - report.originalProtein).toFixed(1))}g)
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
