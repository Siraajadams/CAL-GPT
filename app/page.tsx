"use client";

import { useMemo, useState } from "react";

type MealRecord = {
  id: number;
  image: string;
  dateTime: string;
  calories: number;
  meal: string;
  protein: string;
  carbs: string;
  fat: string;
};

export default function Home() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [email, setEmail] = useState("");

  const [profile, setProfile] = useState({
    name: "",
    age: "",
    gender: "",
    weight: "",
    height: "",
    activity: "",
    goal: "Weight loss",
    conditions: "",
    medication: "",
    allergies: "",
    exerciseHistory: "",
    eatingHabits: "",
    sleep: "",
    water: "",
  });

  const [image, setImage] = useState<string | null>(null);
  const [records, setRecords] = useState<MealRecord[]>([]);

  const bmi = useMemo(() => {
    const w = Number(profile.weight);
    const h = Number(profile.height) / 100;
    if (!w || !h) return null;
    return (w / (h * h)).toFixed(1);
  }, [profile.weight, profile.height]);

  function updateProfile(field: string, value: string) {
    setProfile({ ...profile, [field]: value });
  }

  function handleImage(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImage(URL.createObjectURL(file));
  }

  function assessMeal() {
    if (!image) return;

    const newRecord: MealRecord = {
      id: Date.now(),
      image,
      dateTime: new Date().toLocaleString(),
      calories: 520,
      meal: "Estimated meal",
      protein: "32g",
      carbs: "48g",
      fat: "18g",
    };

    setRecords([newRecord, ...records]);
    setImage(null);
  }

  const totalCalories = records.reduce((sum, item) => sum + item.calories, 0);

  if (!loggedIn) {
    return (
      <main className="page loginPage">
        <section className="loginCard">
          <h1>
            Cal<span>GPT</span>
          </h1>
          <p>Your AI-powered calorie and health tracking assistant.</p>

          <input
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button onClick={() => setLoggedIn(true)}>Login / Register</button>

          <small>
            Prototype login only. Real authentication can be added with Supabase
            or Firebase.
          </small>
        </section>

        <style jsx>{styles}</style>
      </main>
    );
  }

  return (
    <main className="page">
      <header className="topbar">
        <div>
          <h1>
            Cal<span>GPT</span>
          </h1>
          <p>Welcome, {profile.name || email}</p>
        </div>

        <button className="logout" onClick={() => setLoggedIn(false)}>
          Logout
        </button>
      </header>

      <section className="grid">
        <div className="card dark">
          <h2>Health Profile</h2>

          <input
            placeholder="Full name"
            value={profile.name}
            onChange={(e) => updateProfile("name", e.target.value)}
          />

          <input
            placeholder="Age"
            type="number"
            value={profile.age}
            onChange={(e) => updateProfile("age", e.target.value)}
          />

          <select
            value={profile.gender}
            onChange={(e) => updateProfile("gender", e.target.value)}
          >
            <option value="">Gender</option>
            <option>Female</option>
            <option>Male</option>
            <option>Other</option>
          </select>

          <input
            placeholder="Weight in kg"
            type="number"
            value={profile.weight}
            onChange={(e) => updateProfile("weight", e.target.value)}
          />

          <input
            placeholder="Height in cm"
            type="number"
            value={profile.height}
            onChange={(e) => updateProfile("height", e.target.value)}
          />

          <select
            value={profile.goal}
            onChange={(e) => updateProfile("goal", e.target.value)}
          >
            <option>Weight loss</option>
            <option>Maintain weight</option>
            <option>Muscle gain</option>
            <option>Diabetes-friendly eating</option>
            <option>Heart healthy eating</option>
          </select>

          <select
            value={profile.activity}
            onChange={(e) => updateProfile("activity", e.target.value)}
          >
            <option value="">Activity level</option>
            <option>Sedentary</option>
            <option>Light exercise 1–2 days/week</option>
            <option>Moderate exercise 3–4 days/week</option>
            <option>High activity 5+ days/week</option>
          </select>

          <div className="bmiBox">
            <p>BMI</p>
            <h3>{bmi || "--"}</h3>
            <small>
              {bmi
                ? Number(bmi) < 18.5
                  ? "Underweight"
                  : Number(bmi) < 25
                  ? "Healthy range"
                  : Number(bmi) < 30
                  ? "Overweight"
                  : "Obese range"
                : "Enter weight and height"}
            </small>
          </div>
        </div>

        <div className="card">
          <h2>Health Assessment</h2>

          <textarea
            placeholder="Medical conditions e.g. diabetes, hypertension, cholesterol"
            value={profile.conditions}
            onChange={(e) => updateProfile("conditions", e.target.value)}
          />

          <textarea
            placeholder="Current medication"
            value={profile.medication}
            onChange={(e) => updateProfile("medication", e.target.value)}
          />

          <textarea
            placeholder="Food allergies or intolerances"
            value={profile.allergies}
            onChange={(e) => updateProfile("allergies", e.target.value)}
          />

          <textarea
            placeholder="Exercise history"
            value={profile.exerciseHistory}
            onChange={(e) => updateProfile("exerciseHistory", e.target.value)}
          />

          <textarea
            placeholder="Eating habits e.g. snacking, sugar drinks, takeaways"
            value={profile.eatingHabits}
            onChange={(e) => updateProfile("eatingHabits", e.target.value)}
          />

          <input
            placeholder="Average sleep hours per night"
            value={profile.sleep}
            onChange={(e) => updateProfile("sleep", e.target.value)}
          />

          <input
            placeholder="Water intake per day"
            value={profile.water}
            onChange={(e) => updateProfile("water", e.target.value)}
          />
        </div>
      </section>

      <section className="grid">
        <div className="card">
          <h2>Meal Photo Scanner</h2>
          <p>Take or upload a food photo. Each record stores date and time.</p>

          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImage}
          />

          {image && <img src={image} className="preview" alt="Meal preview" />}

          <button onClick={assessMeal}>Assess Calories</button>
        </div>

        <div className="card summary">
          <h2>Today’s Calories</h2>
          <h1>{totalCalories} kcal</h1>
          <p>{records.length} meal records logged</p>

          <div className="insight">
            <b>AI Insight:</b>
            <br />
            {records.length === 0
              ? "Upload your first meal to start tracking."
              : "Your meals are being recorded. Next step is real AI image analysis using OpenAI Vision API."}
          </div>
        </div>
      </section>

      <section className="card">
        <h2>Meal Records</h2>

        {records.length === 0 && <p>No meals logged yet.</p>}

        <div className="records">
          {records.map((record) => (
            <div className="record" key={record.id}>
              <img src={record.image} alt="Meal" />
              <div>
                <h3>{record.meal}</h3>
                <p>{record.dateTime}</p>
                <p>
                  <b>{record.calories} kcal</b> · Protein {record.protein} ·
                  Carbs {record.carbs} · Fat {record.fat}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <style jsx>{styles}</style>
    </main>
  );
}

const styles = `
  .page {
    min-height: 100vh;
    background: #f9fafb;
    color: #111827;
    font-family: Arial, sans-serif;
    padding: 20px;
  }

  .loginPage {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .loginCard {
    width: 100%;
    max-width: 420px;
    background: #071118;
    color: white;
    padding: 34px;
    border-radius: 28px;
  }

  h1 {
    font-size: 42px;
    margin: 0;
  }

  h1 span, .summary h1 {
    color: #22c55e;
  }

  .topbar {
    max-width: 1200px;
    margin: 0 auto 24px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .grid {
    max-width: 1200px;
    margin: 0 auto 24px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24px;
  }

  .card {
    background: white;
    padding: 28px;
    border-radius: 28px;
    box-shadow: 0 18px 40px rgba(0,0,0,0.08);
  }

  .dark {
    background: #071118;
    color: white;
  }

  input, select, textarea {
    width: 100%;
    box-sizing: border-box;
    padding: 14px;
    margin-top: 12px;
    border-radius: 14px;
    border: 1px solid #ddd;
    font-size: 15px;
  }

  textarea {
    min-height: 75px;
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

  .logout {
    width: auto;
    padding: 12px 20px;
  }

  .bmiBox, .insight {
    margin-top: 18px;
    background: #ecfdf5;
    color: #111827;
    padding: 18px;
    border-radius: 18px;
  }

  .bmiBox h3 {
    font-size: 36px;
    color: #22c55e;
    margin: 0;
  }

  .preview {
    width: 100%;
    max-height: 320px;
    object-fit: cover;
    border-radius: 20px;
    margin-top: 18px;
  }

  .records {
    display: grid;
    gap: 16px;
  }

  .record {
    display: flex;
    gap: 16px;
    border: 1px solid #e5e7eb;
    padding: 14px;
    border-radius: 18px;
  }

  .record img {
    width: 100px;
    height: 100px;
    border-radius: 14px;
    object-fit: cover;
  }

  @media (max-width: 768px) {
    .page {
      padding: 14px;
    }

    .topbar {
      display: block;
    }

    .grid {
      grid-template-columns: 1fr;
    }

    .card, .loginCard {
      padding: 22px;
      border-radius: 22px;
    }

    h1 {
      font-size: 34px;
    }

    h2 {
      font-size: 25px;
    }

    .record {
      flex-direction: column;
    }

    .record img {
      width: 100%;
      height: 220px;
    }
  }
`;
