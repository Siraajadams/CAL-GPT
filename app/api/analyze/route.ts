import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const apiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;

console.log("KEY EXISTS:", Boolean(apiKey));
console.log("KEY LENGTH:", apiKey?.length || 0);

const openai = new OpenAI({
  apiKey,
});

export async function POST(req: Request) {
  try {
    console.log("KEY:", process.env.OPENAI_API_KEY);

    const formData = await req.formData();
    const file = formData.get("image") as File;

    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString("base64");

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "Estimate calories and describe food." },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${base64}`,
              },
            },
          ],
        },
      ],
    });

    return NextResponse.json({
      result: response.choices[0].message.content,
    });

  } catch (err: any) {
    console.error("ERROR:", err);

    return NextResponse.json({
      error: err.message,
    });
  }
}
