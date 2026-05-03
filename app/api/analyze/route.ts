import OpenAI from "openai";

export async function POST(req: Request) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const { image } = await req.json();

  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: "Estimate calories and macros from this meal. Return JSON." },
          {
            type: "image_url",
            image_url: { url: image }
          }
        ],
      },
    ],
  });

  return Response.json({ result: response.choices[0].message.content });
}
