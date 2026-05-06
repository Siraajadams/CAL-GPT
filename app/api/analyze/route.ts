import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File | null;

    if (!image) {
      return NextResponse.json(
        {
          success: false,
          calories: "",
          description: "Image analysis failed",
          foodGroup: "No image uploaded",
          portionAdvice: "Please upload or take a food photo first.",
          confidence: "low",
        },
        { status: 400 }
      );
    }

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        {
          success: false,
          calories: "",
          description: "Image analysis failed",
          foodGroup: "API key missing",
          portionAdvice: "OpenAI API key is missing in Vercel.",
          confidence: "low",
        },
        { status: 500 }
      );
    }

    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const imageBase64 = `data:${image.type || "image/jpeg"};base64,${buffer.toString(
      "base64"
    )}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        response_format: { type: "json_object" },
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
  "description": "specific visible food and quantity",
  "foodGroup": "Fruit, Protein, Carbohydrate, Vegetables, Fat, or Mixed meal",
  "portionAdvice": "short clinical patient-friendly advice",
  "confidence": "low, medium or high"
}

Rules:
- Count visible items where possible.
- If the image shows oranges, say oranges.
- Do not say Mixed meal if it is only one food type.
- calories must be a number.
                `,
              },
              {
                type: "image_url",
                image_url: {
                  url: imageBase64,
                },
              },
            ],
          },
        ],
        max_tokens: 500,
      }),
    });

    const data = await response.json();

    console.log("OPENAI RESPONSE:", data);

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          calories: "",
          description: "Image analysis failed",
          foodGroup: "Analysis failed",
          portionAdvice: data?.error?.message || "AI request failed.",
          confidence: "low",
        },
        { status: response.status }
      );
    }

    const raw = data.choices?.[0]?.message?.content || "{}";

    let parsed: any;

    try {
      parsed = JSON.parse(raw);
    } catch {
      return NextResponse.json(
        {
          success: false,
          calories: "",
          description: "Image analysis failed",
          foodGroup: "Analysis failed",
          portionAdvice: "AI response could not be parsed.",
          confidence: "low",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
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
        success: false,
        calories: "",
        description: "Image analysis failed",
        foodGroup: "Analysis failed",
        portionAdvice: error?.message || "Server error.",
        confidence: "low",
      },
      { status: 500 }
    );
  }
}
