import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const { image, notes } = await req.json();

    if (!image) {
      return Response.json({
        description: "No image provided",
        calories: 500,
        foodGroups: ["Unknown"],
        recommendations: "Upload an image",
      });
    }

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Analyze this meal image.

Return:
1. Food description
2. Estimated calories
3. Food groups (array)
4. Health recommendation

Be concise.
              `,
            },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
    });

    // ✅ FIXED: correct parsing
    const outputText =
      response.output?.[0]?.content?.[0]?.text ||
      response.output_text ||
      "";

    console.log("AI RAW:", outputText);

    // Basic extraction
    const descriptionMatch = outputText.match(/description[:\-]?(.*)/i);
    const caloriesMatch = outputText.match(/(\d{2,4})\s?kcal/i);
    const groupsMatch = outputText.match(/groups[:\-]?(.*)/i);
    const recommendationMatch = outputText.match(/recommendation[:\-]?(.*)/i);

    return Response.json({
      description: descriptionMatch?.[1]?.trim() || outputText,
      calories: caloriesMatch ? Number(caloriesMatch[1]) : 520,
      foodGroups: groupsMatch
        ? groupsMatch[1].split(",").map((g) => g.trim())
        : ["Carbohydrate", "Protein / meat", "Vegetables"],
      recommendations:
        recommendationMatch?.[1]?.trim() ||
        "Balanced meal. Consider portion control.",
    });
  } catch (error: any) {
    console.error("AI ERROR:", error);

    return Response.json({
      description: "Image analysis failed",
      calories: 520,
      foodGroups: ["Needs AI image interpretation"],
      recommendations:
        error?.message || "Check API route, key, or request format",
    });
  }
}
