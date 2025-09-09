const express = require("express");
const router = express.Router();
const groq = require("../utils/groqClient");

// Safe JSON parse function with enhanced cleaning
function safeJSONParse(str) {
  if (!str || typeof str !== 'string') return null;
  let cleanedStr = str.trim()
    .replace(/^```json\s*/, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .replace(/\n\s*/g, '')
    .trim();

  try { return JSON.parse(cleanedStr); }
  catch { return null; }
}

// Default quiz
const defaultQuiz = {
  questions: [
    {
      question: "What is the primary source of renewable energy in the world?",
      options: ["Solar", "Wind", "Hydro", "Geothermal"],
      answer: "Hydro"
    },
    {
      question: "Which material is most recyclable?",
      options: ["Plastic", "Glass", "Paper", "Wood"],
      answer: "Glass"
    },
    {
      question: "What gas is primarily responsible for global warming?",
      options: ["Oxygen", "Nitrogen", "Carbon Dioxide", "Helium"],
      answer: "Carbon Dioxide"
    }
  ]
};

// Generate sustainability quiz
router.post("/quiz", async (req, res) => {
  const topic = req.body.topic || "sustainability";
  try {
    const prompt = `
Generate 3 multiple-choice questions on the topic "${topic}".
Return JSON ONLY in this format:

{
  "questions": [
    {
      "question": "Your question here",
      "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
      "answer": "Option 1"
    }
  ]
}
`;

    const completion = await groq.chat.completions.create({
      messages: [{ role: "user", content: prompt }],
      model: "llama-3.1-8b-instant",
      temperature: 0.7,
      max_tokens: 1000
    });

    const responseText = completion.choices?.[0]?.message?.content;
    const parsed = safeJSONParse(responseText);

    if (!parsed || !Array.isArray(parsed.questions) || parsed.questions.length !== 3) {
      return res.status(200).json(defaultQuiz);
    }

    res.json(parsed);
  } catch (err) {
    console.error("Quiz generation error:", err.message);
    res.status(200).json(defaultQuiz);
  }
});

module.exports = router;
