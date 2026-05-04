const submitImageForAI = async () => {
  try {
    setAiStatus("Submitting image to OpenAI...");

    const res = await fetch("/api/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: mealForm.imageBase64,
        notes: mealForm.notes,
      }),
    });

    const data = await res.json();

    // ❌ If OpenAI failed — SHOW REAL ERROR
    if (data.description === "Image analysis failed") {
      setAiStatus(`OpenAI error: ${data.recommendations}`);
      return;
    }

    // ✅ Update UI
    setMealForm((p) => ({
      ...p,
      calories: String(data.calories || p.calories),
      notes: data.description || p.notes,
      foodGroups: data.foodGroups || [],
    }));

    setAiStatus(
      data.recommendations
        ? `Analysis complete: ${data.recommendations}`
        : "Analysis complete"
    );
  } catch (error: any) {
    setAiStatus(
      `OpenAI error: ${error?.message || "Unknown error"}`
    );
  }
};
