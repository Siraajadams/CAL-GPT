import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const insertPayload = {
      user_email: body.user_email || "",
      meal_type: body.meal_type || "Meal",
      calories: body.calories || 0,
      detected_groups: body.detected_groups || "",
      advice: body.advice || "",
      confidence: body.confidence || "",
      visible_food: body.visible_food || "",

      gender: body.gender || "",
      age_band: body.age_band || "",
      weight: body.weight || null,
      height: body.height || null,
      bmi: body.bmi || null,

      protein_g: body.protein_g || null,
      carbs_g: body.carbs_g || null,
      fat_g: body.fat_g || null,
      sugar_g: body.sugar_g || null,
      fibre_g: body.fibre_g || null,

      health_score: body.health_score || null,
      weight_loss_friendly: body.weight_loss_friendly || "",
      diabetes_friendly: body.diabetes_friendly || "",
      risk_flag: body.risk_flag || "",
    };

    const { data, error } = await supabase
      .from("calgpt_meal_scans")
      .insert([insertPayload])
      .select();

    if (error) {
      console.error("SUPABASE INSERT ERROR:", error);

      return NextResponse.json(
        {
          success: false,
          error,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (err: any) {
    console.error("SERVER ERROR:", err);

    return NextResponse.json(
      {
        success: false,
        error: {
          message: err.message,
          details: err.stack,
        },
      },
      { status: 500 }
    );
  }
}
