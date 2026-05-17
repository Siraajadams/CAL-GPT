import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { data, error } = await supabase
      .from("calgpt_meal_scans")
      .insert([body])
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
