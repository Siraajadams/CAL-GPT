import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function safeFallback(message = "AI request failed") {
  return NextResponse.json({
    error: message,
    calories: 0,
    description: "Image analysis failed",
    foodGroup: "Upload a clearer food image",
    portionAdvice: "Please try again with a clear photo of the full plate.",
    confidence: "low",
    items: [],
    macros: {
      carbohydrates: "unknown",
      protein: "unknown",
      fat: "unknown",
      fibre: "unknown",
    },
    clinicalNotes: {
      sugarLoad: "unknown",
      diabetesCaution: "Unable to assess from this image.",
      weightLossAdvice: "Please upload a clearer image.",
    },
  });
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return safeFallback("Missing OpenAI API key");
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return safeFallback("No image uploaded");
    }

    if (file.size > 5_000_000) {
      return safeFallback("Image too large. Please upload an image under 5MB.");
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const prompt = `
You are a clinical nutrition assistant.

Analyze the food image.

Return ONLY valid JSON. No markdown.

Use this structure:
{
  "calories": number,
  "description": "specific food description, including quantity if visible",
  "foodGroup": "specific food group, e.g. Fruit, Protein, Carbohydrate, Mixed meal",
  "portionAdvice": "short practical patient-friendly advice",
  "confidence": "low, medium or high",
  "items": [
    {
      "name": "food name",
      "quantity": number,
      "estimatedCaloriesPerItem": number,
      "totalCalories": number
    }
  ],
  "macros": {
    "carbohydrates": "low, moderate or high",
    "protein": "low, moderate or high",
    "fat": "low, moderate or high",
    "fibre": "low, moderate or high"
  },
  "clinicalNotes": {
    "sugarLoad": "low, moderate or high",
    "diabetesCaution": "short note",
    "weightLossAdvice": "short note"
  }
}

Rules:
- Count visible items where possible.
- Example: 6 oranges should be described as "6 whole oranges", foodGroup "Fruit", calories around 360-420.
- Do not say "Mixed meal" if the image shows one type of food.
- If unsure, estimate and set confidence to low.
`;

    const response = await openai.responses.create({
      model: "gpt-4o",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: prompt,
            },
            {
              type: "input_image",
              image_url: `data:${mimeType};base64,${base64}`,
            },
          ],
        },
      ],
    });

    const raw = response.output_text || "";

    let parsed: any;

    try {
      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (err) {
      console.error("JSON parse failed:", err);
      console.error("Raw response:", raw);

      return safeFallback("AI response could not be parsed");
    }

    return NextResponse.json({
      calories: Number(parsed.calories) || 0,
      description: parsed.description || "Food detected",
      foodGroup: parsed.foodGroup || "Unknown",
      portionAdvice:
        parsed.portionAdvice ||
        "Use balanced portions and avoid oversized servings.",
      confidence: parsed.confidence || "medium",
      items: Array.isArray(parsed.items) ? parsed.items : [],
      macros: parsed.macros || {
        carbohydrates: "unknown",
        protein: "unknown",
        fat: "unknown",
        fibre: "unknown",
      },
      clinicalNotes: parsed.clinicalNotes || {
        sugarLoad: "unknown",
        diabetesCaution: "Use caution if diabetic or insulin resistant.",
        weightLossAdvice: "Monitor total calorie intake.",
      },
    });
  } catch (error: any) {
    console.error("Image analysis error:", error);

    return safeFallback(error?.message || "AI request failed");
  }
}
