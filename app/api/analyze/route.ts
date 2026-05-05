import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          error: "OPENAI_API_KEY not found in this deployment",
          description: "Image analysis failed",
          foodGroup: "API key missing",
          portionAdvice: "The OpenAI API key is not available to this deployment.",
          confidence: "low",
        },
        { status: 500 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        {
          error: "No image uploaded",
          description: "Image analysis failed",
          foodGroup: "No image",
          portionAdvice: "Please upload a food image.",
          confidence: "low",
        },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

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
              text: `
Analyze this food image.

Return ONLY valid JSON:

{
  "calories": number,
  "description": "specific visible food and quantity",
  "foodGroup": "Fruit, Protein, Carbohydrate, Vegetables, Fat, or Mixed meal",
  "portionAdvice": "short clinical patient-friendly advice",
  "confidence": "low, medium or high"
}

Rules:
- Count visible items where possible.
- If image shows oranges, say oranges.
- Do not say mixed meal if it is one food type.
`,
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    const raw = response.choices[0]?.message?.content || "{}";
    const parsed = JSON.parse(raw);

    return NextResponse.json({
      calories: Number(parsed.calories) || 0,
      description: parsed.description || "Food detected",
      foodGroup: parsed.foodGroup || "Unknown",
      portionAdvice: parsed.portionAdvice || "Use balanced portions.",
      confidence: parsed.confidence || "medium",
    });
  } catch (error: any) {
    console.error("ANALYZE ERROR:", error);

    return NextResponse.json(
      {
        error: error?.message || "AI request failed",
        description: "Image analysis failed",
        foodGroup: "Analysis failed",
        portionAdvice: error?.message || "Please try again.",
        confidence: "low",
      },
      { status: 500 }
    );
  }
}
