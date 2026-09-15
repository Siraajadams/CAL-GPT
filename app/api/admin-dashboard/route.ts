import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const supabaseUrl =
      process.env.NEXT_PUBLIC_SUPABASE_URL;

    const serviceRoleKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl) {
      return NextResponse.json(
        {
          success: false,
          error:
            "NEXT_PUBLIC_SUPABASE_URL is missing in Vercel.",
        },
        { status: 500 }
      );
    }

    if (!serviceRoleKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            "SUPABASE_SERVICE_ROLE_KEY is missing in Vercel.",
        },
        { status: 500 }
      );
    }

    const supabase = createClient(
      supabaseUrl,
      serviceRoleKey,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      }
    );

    const [
      profilesResult,
      mealsResult,
    ] = await Promise.all([
      supabase
        .from("calgpt_profiles")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),

      supabase
        .from("calgpt_meal_scans")
        .select("*")
        .order("created_at", {
          ascending: false,
        }),
    ]);

    if (profilesResult.error) {
      console.error(
        "CALGPT PROFILE ERROR:",
        profilesResult.error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            profilesResult.error.message,
          source: "calgpt_profiles",
        },
        { status: 500 }
      );
    }

    if (mealsResult.error) {
      console.error(
        "CALGPT MEAL ERROR:",
        mealsResult.error
      );

      return NextResponse.json(
        {
          success: false,
          error:
            mealsResult.error.message,
          source: "calgpt_meal_scans",
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,

      users:
        profilesResult.data || [],

      meals:
        mealsResult.data || [],

      counts: {
        users:
          profilesResult.data?.length ||
          0,

        meals:
          mealsResult.data?.length ||
          0,
      },
    });
  } catch (error: any) {
    console.error(
      "CALGPT ADMIN API ERROR:",
      error
    );

    return NextResponse.json(
      {
        success: false,
        error:
          error?.message ||
          "Unexpected server error",
      },
      { status: 500 }
    );
  }
}
