import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { image, notes } = await req.json();

    const response = await openai.responses.create({
      model: "gpt-4o-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `Analyze this meal image and description. 
              
Return JSON ONLY with:
- calories (number)
- description (string)
- foodGroups (array of strings: protein, carbs, vegetables, sugar, fats)

Notes: ${notes || ""}`,
            },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
    });

    const text = response.output[0].content[0].text;

    return Response.json(JSON.parse(text));
  } catch (error) {
    console.error(error);
    return Response.json(
      { error: "AI analysis failed" },
      { status: 500 }
    );
  }
}
