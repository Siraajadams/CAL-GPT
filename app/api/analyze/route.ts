import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  try {
    const { image, notes } = await req.json();

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `Analyze this meal image. Return ONLY JSON with:
{
  "description": "short meal description",
  "calories": number,
  "foodGroups": ["Carbohydrate","Protein / meat","Vegetables","Sugar / dessert","Fat / oils"],
  "recommendations": "short health recommendation"
}
Notes from user: ${notes || ""}`,
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

    const text = response.choices[0]?.message?.content || "{}";
    const cleaned = text.replace(/```json|```/g, "").trim();
    const data = JSON.parse(cleaned);

    return Response.json(data);
  } catch (error) {
    return Response.json(
      {
        description: "Image analysis failed",
        calories: 520,
        foodGroups: ["Needs AI image interpretation"],
        recommendations:
          "Check that OPENAI_API_KEY is added in Vercel Environment Variables and that the openai package is installed.",
      },
      { status: 200 }
    );
  }
}
