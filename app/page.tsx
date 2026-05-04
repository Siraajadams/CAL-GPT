async function submitImageForAI() {
  try {
    if (!mealForm.imageBase64) {
      alert("Please upload or take a photo first.");
      return;
    }

    setAiStatus("Analyzing your meal with AI...");

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        image: mealForm.imageBase64,
        notes: mealForm.notes,
      }),
    });

    if (!res.ok) {
      throw new Error(`API error: ${res.status}`);
    }

    const data = await res.json();

    console.log("AI RESPONSE:", data);

    // ✅ HANDLE FAILED RESPONSE CLEANLY
    if (
      !data ||
      data.description === "Image analysis failed" ||
      !data.description
    ) {
      setMealForm((prev) => ({
        ...prev,
        notes: "AI could not analyze image",
        calories: String(prev.calories || 520),
        foodGroups: ["Needs AI image interpretation"],
      }));

      setAiStatus(
        `⚠️ AI failed: ${data?.recommendations || "Check API or image format"}`
      );
      return;
    }

    // ✅ SUCCESS RESPONSE
    setMealForm((prev) => ({
      ...prev,
      calories: String(data.calories || prev.calories || 520),
      notes: data.description,
      foodGroups:
        data.foodGroups && data.foodGroups.length
          ? data.foodGroups
          : ["Carbohydrate", "Protein / meat", "Vegetables"],
    }));

    setAiStatus(
      data.recommendations
        ? `✅ ${data.recommendations}`
        : "✅ AI analysis complete. Review your meal."
    );
  } catch (error: any) {
    console.error("FRONTEND ERROR:", error);

    setMealForm((prev) => ({
      ...prev,
      notes: "AI request failed",
      foodGroups: ["Needs AI image interpretation"],
    }));

    setAiStatus(
      `❌ Error: ${error?.message || "Something went wrong"}`
    );
  }
}
