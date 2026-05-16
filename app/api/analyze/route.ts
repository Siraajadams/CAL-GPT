import { NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function cleanAIText(text: string) {
  return text
    .replace(/#{1,6}\s?/g, "")
    .replace(/\*\*/g, "")
    .replace(/[-•]\s/g, "")
    .replace(/\n+/g, " ")
    .trim();
}

export async function POST(req: Request) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "Missing OpenAI API key",
      });
    }

    const body = await req.json();

    const image = body.image;

    if (!image) {
      return NextResponse.json({
        success: false,
        error: "No image provided",
      });
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
You are a nutrition and meal analysis assistant.

Return plain text only.
Do not use markdown.
Do not use headings.
Do not use hashtags.
Do not use bullet symbols.
Do not use asterisks.

Provide:
1. Visible foods
2. Estimated calories
3. Healthy eating advice
4. Portion guidance
5. Food group classification
6. Confidence level

Keep responses concise and mobile friendly.
`,
        },
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this food image.",
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
      max_tokens: 300,
    });

    const raw =
      response.choices?.[0]?.message?.content ||
      "Unable to analyze image";

    const cleaned = cleanAIText(raw);

    return NextResponse.json({
      success: true,
      result: cleaned,
    });
  } catch (error: any) {
    console.error("ANALYZE ERROR:", error);

    return NextResponse.json({
      success: false,
      error: error?.message || "Analysis failed",
    });
  }
}
