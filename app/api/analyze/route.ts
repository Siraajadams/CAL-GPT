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
      model: "gpt-4o",
      temperature: 0.1,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `
You are a clinical nutrition image analysis assistant.

Analyze the food image carefully.

IMPORTANT:
- Identify each visible food item.
- Count quantities where possible.
- Estimate calories per item and total.
- Do not use generic answers like "mixed meal" unless there are truly multiple food groups.
- If all items are the same, name the exact food group, e.g. "Fruit".
- Be realistic and clinically cautious.
- If uncertain, give a best estimate and mark confidence as low or medium.

Return ONLY valid JSON.
Do not include markdown.
Do not include explanations outside the JSON.

Use this exact JSON structure:

{
  "calories": 390,
  "description": "6 whole oranges",
  "foodGroup": "Fruit",
  "portionAdvice": "High in vitamin C, but 6 oranges is a large fruit portion. Consider 1-2 oranges as a normal serving.",
  "confidence": "high",
  "items": [
    {
      "name": "orange",
      "quantity": 6,
      "estimatedCaloriesPerItem": 65,
      "totalCalories": 390
    }
  ],
  "macros": {
    "carbohydrates": "high",
    "protein": "low",
    "fat": "low",
    "fibre": "moderate"
  },
  "clinicalNotes": {
    "sugarLoad": "moderate to high",
    "diabetesCaution": "Large fruit portions may raise blood glucose. Consider smaller portions if diabetic or insulin resistant.",
    "weightLossAdvice": "Reduce portion size and pair fruit with protein if using this as a snack."
  }
}

Rules:
- calories must be a number.
- quantity must be a number.
- confidence must be one of: low, medium, high.
- Keep advice patient-friendly.
- If image is unclear, still return valid JSON with confidence low.
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

    let parsed: any;

    try {
      const cleaned = raw
        .replace(/```json/g, "")
        .replace(/```/g, "")
        .trim();

      parsed = JSON.parse(cleaned);
    } catch (parseError) {
      console.error("AI JSON parse error:", parseError);
      console.error("Raw AI response:", raw);

      return NextResponse.json(
        {
          error: "AI response could not be parsed",
          calories: 0,
          description: "Image analysis failed",
          foodGroup: "Upload a clearer food image",
          portionAdvice:
            "Please try again with a clear photo of the full plate.",
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
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      calories: Number(parsed.calories) || 0,
      description: parsed.description || "Food detected",
      foodGroup: parsed.foodGroup || "Mixed food group",
      portionAdvice:
        parsed.portionAdvice ||
        "Use balanced portions and avoid oversized servings.",
      confidence: parsed.confidence || "medium",
      items: parsed.items || [],
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

    return NextResponse.json(
      {
        error: error?.message || "Image analysis failed",
        calories: 0,
        description: "Image analysis failed",
        foodGroup: "Upload a clearer food image",
        portionAdvice:
          "Please try again with a clear photo of the full plate.",
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
      },
      { status: 500 }
    );
  }
}
