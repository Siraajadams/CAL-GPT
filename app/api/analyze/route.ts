import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";
export const maxDuration = 30;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractCalories(text: string) {
  const match =
    text.match(/(\d{2,5})\s?(?:kcal|calories)/i) ||
    text.match(/(?:kcal|calories)[^\d]{0,10}(\d{2,5})/i);

  return match?.[1] || "";
}

function detectFoodGroup(text: string) {
  const t = text.toLowerCase();

  if (
    t.includes("orange") ||
    t.includes("apple") ||
    t.includes("banana") ||
    t.includes("fruit")
  ) {
    return "Fruit";
  }

  if (
    t.includes("chicken") ||
    t.includes("meat") ||
    t.includes("beef") ||
    t.includes("fish") ||
    t.includes("egg")
  ) {
    return "Protein";
  }

  if (
    t.includes("rice") ||
    t.includes("bread") ||
    t.includes("pasta") ||
    t.includes("potato")
  ) {
    return "Carbohydrate";
  }

  if (
    t.includes("salad") ||
    t.includes("vegetable") ||
    t.includes("broccoli")
  ) {
    return "Vegetables";
  }

  return "Mixed meal";
}

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing OpenAI API key",
        },
        { status: 500 }
      );
    }

    let body: any;

    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid request body",
        },
        { status: 400 }
      );
    }

    const image = body?.image;

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          error: "No image provided",
        },
        { status: 400 }
      );
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      max_tokens: 400,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
You are a clinical nutrition AI.

Analyse the uploaded meal image.

Return:
- visible foods
- estimated calories
- brief healthy eating advice
- portion size guidance

Keep response concise and clinically useful.
              `,
            },
            {
              type: "image_url",
              image_url: {
                url: image,
              },
            },
          ],
        },
      ],
    });

    const result =
      response.choices?.[0]?.message?.content ||
      "Unable to analyze image";

    const calories = extractCalories(result);

    return NextResponse.json({
      success: true,
      result,
      description: result,
      calories,
      foodGroup: detectFoodGroup(result),
      portionAdvice:
        "Focus on balanced portions and minimise ultra-processed foods.",
      confidence: "medium",
    });
  } catch (error: any) {
    console.error("ANALYZE ERROR:", error);

    return NextResponse.json(
      {
        success: false,
        error: error?.message || "AI request failed",
      },
      { status: 500 }
    );
  }
}
