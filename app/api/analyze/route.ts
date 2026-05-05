import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");
    const mimeType = file.type || "image/jpeg";

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Return only JSON with calories, description, foodGroup, portionAdvice and confidence. Analyze this food image.`,
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
      calories: parsed.calories || 0,
      description: parsed.description || "Food detected",
      foodGroup: parsed.foodGroup || "Unknown",
      portionAdvice: parsed.portionAdvice || "Use balanced portions.",
      confidence: parsed.confidence || "medium",
    });
  } catch (error: any) {
    console.error("ANALYZE ERROR:", error);

    return NextResponse.json(
      {
        error: "AI request failed",
        description: "Image analysis failed",
        foodGroup: "Analysis failed",
        portionAdvice: error?.message || "Please try again.",
        confidence: "low",
      },
      { status: 500 }
    );
  }
}
