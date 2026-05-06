import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const imageBase64 = body.image;

    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json({
        success: false,
        calories: "",
        foods: "Image analysis failed",
        advice: "OpenAI API key missing",
        confidence: "LOW",
      });
    }

    const response = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "user",
              content: [
                {
                  type: "text",
                  text: `
Analyze this food image.

Return:
1. Estimated calories
2. Foods identified
3. Brief health advice
4. Confidence level
                  `,
                },
                {
                  type: "image_url",
                  image_url: {
                    url: imageBase64,
                  },
                },
              ],
            },
          ],
          max_tokens: 300,
        }),
      }
    );

    const data = await response.json();

    console.log("OPENAI RESPONSE:", data);

    if (!response.ok) {
      return NextResponse.json({
        success: false,
        calories: "",
        foods: "Image analysis failed",
        advice: data?.error?.message || "AI request failed",
        confidence: "LOW",
      });
    }

    const text =
      data.choices?.[0]?.message?.content ||
      "Unable to analyze image";

    return NextResponse.json({
      success: true,
      result: text,
    });
  } catch (error: any) {
    console.error("ANALYZE ERROR:", error);

    return NextResponse.json({
      success: false,
      calories: "",
      foods: "Image analysis failed",
      advice: error.message || "Server error",
      confidence: "LOW",
    });
  }
}
