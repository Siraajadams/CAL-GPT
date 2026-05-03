"use client";

import { useState } from "react";

export default function Home() {
  const [name, setName] = useState("");
  const [goal, setGoal] = useState("Weight loss");
  const [image, setImage] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<any>(null);

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const imageUrl = URL.createObjectURL(file);
    setImage(imageUrl);
    setAnalysis(null);
  }

  function assessMeal() {
    setAnalysis({
      meal: "Estimated mixed meal",
      calories: 520,
      protein: "32g",
      carbs: "48g",
      fat: "18g",
      recommendation:
        "Good balanced meal. For weight loss, reduce starch portion slightly and add more vegetables.",
    });
  }

  return (
    <main style={{
      minHeight: "100vh",
      background: "#F9FAFB",
      fontFamily: "Arial, sans-serif",
      color: "#111827",
      padding: 30
    }}>
      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 30,
        alignItems: "start"
      }}>
        <div style={{
          background: "#071118",
          color: "white",
          borderRadius: 28,
          padding: 40
        }}>
          <h1 style={{ fontSize: 56 }}>
            Cal<span style={{ color: "#22C55E" }}>GPT</span>
          </h1>

          <p style={{ fontSize: 24 }}>
            Track <span style={{ color: "#22C55E" }}>Smarter.</span> Eat{" "}
            <span style={{ color: "#22C55E" }}>Better.</span> Live{" "}
            <span style={{ color: "#22C55E" }}>Healthier.</span>
          </p>

          <hr style={{ margin: "30px 0", opacity: 0.2 }} />

          <h2>Create Profile</h2>

          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            style={inputStyle}
          />

          <select
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            style={inputStyle}
          >
            <option>Weight loss</option>
            <option>Muscle gain</option>
            <option>Maintain weight</option>
            <option>Diabetes-friendly eating</option>
          </select>

          <p style={{ color: "#86EFAC" }}>
            Profile: {name || "Guest"} · Goal: {goal}
          </p>
        </div>

        <div style={{
          background: "white",
          borderRadius: 28,
          padding: 35,
          boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
        }}>
          <span style={{
            background: "#22C55E",
            color: "white",
            padding: "10px 18px",
            borderRadius: 999,
            fontWeight: 700
          }}>
            MEAL SCANNER
          </span>

          <h2 style={{ fontSize: 38 }}>
            Take a picture of your meal
          </h2>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImage}
            style={{ margin: "20px 0" }}
          />

          {image && (
            <>
              <img
                src={image}
                alt="Meal preview"
                style={{
                  width: "100%",
                  maxHeight: 320,
                  objectFit: "cover",
                  borderRadius: 20,
                  marginTop: 15
                }}
              />

              <button onClick={assessMeal} style={buttonStyle}>
                Assess Calories
              </button>
            </>
          )}

          {analysis && (
            <div style={{
              marginTop: 25,
              background: "#ECFDF5",
              borderRadius: 20,
              padding: 25
            }}>
              <h3>AI Meal Assessment</h3>
              <h1 style={{ color: "#22C55E" }}>{analysis.calories} kcal</h1>
              <p><strong>Meal:</strong> {analysis.meal}</p>
              <p><strong>Protein:</strong> {analysis.protein}</p>
              <p><strong>Carbs:</strong> {analysis.carbs}</p>
              <p><strong>Fat:</strong> {analysis.fat}</p>
              <p><strong>Recommendation:</strong> {analysis.recommendation}</p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

const inputStyle = {
  width: "100%",
  padding: 14,
  marginTop: 14,
  borderRadius: 12,
  border: "1px solid #ddd",
  fontSize: 16,
};

const buttonStyle = {
  marginTop: 20,
  background: "#22C55E",
  color: "white",
  border: "none",
  borderRadius: 999,
  padding: "14px 24px",
  fontSize: 16,
  fontWeight: 700,
  cursor: "pointer",
};
