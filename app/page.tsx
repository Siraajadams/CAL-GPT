'use client';

import React, { useEffect, useMemo, useState } from "react";

const countries = [
  { name: "South Africa", code: "+27" },
  { name: "United Kingdom", code: "+44" },
  { name: "United States", code: "+1" },
  { name: "United Arab Emirates", code: "+971" },
  { name: "Namibia", code: "+264" },
  { name: "Zimbabwe", code: "+263" },
  { name: "Ghana", code: "+233" },
];

const allergyOptions = [
  "None",
  "Penicillin",
  "Sulfa medicines",
  "Aspirin / NSAIDs",
  "Peanuts",
  "Tree nuts",
  "Shellfish",
  "Fish",
  "Eggs",
  "Milk / lactose",
  "Wheat / gluten",
  "Soy",
  "Other",
];

const exerciseOptions = [
  "No regular exercise",
  "Walking 1-2 days per week",
  "Walking 3-5 days per week",
  "Gym / strength training",
  "Cardio training",
  "Sport participation",
  "Physically active at work",
  "Limited by injury or illness",
];

const eatingHabitOptions = [
  "Balanced meals most days",
  "High sugar / sweet cravings",
  "High refined carbohydrates",
  "Large portions",
  "Frequent snacking",
  "Emotional eating",
  "Late-night eating",
  "Fast food often",
  "Low vegetable intake",
  "Irregular meal times",
];

const defaultProfile = {
  fullName: "",
  dob: "",
  age: "",
  gender: "Male",
  email: "",
  password: "",
  confirmPassword: "",
  country: "South Africa",
  dialCode: "+27",
  mobile: "",
  address: "",
  weight: "",
  height: "",
  goal: "Weight loss",
  activity: "Sedentary",
  conditions: "",
  medications: "",
  allergies: "None",
  exerciseHistory: "No regular exercise",
  eatingHabits: "Balanced meals most days",
  waterIntake: "",
  consent: false,
};

function calcAge(dob: string) {
  if (!dob) return "";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 ? String(age) : "";
}

function calcBMI(weight: string | number, height: string | number) {
  const w = Number(weight);
  const h = Number(height) / 100;
  if (!w || !h) return "";
  return (w / (h * h)).toFixed(1);
}

function bmiLabel(bmi: string) {
  const n = Number(bmi);
  if (!n) return "Not calculated";
  if (n < 18.5) return "Underweight range";
  if (n < 25) return "Healthy range";
  if (n < 30) return "Overweight range";
  return "Obese range";
}

function estimateFoodGroups(notes: string) {
  const text = notes.toLowerCase();
  const groups: string[] = [];
  const carbs = ["rice", "pasta", "bread", "potato", "chips", "pap", "oats", "cereal", "noodle", "roti"];
  const proteins = ["chicken", "beef", "meat", "fish", "egg", "tuna", "steak", "lamb", "pork", "beans", "lentils"];
  const veg = ["salad", "vegetable", "broccoli", "spinach", "cabbage", "carrot", "tomato", "lettuce", "greens"];
  const sugar = ["cake", "sweet", "chocolate", "dessert", "sugar", "juice", "soda", "cooldrink", "biscuit"];
  const fats = ["cheese", "butter", "oil", "avocado", "mayo", "cream", "nuts"];
  if (carbs.some((x) => text.includes(x))) groups.push("Carbohydrate");
  if (proteins.some((x) => text.includes(x))) groups.push("Protein / meat");
  if (veg.some((x) => text.includes(x))) groups.push("Vegetables");
  if (sugar.some((x) => text.includes(x))) groups.push("Sugar / dessert");
  if (fats.some((x) => text.includes(x))) groups.push("Fat / oils");
  return groups.length ? groups : ["Needs AI image interpretation"];
}

