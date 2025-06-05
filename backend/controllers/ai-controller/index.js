import * as ai from '../../service/ai.js'; // ← also include “.js”

export const getResult = async (req, res) => {
  try {
    const { prompt } = req.query;
    if (!prompt) {
      return res.status(400).json({ message: "Prompt is required" });
    }
    const result = await ai.generateResult(prompt);
    res.status(200).json({ result });
  } catch (err) {
    console.error("AI generation error:", err);
    res.status(500).json({ message: err.message || "Internal server error" });
  }
};

