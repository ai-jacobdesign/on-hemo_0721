import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

// Initialize Gemini SDK with telemetry header
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // 1. Dr. Nephron AI Consultation Chat
  app.post("/api/gemini/chat", async (req, res) => {
    try {
      const { messages, labs } = req.body;
      if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "Invalid messages format" });
        return;
      }

      // Format current labs context
      const labsContext = labs 
        ? `Patient's current labs: Potassium (K): ${labs.potassium} mEq/L (Normal: 3.5-5.0, current is elevated), Phosphorus (P): ${labs.phosphorus} mg/dL, Calcium (Ca): ${labs.calcium} mg/dL.`
        : "Patient labs: Potassium elevated (5.4 mEq/L), Phosphorus normal (4.2 mg/dL), Calcium normal (9.1 mg/dL).";

      const systemInstruction = `You are Dr. Nephron, a compassionate nephrologist and expert clinical renal nutritionist. 
Your goal is to guide Chronic Kidney Disease (CKD) or dialysis patients in maintaining a kidney-safe diet.
Focus on low-sodium, low-potassium, low-phosphorus, and balanced protein choices.
Always prioritize giving practical kitchen prep guidelines (e.g. chopping finely and boiling/leaching vegetables to reduce potassium by 30-50%, choosing fresh proteins over processed ones to avoid hidden phosphate additives).

${labsContext}

Respond in Korean with a warm, caring, yet highly professional tone. Use clean Markdown formatting. Include clear bullet points for dietary tips.
At the end of your response, always remind the patient kindly that this is an AI advisory service and they should consult their medical team for personal clinical decisions.`;

      // Format messages for @google/genai SDK
      // We take the last 10 messages for context
      const formattedContents = messages.slice(-10).map(m => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: formattedContents,
        config: {
          systemInstruction,
          temperature: 0.7,
        }
      });

      res.json({ text: response.text });
    } catch (error: any) {
      console.error("Gemini Chat Error:", error);
      res.status(500).json({ error: error.message || "Failed to process AI chat" });
    }
  });

  // 2. Renal Food Suitability Analyzer & Alternative Generator
  app.post("/api/gemini/analyze-food", async (req, res) => {
    try {
      const { foodName, labs } = req.body;
      if (!foodName) {
        res.status(400).json({ error: "Food name is required" });
        return;
      }

      const potassiumStatus = labs && Number(labs.potassium) > 5.0 ? "high" : "normal";
      const prompt = `Analyze the suitability of "${foodName}" for a kidney disease patient. 
The patient's Potassium is currently ${labs?.potassium || "5.4"} mEq/L (which is ${potassiumStatus}).
Provide a comprehensive evaluation containing:
1. Suitability status: 'SAFE' (generally low in potassium, phosphorus, sodium, and appropriate), 'CAUTION' (moderate or requires careful portion control/preparation), or 'AVOID' (dangerously high in potassium, phosphorus, or sodium, or processed with phosphate additives).
2. Potassium level of this food: 'LOW' | 'MEDIUM' | 'HIGH'.
3. Phosphorus level of this food: 'LOW' | 'MEDIUM' | 'HIGH'.
4. Concise and clear clinical explanation in Korean of why it falls under this category.
5. Practical preparation or cooking tip (in Korean) to make it safer (e.g., leaching potassium, boiling, sizing portions, avoiding processed variations).
6. 2-3 delicious, kidney-friendly alternative ingredients or meals (in Korean).`;

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              suitability: { type: Type.STRING, description: "SAFE, CAUTION, or AVOID" },
              potassiumLevel: { type: Type.STRING, description: "LOW, MEDIUM, or HIGH" },
              phosphorusLevel: { type: Type.STRING, description: "LOW, MEDIUM, or HIGH" },
              reasoning: { type: Type.STRING, description: "Reasoning in Korean" },
              prepTip: { type: Type.STRING, description: "Cooking or preparation tip in Korean" },
              alternatives: { 
                type: Type.ARRAY, 
                items: { type: Type.STRING },
                description: "2-3 kidney-safe alternatives in Korean"
              }
            },
            required: ["suitability", "potassiumLevel", "phosphorusLevel", "reasoning", "prepTip", "alternatives"]
          }
        }
      });

      const resultText = response.text || "{}";
      res.json(JSON.parse(resultText));
    } catch (error: any) {
      console.error("Gemini Food Analysis Error:", error);
      res.status(500).json({ error: error.message || "Failed to analyze food" });
    }
  });

  // Vite dev server middleware integration
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
