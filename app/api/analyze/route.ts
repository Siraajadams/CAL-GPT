import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function fallback(notes: string) {
  return {
    description: notes || "Meal image uploaded",
    calories: 520,
    foodGroups: ["Carbohydrate", "Protein / meat", "Vegetables"],
    recommendations: "Review portion sizes and balance protein, vegetables and carbohydrates.",
  };
}

export async function POST(req: Request) {
  try {
    const { image, notes } = await req.json();

    if (!image) {
      return Response.json(fallback(notes));
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyze this food photo. Return ONLY valid JSON with:
{
  "description": "short description of the meal",
  "calories": 0,
  "foodGroups": ["Carbohydrate", "Protein / meat", "Vegetables", "Sugar / dessert", "Fat / oils"],
  "recommendations": "short practical nutrition advice"
}

User notes: ${notes || ""}`,
            },
            {
              type: "input_image",
              image_url: image,
              detail: "low",
            },
          ],
        },
      ],
    });

    const raw = response.output_text || "{}";
    const cleaned = raw.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);

    return Response.json({
      description: data.description || notes || "Meal analyzed",
      calories: data.calories || 520,
      foodGroups: data.foodGroups || ["Needs AI image interpretation"],
      recommendations: data.recommendations || "No recommendation returned.",
    });
  } catch (error: any) {
    console.error("OPENAI IMAGE ANALYSIS ERROR:", error?.message || error);
    return Response.json({
      description: "Image analysis failed",
      calories: 520,
      foodGroups: ["Needs AI image interpretation"],
      recommendations: error?.message || "OpenAI analysis failed.",
    });
  }
}
