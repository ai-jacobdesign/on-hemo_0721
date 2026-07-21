const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(
  'onChange={(e) => setPotassium(Math.max(2, Math.min(7.5, parseFloat(e.target.value) || 3.5)))}',
  "onChange={(e) => setPotassium(e.target.value === '' ? '' as any : parseFloat(e.target.value))}"
);

content = content.replace(
  'onChange={(e) => setPhosphorus(Math.max(1.0, Math.min(8.0, parseFloat(e.target.value) || 3.5)))}',
  "onChange={(e) => setPhosphorus(e.target.value === '' ? '' as any : parseFloat(e.target.value))}"
);

content = content.replace(
  'onChange={(e) => setCalcium(Math.max(6, Math.min(13, parseFloat(e.target.value) || 9.0)))}',
  "onChange={(e) => setCalcium(e.target.value === '' ? '' as any : parseFloat(e.target.value))}"
);

fs.writeFileSync('src/App.tsx', content);
console.log("Inputs fixed.");