export default function Page() {
  const [screen, setScreen] = useState("landing");
  const [profile, setProfile] = useState<any>(defaultProfile);
  const [meals, setMeals] = useState<any[]>([]);
  const [weights, setWeights] = useState<any[]>([]);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [mealForm, setMealForm] = useState({
    category: "Lunch",
    calories: "520",
    notes: "Chicken, rice and vegetables",
    image: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("calgpt_ehr");
    if (saved) {
      const data = JSON.parse(saved);
      setProfile(data.profile || defaultProfile);
      setMeals(data.meals || []);
      setWeights(data.weights || []);
      setScreen("dashboard");
    }
  }, []);

  useEffect(() => {
    const selected = countries.find((c) => c.name === profile.country);
    if (selected) {
      setProfile((p: any) => ({ ...p, dialCode: selected.code, age: calcAge(p.dob) }));
    }
  }, [profile.country, profile.dob]);

  const bmi = useMemo(() => calcBMI(profile.weight, profile.height), [profile.weight, profile.height]);
  const today = new Date().toISOString().slice(0, 10);
  const todayMeals = meals.filter((m) => m.date === today);
  const todayCalories = todayMeals.reduce((s, m) => s + Number(m.calories || 0), 0);
  const totalCalories = meals.reduce((s, m) => s + Number(m.calories || 0), 0);
  const avgDaily = meals.length ? Math.round(totalCalories / Math.max(1, new Set(meals.map((m) => m.date)).size)) : 0;
  const latestBMI = calcBMI(profile.weight, profile.height);

  function saveEHR(nextProfile = profile, nextMeals = meals, nextWeights = weights) {
    localStorage.setItem("calgpt_ehr", JSON.stringify({ profile: nextProfile, meals: nextMeals, weights: nextWeights }));
  }

  function submitEnrollment() {
    if (!profile.fullName || !profile.email || !profile.password || !profile.dob || !profile.mobile || !profile.consent) {
      alert("Please complete name, DOB, email, password, mobile and consent.");
      return;
    }
    if (profile.password !== profile.confirmPassword) {
      alert("Passwords do not match.");
      return;
    }
    const nextProfile = { ...profile, age: calcAge(profile.dob), bmi, createdAt: new Date().toISOString() };
    const firstWeight = [{ date: today, weight: Number(profile.weight || 0), bmi: Number(calcBMI(profile.weight, profile.height) || 0) }];
    setProfile(nextProfile);
    setWeights(firstWeight);
    saveEHR(nextProfile, meals, firstWeight);
    setScreen("dashboard");
  }

  function loginUser() {
    const saved = JSON.parse(localStorage.getItem("calgpt_ehr") || "null");
    if (saved?.profile?.email === login.email && saved?.profile?.password === login.password) {
      setProfile(saved.profile);
      setMeals(saved.meals || []);
      setWeights(saved.weights || []);
      setScreen("dashboard");
    } else alert("Login failed. Please check your email and password.");
  }

  function addMeal() {
    const foodGroups = estimateFoodGroups(mealForm.notes);
    const record = {
      id: Date.now(),
      date: today,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: mealForm.category,
      calories: Number(mealForm.calories || 0),
      notes: mealForm.notes,
      image: mealForm.image,
      foodGroups,
    };
    const nextMeals = [record, ...meals];
    setMeals(nextMeals);
    saveEHR(profile, nextMeals, weights);
  }

  function updateWeight() {
    const newWeight = prompt("Enter new weight in kg");
    if (!newWeight) return;
    const nextProfile = { ...profile, weight: newWeight };
    const nextWeights = [...weights, { date: today, weight: Number(newWeight), bmi: Number(calcBMI(newWeight, profile.height) || 0) }];
    setWeights(nextWeights);
    setProfile(nextProfile);
    saveEHR(nextProfile, meals, nextWeights);
  }

  const mealPlan = [
    { meal: "Breakfast", food: "Greek yoghurt, berries and oats", portion: "1 cup yoghurt + ½ cup berries + ¼ cup oats", kcal: 380 },
    { meal: "Lunch", food: "Chicken salad bowl", portion: "1 palm protein + 2 fists salad + 1 thumb olive oil", kcal: 520 },
    { meal: "Dinner", food: "Fish, vegetables and small starch", portion: "1 palm fish + 2 fists vegetables + ½ fist rice", kcal: 560 },
    { meal: "Snack", food: "Apple with peanut butter", portion: "1 apple + 1 tablespoon peanut butter", kcal: 210 },
  ];

  const inputStyle: React.CSSProperties = { width: "100%", padding: 16, borderRadius: 18, border: "1px solid #ddd", fontSize: 16, marginTop: 6 };
  const cardStyle: React.CSSProperties = { background: "white", borderRadius: 28, padding: 22, marginBottom: 18, boxShadow: "0 10px 30px rgba(0,0,0,0.06)" };
  const buttonStyle: React.CSSProperties = { width: "100%", padding: 17, borderRadius: 999, border: "none", background: "#22c55e", color: "white", fontSize: 17, fontWeight: 800, cursor: "pointer" };
  const labelStyle: React.CSSProperties = { display: "block", fontWeight: 700, color: "#334155", marginBottom: 14 };

  const navButton = (name: string, label: string) => (
    <button onClick={() => setScreen(name)} style={{ border: "none", borderRadius: 16, padding: 10, fontSize: 12, fontWeight: 800, color: screen === name ? "#047857" : "#64748b", background: screen === name ? "#d1fae5" : "transparent" }}>{label}</button>
  );

  const simpleGraph = (data: any[], key: string, color: string) => {
    const clean = data.filter((d) => Number(d[key]) > 0);
    if (clean.length < 1) return <p>No tracking data yet.</p>;
    const max = Math.max(...clean.map((d) => Number(d[key])));
    return <div style={{ display: "flex", alignItems: "end", gap: 8, height: 130, paddingTop: 10 }}>{clean.map((d, i) => <div key={i} style={{ flex: 1, textAlign: "center" }}><div style={{ height: Math.max(12, (Number(d[key]) / max) * 110), background: color, borderRadius: 10 }} /><small>{d[key]}</small></div>)}</div>;
  };

  return (
    <main style={{ minHeight: "100vh", background: "#f1f5f9", color: "#0f172a", fontFamily: "Arial, sans-serif" }}>
      <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 90 }}>
        {screen === "landing" && (
          <section style={{ minHeight: "100vh", background: "#061115", padding: 24, color: "white" }}>
            <h1 style={{ fontSize: 42, marginBottom: 8 }}>CalGPT</h1>
            <p style={{ color: "#bbf7d0" }}>AI nutrition EHR and calorie tracker</p>
            <div style={{ ...cardStyle, background: "rgba(255,255,255,0.08)", color: "white" }}>
              <h2 style={{ fontSize: 34, lineHeight: 1.1 }}>Personal calorie tracking with health records.</h2>
              <p style={{ color: "#e2e8f0", marginTop: 16 }}>Capture meals, track BMI, create a patient EHR, generate monthly reports and receive meal plans with portion guidance.</p>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 24 }}>
                <div style={{ background: "white", color: "#0f172a", borderRadius: 18, padding: 14, textAlign: "center" }}>📸<br />Food AI</div>
                <div style={{ background: "white", color: "#0f172a", borderRadius: 18, padding: 14, textAlign: "center" }}>❤️<br />EHR</div>
                <div style={{ background: "white", color: "#0f172a", borderRadius: 18, padding: 14, textAlign: "center" }}>📊<br />Reports</div>
              </div>
              <button style={{ ...buttonStyle, marginTop: 28 }} onClick={() => setScreen("enroll")}>First-time enrolment</button>
              <button style={{ ...buttonStyle, marginTop: 12, background: "transparent", border: "1px solid white" }} onClick={() => setScreen("login")}>Login</button>
            </div>
            <div style={{ ...cardStyle, background: "white", color: "#0f172a" }}>
              <h2>About us</h2>
              <p>CalGPT was built for people struggling to fight the food noise, trying to eat healthier, and hopefully lose weight in a practical and supportive way. It was developed by a team of doctors and pharmacists to create a clinical wellness tool for patients who want to improve their health, reduce diabetes and cholesterol risk, and build better daily habits through meal tracking, weight monitoring and structured nutrition support.</p>
            </div>
          </section>
        )}

        {screen === "login" && (
          <section style={{ padding: 24 }}><h1 style={{ fontSize: 38 }}>Login</h1><p>Access your saved CalGPT EHR.</p><div style={cardStyle}><label style={labelStyle}>Email<input style={inputStyle} value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} /></label><label style={labelStyle}>Password<input style={inputStyle} type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} /></label><button style={buttonStyle} onClick={loginUser}>Login</button></div></section>
        )}

        {screen === "enroll" && (
          <section style={{ padding: 20 }}><h1 style={{ fontSize: 36 }}>First-time enrolment</h1><p>Create your patient profile and EHR.</p><div style={cardStyle}>
            <label style={labelStyle}>Full name<input style={inputStyle} value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} /></label>
            <label style={labelStyle}>Date of birth<input style={inputStyle} type="date" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} /></label>
            <label style={labelStyle}>Age<input style={inputStyle} value={calcAge(profile.dob)} readOnly /></label>
            <label style={labelStyle}>Gender<select style={inputStyle} value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}><option>Male</option><option>Female</option><option>Other</option></select></label>
            <label style={labelStyle}>Email<input style={inputStyle} value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
            <label style={labelStyle}>Country<select style={inputStyle} value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })}>{countries.map((c) => <option key={c.name}>{c.name}</option>)}</select></label>
            <label style={labelStyle}>Dialling code<input style={inputStyle} value={profile.dialCode} readOnly /></label>
            <label style={labelStyle}>Mobile number<input style={inputStyle} value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} /></label>
            <label style={labelStyle}>Address<input style={inputStyle} value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} /></label>
            <label style={labelStyle}>Weight kg<input style={inputStyle} value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} /></label>
            <label style={labelStyle}>Height cm<input style={inputStyle} value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} /></label>
            <div style={{ background: "#ecfdf5", borderRadius: 22, padding: 20, marginBottom: 18 }}><p style={{ fontWeight: 800 }}>BMI</p><p style={{ fontSize: 48, fontWeight: 900, color: "#22c55e", margin: 0 }}>{bmi || "--"}</p><p>{bmiLabel(bmi)}</p></div>
            <label style={labelStyle}>Goal<select style={inputStyle} value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })}><option>Weight loss</option><option>Maintain weight</option><option>Muscle gain</option><option>Medical nutrition support</option></select></label>
            <label style={labelStyle}>Activity level<select style={inputStyle} value={profile.activity} onChange={(e) => setProfile({ ...profile, activity: e.target.value })}><option>Sedentary</option><option>Light</option><option>Moderate</option><option>Active</option></select></label>
            <label style={labelStyle}>Allergies<select style={inputStyle} value={profile.allergies} onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}>{allergyOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label style={labelStyle}>Exercise history<select style={inputStyle} value={profile.exerciseHistory} onChange={(e) => setProfile({ ...profile, exerciseHistory: e.target.value })}>{exerciseOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label style={labelStyle}>Eating habits<select style={inputStyle} value={profile.eatingHabits} onChange={(e) => setProfile({ ...profile, eatingHabits: e.target.value })}>{eatingHabitOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
            <label style={labelStyle}>Medical conditions<input style={inputStyle} value={profile.conditions} onChange={(e) => setProfile({ ...profile, conditions: e.target.value })} /></label>
            <label style={labelStyle}>Current medication<input style={inputStyle} value={profile.medications} onChange={(e) => setProfile({ ...profile, medications: e.target.value })} /></label>
            <label style={labelStyle}>Water intake<input style={inputStyle} value={profile.waterIntake} onChange={(e) => setProfile({ ...profile, waterIntake: e.target.value })} /></label>
            <label style={{ display: "flex", gap: 10, marginBottom: 18 }}><input type="checkbox" checked={profile.consent} onChange={(e) => setProfile({ ...profile, consent: e.target.checked })} />I consent to storing my health profile, meal images and calorie records.</label>
            <label style={labelStyle}>Create password<input style={inputStyle} type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} /></label>
            <label style={labelStyle}>Confirm password<input style={inputStyle} type="password" value={profile.confirmPassword} onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })} /></label>
            <button style={buttonStyle} onClick={submitEnrollment}>Submit enrolment</button>
          </div></section>
        )}

        {screen === "dashboard" && (
          <section style={{ padding: 20 }}><div style={{ ...cardStyle, background: "#061115", color: "white" }}><p style={{ color: "#bbf7d0" }}>Welcome back</p><h1 style={{ fontSize: 36 }}>{profile.fullName || "Patient"}</h1><p>{profile.goal} • BMI {latestBMI || "--"}</p></div><div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}><div style={cardStyle}><p>Today’s Calories</p><h2 style={{ fontSize: 40, color: "#22c55e" }}>{todayCalories}</h2><p>kcal</p></div><div style={cardStyle}><p>Weight</p><h2 style={{ fontSize: 40 }}>{profile.weight || "--"}</h2><p>kg</p></div></div><div style={cardStyle}><h2>Today’s food diary</h2>{todayMeals.length === 0 ? <p>No meals captured today.</p> : todayMeals.map((m) => <div key={m.id} style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}><b>{m.category}</b> • {m.calories} kcal<br /><small>{m.time} • {m.foodGroups?.join(", ")}</small></div>)}</div><div style={{ ...cardStyle, background: "#ecfdf5" }}><h2>AI Insight</h2><p>Your food diary and health profile are being recorded. The next production step is connecting OpenAI Vision API so the uploaded plate image can automatically identify vegetables, meat/protein, carbs, sugar, fats and estimated calories.</p></div></section>
        )}

        {screen === "ehr" && (
          <section style={{ padding: 20 }}><h1 style={{ fontSize: 36 }}>Patient EHR</h1><div style={cardStyle}><b>Name:</b> {profile.fullName}<br /><b>DOB:</b> {profile.dob}<br /><b>Mobile:</b> {profile.dialCode} {profile.mobile}<br /><b>Address:</b> {profile.address}, {profile.country}</div><div style={cardStyle}><b>Conditions:</b> {profile.conditions || "None recorded"}<br /><b>Medication:</b> {profile.medications || "None recorded"}<br /><b>Allergies:</b> {profile.allergies || "None recorded"}<br /><b>Exercise:</b> {profile.exerciseHistory}<br /><b>Eating habits:</b> {profile.eatingHabits}</div><div style={cardStyle}><h2>Weight tracking</h2>{simpleGraph(weights, "weight", "#22c55e")}</div><div style={cardStyle}><h2>BMI tracking</h2>{simpleGraph(weights, "bmi", "#0f172a")}</div><button style={buttonStyle} onClick={updateWeight}>Add weight update</button></section>
        )}

        {screen === "scanner" && (
          <section style={{ padding: 20 }}><h1 style={{ fontSize: 36 }}>Meal Photo Scanner</h1><div style={cardStyle}><label style={labelStyle}>Meal category<select style={inputStyle} value={mealForm.category} onChange={(e) => setMealForm({ ...mealForm, category: e.target.value })}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></select></label><label style={labelStyle}>Estimated calories<input style={inputStyle} value={mealForm.calories} onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })} /></label><label style={labelStyle}>Describe visible food on plate<input style={inputStyle} value={mealForm.notes} onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })} /></label><input type="file" accept="image/*" capture="environment" style={{ ...inputStyle, marginBottom: 16 }} onChange={(e) => setMealForm({ ...mealForm, image: e.target.files?.[0]?.name || "Meal image" })} /><div style={{ background: "#f8fafc", borderRadius: 18, padding: 14, marginBottom: 14 }}><b>Food group interpreter:</b><br />{estimateFoodGroups(mealForm.notes).join(", ")}</div><button style={buttonStyle} onClick={addMeal}>Save meal to diary</button></div><h2 style={{ marginLeft: 4 }}>Meal history</h2>{meals.map((m) => <div style={cardStyle} key={m.id}><h3>{m.category} • {m.calories} kcal</h3><p>{m.date} at {m.time}</p><p>{m.notes}</p><p><b>Detected groups:</b> {m.foodGroups?.join(", ")}</p></div>)}</section>
        )}

        {screen === "planner" && (
          <section style={{ padding: 20 }}><h1 style={{ fontSize: 36 }}>Meal Planner</h1><p>Based on {profile.goal}, BMI {latestBMI || "--"} and {profile.activity} activity.</p>{mealPlan.map((item) => <div style={cardStyle} key={item.meal}><h2>{item.meal}</h2><h3>{item.food}</h3><p><b>Portion:</b> {item.portion}</p><p><b>Calories:</b> {item.kcal} kcal</p></div>)}</section>
        )}

        {screen === "report" && (
          <section style={{ padding: 20 }}><h1 style={{ fontSize: 36 }}>Monthly Report</h1><div style={cardStyle}><h2>{profile.fullName}</h2><p>DOB: {profile.dob}</p><p>Age: {calcAge(profile.dob)}</p><p>BMI: {latestBMI || "--"} - {bmiLabel(latestBMI)}</p><p>Weight: {profile.weight || "--"} kg</p><p>Goal: {profile.goal}</p><p>Total meals captured: {meals.length}</p><p>Total calories logged: {totalCalories}</p><p>Average daily calories: {avgDaily}</p><div style={{ background: "#ecfdf5", borderRadius: 20, padding: 18, marginTop: 16 }}><h3>AI Progress Summary</h3><p>The patient has logged {meals.length} meal records. Continue structured meal logging, portion control, water intake monitoring and weekly weight updates. Longitudinal BMI and weight graphs are available in the EHR section.</p></div><button style={{ ...buttonStyle, marginTop: 16, background: "#0f172a" }} onClick={() => window.print()}>Print / Save Report</button></div></section>
        )}

        {!['landing', 'login', 'enroll'].includes(screen) && (
          <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "white", borderTop: "1px solid #e2e8f0", padding: 8 }}><div style={{ maxWidth: 480, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>{navButton("dashboard", "Home")}{navButton("ehr", "EHR")}{navButton("scanner", "Scan")}{navButton("planner", "Plan")}{navButton("report", "Report")}</div></nav>
        )}
      </div>
    </main>
  );
}
