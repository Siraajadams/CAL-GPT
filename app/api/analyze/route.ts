import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { image, notes } = await req.json();

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is missing");
    }

    if (!image || !String(image).startsWith("data:image")) {
      throw new Error("Image must be sent as base64 data URL");
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyze this meal photo.

Return a short plain-English response with:
1. Meal description
2. Estimated calories
3. Food groups
4. Health recommendation

User notes: ${notes || "none"}`,
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

    let text = "";

    try {
      text =
        response.output?.[0]?.content?.[0]?.text ||
        response.output_text ||
        "No response from AI";
    } catch {
      text = "Failed to parse AI response";
    }

    return Response.json({
      description: text,
      calories: 500,
      foodGroups: ["Carbohydrate", "Protein / meat", "Vegetables"],
      recommendations: text,
    });
  } catch (error: any) {
    console.error("OPENAI IMAGE ANALYSIS ERROR:", error?.message || error);

    return Response.json({
      description: "Image analysis failed",
      calories: 520,
      foodGroups: ["Needs AI image interpretation"],
      recommendations: error?.message || "Unknown OpenAI error",
    });
  }
}
