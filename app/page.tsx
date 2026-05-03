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
    setImage(URL.createObjectURL(file));
    setAnalysis(null);
  }

  function assessMeal() {
    setAnalysis({
      meal: "Estimated meal",
      calories: 520,
      protein: "32g",
      carbs: "48g",
      fat: "18g",
      recommendation:
        "Balanced meal. For weight loss, reduce starch slightly and add more vegetables.",
    });
  }

  return (
    <main className="page">
      <section className="hero">
        <div className="brandCard">
          <h1>
            Cal<span>GPT</span>
          </h1>
          <p>
            Track <b>Smarter.</b> Eat <b>Better.</b> Live <b>Healthier.</b>
          </p>
        </div>

        <div className="panel">
          <div className="badge">ABOUT CALGPT</div>
          <h2>Your AI-powered calorie tracking assistant</h2>
          <p>
            Create your profile, take a meal photo, and receive an estimated
            calorie and nutrition assessment.
          </p>
        </div>
      </section>

      <section className="scanner">
        <div className="card dark">
          <h2>Create Profile</h2>

          <input
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <select value={goal} onChange={(e) => setGoal(e.target.value)}>
            <option>Weight loss</option>
            <option>Maintain weight</option>
            <option>Muscle gain</option>
            <option>Diabetes-friendly eating</option>
          </select>

          <p>
            Profile: <b>{name || "Guest"}</b>
            <br />
            Goal: <b>{goal}</b>
          </p>
        </div>

        <div className="card">
          <h2>Meal Scanner</h2>
          <p>Take or upload a food photo.</p>

          <input type="file" accept="image/*" capture="environment" onChange={handleImage} />

          {image && <img src={image} alt="Meal preview" className="preview" />}

          {image && <button onClick={assessMeal}>Assess Calories</button>}

          {analysis && (
            <div className="result">
              <h3>AI Meal Assessment</h3>
              <h1>{analysis.calories} kcal</h1>
              <p><b>Meal:</b> {analysis.meal}</p>
              <p><b>Protein:</b> {analysis.protein}</p>
              <p><b>Carbs:</b> {analysis.carbs}</p>
              <p><b>Fat:</b> {analysis.fat}</p>
              <p><b>Recommendation:</b> {analysis.recommendation}</p>
            </div>
          )}
        </div>
      </section>

      <style jsx>{`
        .page {
          min-height: 100vh;
          background: #f9fafb;
          color: #111827;
          font-family: Arial, sans-serif;
          padding: 24px;
        }

        .hero,
        .scanner {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 28px;
          max-width: 1200px;
          margin: 0 auto 32px;
          align-items: stretch;
        }

        .brandCard {
          background: #071118;
          color: white;
          border-radius: 28px;
          padding: 48px;
        }

        .brandCard h1 {
          font-size: 64px;
          margin: 0;
        }

        .brandCard span,
        .brandCard b {
          color: #22c55e;
        }

        .brandCard p {
          font-size: 24px;
        }

        .panel,
        .card {
          background: white;
          border-radius: 28px;
          padding: 36px;
          box-shadow: 0 18px 40px rgba(0,0,0,0.08);
        }

        .badge {
          display: inline-block;
          background: #22c55e;
          color: white;
          padding: 10px 18px;
          border-radius: 999px;
          font-weight: bold;
          font-size: 14px;
        }

        h2 {
          font-size: 38px;
          margin: 20px 0 12px;
        }

        p {
          font-size: 18px;
          line-height: 1.6;
        }

        .dark {
          background: #071118;
          color: white;
        }

        input,
        select {
          width: 100%;
          padding: 14px;
          margin-top: 14px;
          border-radius: 14px;
          border: 1px solid #ddd;
          font-size: 16px;
        }

        button {
          width: 100%;
          margin-top: 18px;
          background: #22c55e;
          color: white;
          border: none;
          border-radius: 999px;
          padding: 16px;
          font-size: 16px;
          font-weight: bold;
        }

        .preview {
          width: 100%;
          max-height: 300px;
          object-fit: cover;
          border-radius: 20px;
          margin-top: 18px;
        }

        .result {
          margin-top: 20px;
          background: #ecfdf5;
          padding: 22px;
          border-radius: 20px;
        }

        .result h1 {
          color: #22c55e;
        }

        @media (max-width: 768px) {
          .page {
            padding: 16px;
          }

          .hero,
          .scanner {
            grid-template-columns: 1fr;
          }

          .brandCard,
          .panel,
          .card {
            padding: 24px;
            border-radius: 22px;
          }

          .brandCard h1 {
            font-size: 44px;
          }

          .brandCard p {
            font-size: 19px;
          }

          h2 {
            font-size: 30px;
          }

          p {
            font-size: 16px;
          }
        }
      `}</style>
    </main>
  );
}
