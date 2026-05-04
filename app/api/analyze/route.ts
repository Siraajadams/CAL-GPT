import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No image uploaded" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
Analyze this food image.

Return ONLY valid JSON in this exact format:

{
  "calories": number,
  "description": "short description of visible food",
  "foodGroup": "main food groups",
  "portionAdvice": "short portion recommendation",
  "confidence": "low, medium or high"
}
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

    const raw = response.choices[0]?.message?.content || "";

    let parsed;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        {
          error: "AI response could not be parsed",
          raw,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      calories: parsed.calories || 0,
      description: parsed.description || "Food detected",
      foodGroup: parsed.foodGroup || "Mixed food group",
      portionAdvice: parsed.portionAdvice || "Use balanced portions.",
      confidence: parsed.confidence || "medium",
    });
  } catch (error: any) {
    console.error("Image analysis error:", error);

    return NextResponse.json(
      {
        error: error?.message || "Image analysis failed",
      },
      { status: 500 }
    );
  }
}
