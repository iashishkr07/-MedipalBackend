import asyncHandler from "express-async-handler";
import axios from "axios";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

const getAiInsight = asyncHandler(async (req, res) => {
  const recordData = req.body;

  if (!recordData || Object.keys(recordData).length === 0) {
    return res.status(400).json({ message: "Record data is required" });
  }

  try {
    const geminiResponse = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Here is the user's medical data: ${JSON.stringify(
                  recordData
                )}. Provide a health and lifestyle recommendation under 200 words.`,
              },
            ],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const content =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ insight: content });
  } catch (error) {
    console.error(
      "Error fetching AI insight:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ message: "Failed to generate AI insight." });
  }
});

const generateHealthTips = asyncHandler(async (req, res) => {
  const { user, records } = req.body;

  if (!user || !records) {
    return res
      .status(400)
      .json({ message: "User and medical records are required" });
  }

  try {
    const geminiResponse = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Generate personalized health precautions, dietary tips, and cardiovascular safety plans based on the following user and medical data:

User Info:
Name: ${user.name}
Age: ${user.age}
Gender: ${user.gender}

Medical Info:
Symptoms: ${records.symptoms?.join(", ")}
Diagnosis: ${records.diagnosis}
Medications: ${records.medications?.join(", ")}
Lab Results: ${records.labResults?.join(", ")}

Format the response in structured JSON like:
{
  "keyRecommendations": ["..."],
  "dietPlan": ["..."],
  "cardiovascularPrecautions": ["..."],
  "additionalTips": ["..."]
}`,
              },
            ],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );

    const content =
      geminiResponse.data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
    res.json(JSON.parse(content));
  } catch (error) {
    console.error(
      "Error fetching AI health tips:",
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ message: "Failed to generate AI health tips." });
  }
});

const translateText = asyncHandler(async (req, res) => {
  const { text } = req.body;

  if (!text) {
    return res.status(400).json({ message: "Text is required" });
  }

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      {
        contents: [
          {
            parts: [
              {
                text: `Translate the following English medical recommendation to Hindi:\n\n${text}`,
              },
            ],
          },
        ],
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    const translatedText =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    res.json({ translatedText });
  } catch (error) {
    console.error(
      `Translation to Hindi failed:`,
      error.response ? error.response.data : error.message
    );
    res.status(500).json({ message: `Translation to Hindi failed.` });
  }
});

export { getAiInsight, translateText, generateHealthTips };
