import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { image, notes } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing in Vercel Environment Variables");
    }

    if (!image) {
      throw new Error("No image received from frontend");
    }

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyze this food photo.

Return ONLY valid JSON in this exact structure:

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
      recommendations:
        data.recommendations ||
        "Balance protein, vegetables and carbohydrates. Watch portion size.",
    });
  } catch (error: any) {
    console.error("OPENAI IMAGE ANALYSIS ERROR:", error?.message || error);

    return Response.json({
      description: "Image analysis failed",
      calories: 520,
      foodGroups: ["Needs AI image interpretation"],
      recommendations:
        error?.message ||
        "OpenAI analysis failed. Check API key, image format and deployment logs.",
    });
  }
}
