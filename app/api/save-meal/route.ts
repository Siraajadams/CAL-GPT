import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { error } = await supabase.from("calgpt_meal_scans").insert([
      {
        meal_type: body.meal_type || "Meal",
        calories: Number(body.calories) || 0,
        detected_groups: body.detected_groups || "",
        advice: body.advice || "",
        confidence: body.confidence || "",
        visible_food: body.visible_food || "",
        gender: body.gender || "",
        age_band: body.age_band || "",
        weight: body.weight ? Number(body.weight) : null,
        height: body.height ? Number(body.height) : null,
        bmi: body.bmi ? Number(body.bmi) : null,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      return NextResponse.json({ success: false, error }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || "Unexpected error" },
      { status: 500 }
    );
  }
}
