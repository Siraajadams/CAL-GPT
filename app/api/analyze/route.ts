import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { image, notes } = await req.json();

    // 🔒 Check API key
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        description: "Image analysis failed",
        calories: 520,
        foodGroups: ["Needs AI image interpretation"],
        recommendations: "OPENAI_API_KEY is missing",
      });
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 🧠 Call OpenAI
    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Return ONLY valid JSON. No markdown.

{
  "description": "short meal description",
  "calories": number,
  "foodGroups": ["Carbohydrate", "Protein / meat", "Vegetables"],
  "recommendations": "short practical advice"
}

Notes: ${notes || "none"}
`,
            },
            ...(image
              ? [
                  {
                    type: "input_image",
                    image_url: image,
                    detail: "low",
                  },
                ]
              : []),
          ] as any,
        },
      ],
    });

    // 🔑 Extract AI output safely
    const outputText =
      response.output_text ||
      response.output?.[0]?.content?.[0]?.text ||
      "";

    let parsed;

    try {
      const cleaned = outputText.replace(/```json|```/g, "").trim();
      parsed = JSON.parse(cleaned);
    } catch {
      parsed = {
        description: outputText || "Meal analyzed",
        calories: 520,
        foodGroups: ["Needs AI image interpretation"],
        recommendations: "AI returned text instead of JSON",
      };
    }

    // ✅ FINAL RETURN (THIS WAS YOUR MISSING PIECE)
    return NextResponse.json({
      description: parsed.description || "Meal analyzed",
      calories: Number(parsed.calories) || 520,
      foodGroups:
        Array.isArray(parsed.foodGroups) && parsed.foodGroups.length
          ? parsed.foodGroups
          : ["Needs AI image interpretation"],
      recommendations:
        parsed.recommendations ||
        "Balance protein, vegetables and carbohydrates.",
    });

  } catch (error: any) {
    console.error("OPENAI ERROR:", error?.message || error);

    return NextResponse.json({
      description: "Image analysis failed",
      calories: 520,
      foodGroups: ["Needs AI image interpretation"],
      recommendations:
        error?.message || "AI request failed",
    });
  }
}
