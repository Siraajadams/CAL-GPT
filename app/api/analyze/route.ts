import OpenAI from "openai";

export async function POST(req: Request) {
  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { image } = await req.json();

    if (!image) {
      return Response.json({ error: "No image provided" }, { status: 400 });
    }

    const response = await openai.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: "Analyze this food image. Identify foods, estimate calories, and classify into: protein, carbohydrates, fats, vegetables, sugar.",
            },
            {
              type: "input_image",
              image_url: image,
            },
          ],
        },
      ],
    });

    return Response.json({
      result: response.output_text,
    });

  } catch (error: any) {
    console.error("OPENAI ERROR:", error);
    return Response.json({
      error: "OpenAI failed",
      details: error.message,
    });
  }
}
