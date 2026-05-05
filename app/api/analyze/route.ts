import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function fallback(message = "AI request failed") {
  return NextResponse.json({
    calories: 0,
    description: "Image analysis failed",
    foodGroup: "Upload a clearer food image",
    portionAdvice: message,
    advice: message,
    confidence: "low",
  });
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return fallback("Missing OpenAI API key in Vercel environment variables.");
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return fallback("No image uploaded.");
    }

    if (file.size > 5_000_000) {
      return fallback("Image too large. Please upload an image under 5MB.");
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";
    const imageUrl = `data:${mimeType};base64,${base64}`;

    const prompt = `
You are a clinical nutrition AI.

Analyze this food image.

Return ONLY valid JSON. No markdown.

Use this exact structure:

{
  "calories": number,
  "description": "specific visible food and quantity",
  "foodGroup": "Fruit, Protein, Carbohydrate, Vegetables, Fat, or Mixed meal",
  "portionAdvice": "short clinical patient-friendly advice",
  "advice": "short clinical patient-friendly advice",
  "confidence": "low, medium or high"
}

Rules:
- Count visible items where possible.
- If image shows 6 oranges, return around 360-420 calories.
- Do not say Mixed meal if it is one food type.
- If uncertain, estimate and set confidence to low.
`;

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      temperature: 0.1,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: prompt,
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "";

    let parsed: any;

    try {
      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch {
      return fallback("AI response could not be parsed.");
    }

    const advice =
      parsed.portionAdvice ||
      parsed.advice ||
      "Use balanced portions and avoid oversized servings.";

    return NextResponse.json({
      calories: Number(parsed.calories) || 0,
      description: parsed.description || "Food detected",
      foodGroup: parsed.foodGroup || "Unknown",
      portionAdvice: advice,
      advice,
      confidence: parsed.confidence || "medium",
    });
  } catch (error: any) {
    console.error("AI ERROR:", error);

    return fallback(error?.message || "AI request failed");
  }
}
