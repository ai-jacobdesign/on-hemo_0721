const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  "const [potassium, setPotassium] = useState<number>(5.4);",
  "const [potassiumStr, setPotassiumStr] = useState<string>('5.4');\n  const potassium = Number(potassiumStr) || 0;"
);

content = content.replace(
  "const [phosphorus, setPhosphorus] = useState<number>(4.2);",
  "const [phosphorusStr, setPhosphorusStr] = useState<string>('4.2');\n  const phosphorus = Number(phosphorusStr) || 0;"
);

content = content.replace(
  "const [calcium, setCalcium] = useState<number>(9.1);",
  "const [calciumStr, setCalciumStr] = useState<string>('9.1');\n  const calcium = Number(calciumStr) || 0;"
);

// Potassium Range
content = content.replace(
  'value={potassium}\n                      onChange={(e) => setPotassium(parseFloat(e.target.value))}',
  'value={potassiumStr}\n                      onChange={(e) => setPotassiumStr(e.target.value)}'
);

// Potassium Number
content = content.replace(
  "value={potassium}\n                      onChange={(e) => setPotassium(e.target.value === '' ? '' as any : parseFloat(e.target.value))}",
  'value={potassiumStr}\n                      onChange={(e) => setPotassiumStr(e.target.value)}'
);

// Phosphorus Range
content = content.replace(
  'value={phosphorus}\n                      onChange={(e) => setPhosphorus(parseFloat(e.target.value))}',
  'value={phosphorusStr}\n                      onChange={(e) => setPhosphorusStr(e.target.value)}'
);

// Phosphorus Number
content = content.replace(
  "value={phosphorus}\n                      onChange={(e) => setPhosphorus(e.target.value === '' ? '' as any : parseFloat(e.target.value))}",
  'value={phosphorusStr}\n                      onChange={(e) => setPhosphorusStr(e.target.value)}'
);

// Calcium Range
content = content.replace(
  'value={calcium}\n                      onChange={(e) => setCalcium(parseFloat(e.target.value))}',
  'value={calciumStr}\n                      onChange={(e) => setCalciumStr(e.target.value)}'
);

// Calcium Number
content = content.replace(
  "value={calcium}\n                      onChange={(e) => setCalcium(e.target.value === '' ? '' as any : parseFloat(e.target.value))}",
  'value={calciumStr}\n                      onChange={(e) => setCalciumStr(e.target.value)}'
);

fs.writeFileSync('src/App.tsx', content);
console.log("Inputs stringified.");
