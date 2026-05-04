import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing");
    }

    const { image, notes } = await req.json();

    if (!image) {
      throw new Error("No image received");
    }

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyze this meal image and return ONLY valid JSON:
{
  "description": "short meal description",
  "calories": 0,
  "foodGroups": ["Carbohydrate", "Protein / meat", "Vegetables", "Sugar / dessert", "Fat / oils"],
  "recommendations": "short practical recommendation"
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

    const text = response.output_text || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);

    return Response.json(data);
  } catch (error: any) {
    console.error("OPENAI IMAGE ANALYSIS ERROR:", error);

    return Response.json(
      {
        description: "Image analysis failed",
        calories: 0,
        foodGroups: ["AI error"],
        recommendations: error?.message || "Unknown OpenAI error",
      },
      { status: 200 }
    );
  }
}
