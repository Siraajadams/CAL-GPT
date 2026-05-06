import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const runtime = "nodejs";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        error: "Missing OpenAI API key",
      });
    }

    let body: any;

    try {
      body = await req.json();
    } catch (err) {
      return NextResponse.json({
        success: false,
        error: "Invalid JSON body",
      });
    }

    const image = body?.image;

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
          role: "user",
          content: [
            {
              type: "text",
              text: "Estimate calories and describe visible food.",
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

    const result =
      response.choices?.[0]?.message?.content ||
      "Unable to analyze image";

    return NextResponse.json({
      success: true,
      result,
    });
  } catch (error: any) {
    console.error("ANALYZE ERROR:", error);

    return NextResponse.json({
      success: false,
      error: error.message || "Unknown server error",
    });
  }
}
