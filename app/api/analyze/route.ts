export async function POST(req: Request) {
  try {
    const { notes } = await req.json();

    const text = String(notes || "").toLowerCase();

    const foodGroups: string[] = [];

    if (/(rice|bread|pasta|potato|pap|chips|oats|cereal)/.test(text)) {
      foodGroups.push("Carbohydrate");
    }

    if (/(chicken|meat|beef|fish|egg|tuna|steak|lamb|beans|lentils)/.test(text)) {
      foodGroups.push("Protein / meat");
    }

    if (/(vegetable|salad|broccoli|spinach|carrot|tomato|lettuce|greens)/.test(text)) {
      foodGroups.push("Vegetables");
    }

    if (/(cake|sweet|chocolate|dessert|sugar|juice|soda|cooldrink)/.test(text)) {
      foodGroups.push("Sugar / dessert");
    }

    return Response.json({
      description: notes || "Meal image uploaded",
      calories: 520,
      foodGroups: foodGroups.length ? foodGroups : ["Needs AI image interpretation"],
    });
  } catch {
    return Response.json(
      { error: "Could not analyse image" },
      { status: 500 }
    );
  }
}
