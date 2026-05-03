"use client";

import React, { useMemo, useState } from "react";
import {
  Apple,
  Camera,
  ClipboardList,
  HeartPulse,
  Lock,
  LogOut,
  Mail,
  Plus,
  Scale,
  Search,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  User,
  Utensils
} from "lucide-react";

const foods = [
  { name: "Chicken breast", calories: 165, protein: 31, carbs: 0, fat: 4, portion: "100g" },
  { name: "Boiled egg", calories: 78, protein: 6, carbs: 1, fat: 5, portion: "1 egg" },
  { name: "Rice", calories: 206, protein: 4, carbs: 45, fat: 0, portion: "1 cup cooked" },
  { name: "Avocado", calories: 160, protein: 2, carbs: 9, fat: 15, portion: "100g" },
  { name: "Salmon", calories: 208, protein: 20, carbs: 0, fat: 13, portion: "100g" },
  { name: "Banana", calories: 105, protein: 1, carbs: 27, fat: 0, portion: "1 medium" },
  { name: "Greek yoghurt", calories: 100, protein: 10, carbs: 6, fat: 3, portion: "150g" },
  { name: "Oats", calories: 154, protein: 6, carbs: 27, fat: 3, portion: "40g dry" }
];

const plans: Record<string, string[]> = {
  "Weight Loss": [
    "Breakfast: Greek yoghurt, berries and 20g oats",
    "Lunch: Grilled chicken salad with avocado",
    "Snack: Boiled egg or fruit",
    "Dinner: Lean protein with vegetables"
  ],
  "Maintenance": [
    "Breakfast: Oats with banana and yoghurt",
    "Lunch: Chicken rice bowl with vegetables",
    "Snack: Fruit or nuts",
    "Dinner: Protein, starch portion and salad"
  ],
  "High Protein": [
    "Breakfast: Eggs and yoghurt",
    "Lunch: Chicken breast, salad and small rice portion",
    "Snack: Protein yoghurt",
    "Dinner: Fish or lean mince with vegetables"
  ]
};

type Meal = {
  id: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  portion: string;
};

export default function Page() {
  const [user, setUser] = useState<any>(() =>
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("calgpt_user") || "null") : null
  );
  const [view, setView] = useState(user ? "dashboard" : "login");
  const [auth, setAuth] = useState({ name: "", email: "", password: "" });
  const [goal, setGoal] = useState(1800);
  const [search, setSearch] = useState("");
  const [meals, setMeals] = useState<Meal[]>(() =>
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("calgpt_meals") || "[]") : []
  );
  const [ehr, setEhr] = useState<any>(() =>
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("calgpt_ehr") || "{}") : {}
  );
  const [weight, setWeight] = useState("");
  const [weights, setWeights] = useState<any[]>(() =>
    typeof window !== "undefined" ? JSON.parse(localStorage.getItem("calgpt_weights") || "[{\"date\":\"2026-05-01\",\"weight\":82}]") : []
  );
  const [imagePreview, setImagePreview] = useState("");
  const [analysis, setAnalysis] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState("Weight Loss");

  const totals = useMemo(
    () =>
      meals.reduce(
        (a, m) => ({
          calories: a.calories + m.calories,
          protein: a.protein + m.protein,
          carbs: a.carbs + m.carbs,
          fat: a.fat + m.fat
        }),
        { calories: 0, protein: 0, carbs: 0, fat: 0 }
      ),
    [meals]
  );

  const remaining = Math.max(goal - totals.calories, 0);
  const progress = Math.min((totals.calories / goal) * 100, 100);

  function login() {
    const next = { name: auth.name || "CalGPT User", email: auth.email || "demo@calgpt.ai" };
    localStorage.setItem("calgpt_user", JSON.stringify(next));
    setUser(next);
    setView("dashboard");
  }

  function logout() {
    localStorage.removeItem("calgpt_user");
    setUser(null);
    setView("login");
  }

  function addMeal(food: Omit<Meal, "id">) {
    const next = [...meals, { ...food, id: Date.now() }];
    setMeals(next);
    localStorage.setItem("calgpt_meals", JSON.stringify(next));
  }

  function deleteMeal(id: number) {
    const next = meals.filter((m) => m.id !== id);
    setMeals(next);
    localStorage.setItem("calgpt_meals", JSON.stringify(next));
  }

  function saveEHR() {
    localStorage.setItem("calgpt_ehr", JSON.stringify(ehr));
    alert("EHR saved for this demo.");
  }

  function addWeight() {
    if (!weight) return;
    const next = [...weights, { date: new Date().toISOString().slice(0, 10), weight: Number(weight) }];
    setWeights(next);
    localStorage.setItem("calgpt_weights", JSON.stringify(next));
    setWeight("");
  }

  async function analyzeFood(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagePreview(URL.createObjectURL(file));
    setAnalysis({ foodName: "Analyzing...", calories: "", portion: "", recommendation: "Please wait..." });

    const formData = new FormData();
    formData.append("image", file);
    formData.append("ehr", JSON.stringify(ehr));
    formData.append("goal", String(goal));

    try {
      const res = await fetch("/api/analyze-food", { method: "POST", body: formData });
      const data = await res.json();
      setAnalysis(data);
    } catch {
      setAnalysis({
        foodName: "Demo meal",
        calories: 450,
        portion: "1 medium bowl",
        recommendation: "Demo fallback. Connect OpenAI API key for live image analysis."
      });
    }
  }

  if (!user) {
    const register = view === "register";
    return (
      <main className="min-h-screen bg-[#07110C] text-white">
        <section className="mx-auto grid min-h-screen max-w-6xl items-center gap-10 px-5 py-10 md:grid-cols-2">
          <div>
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-green-500/10 px-4 py-2 text-green-300">
              <Sparkles size={16} /> CalGPT Health AI
            </div>
            <h1 className="text-5xl font-black leading-tight md:text-7xl">
              Track smarter. Eat better. Live healthier.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-slate-300">
              AI calorie tracking with EHR, photo analysis, diet plans, portion recommendations and weight tracking.
            </p>
            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              <Feature icon={<ShieldCheck />} text="Secure login" />
              <Feature icon={<HeartPulse />} text="EHR profile" />
              <Feature icon={<Camera />} text="AI food scan" />
            </div>
          </div>

          <div className="rounded-[2rem] bg-white p-7 text-slate-950 shadow-2xl">
            <h2 className="text-3xl font-black">{register ? "Create account" : "Welcome back"}</h2>
            <p className="mt-2 text-slate-500">{register ? "Register your CalGPT profile" : "Login to your dashboard"}</p>
            <div className="mt-6 space-y-3">
              {register && <AuthInput icon={<User />} placeholder="Full name" value={auth.name} onChange={(v) => setAuth({ ...auth, name: v })} />}
              <AuthInput icon={<Mail />} placeholder="Email" value={auth.email} onChange={(v) => setAuth({ ...auth, email: v })} />
              <AuthInput icon={<Lock />} placeholder="Password" type="password" value={auth.password} onChange={(v) => setAuth({ ...auth, password: v })} />
              <button onClick={login} className="w-full rounded-2xl bg-green-500 py-4 font-bold text-white hover:bg-green-600">
                {register ? "Register" : "Login"}
              </button>
              <button onClick={() => setView(register ? "login" : "register")} className="w-full text-sm font-semibold text-green-600">
                {register ? "Already have an account? Login" : "New user? Create account"}
              </button>
            </div>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#F7FAF7] text-slate-950">
      <nav className="sticky top-0 z-20 border-b bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#07110C] text-green-400">
              <Apple />
            </div>
            <div>
              <h1 className="text-xl font-black">CalGPT</h1>
              <p className="text-xs text-slate-500">AI calorie & EHR tracker</p>
            </div>
          </div>
          <div className="hidden gap-2 md:flex">
            {["dashboard", "tracker", "ehr", "ai", "plans", "weight"].map((item) => (
              <button key={item} onClick={() => setView(item)} className={`rounded-xl px-4 py-2 text-sm font-bold capitalize ${view === item ? "bg-[#07110C] text-white" : "hover:bg-slate-100"}`}>
                {item}
              </button>
            ))}
          </div>
          <button onClick={logout} className="rounded-xl border bg-white px-4 py-2 text-sm font-bold">
            <LogOut className="mr-2 inline" size={16} /> Logout
          </button>
        </div>
      </nav>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 grid grid-cols-3 gap-2 md:hidden">
          {["dashboard", "tracker", "ehr", "ai", "plans", "weight"].map((item) => (
            <button key={item} onClick={() => setView(item)} className={`rounded-xl px-3 py-2 text-sm font-bold capitalize ${view === item ? "bg-[#07110C] text-white" : "bg-white"}`}>
              {item}
            </button>
          ))}
        </div>

        {view === "dashboard" && (
          <section className="grid gap-6 lg:grid-cols-[1fr_.75fr]">
            <div className="rounded-[2rem] bg-[#07110C] p-7 text-white shadow-xl">
              <p className="text-green-300">Good day, {user.name}</p>
              <h2 className="mt-2 text-4xl font-black">Let’s crush your goals today.</h2>
              <div className="mt-8 rounded-full bg-white/15 p-2">
                <div className="h-7 rounded-full bg-green-400" style={{ width: `${progress}%` }} />
              </div>
              <div className="mt-4 flex justify-between text-sm text-slate-300">
                <span>{totals.calories} kcal consumed</span>
                <span>{remaining} kcal remaining</span>
              </div>
              <div className="mt-8 grid gap-4 md:grid-cols-4">
                <Stat title="Goal" value={`${goal} kcal`} />
                <Stat title="Protein" value={`${totals.protein}g`} />
                <Stat title="Carbs" value={`${totals.carbs}g`} />
                <Stat title="Weight" value={`${weights[weights.length - 1]?.weight || "-"}kg`} />
              </div>
            </div>

            <div className="grid gap-4">
              <Quick title="Track calories" icon={<Utensils />} onClick={() => setView("tracker")} />
              <Quick title="Upload meal photo" icon={<Upload />} onClick={() => setView("ai")} />
              <Quick title="Save EHR" icon={<ClipboardList />} onClick={() => setView("ehr")} />
              <Quick title="Weight tracker" icon={<Scale />} onClick={() => setView("weight")} />
            </div>
          </section>
        )}

        {view === "tracker" && (
          <section className="grid gap-6 lg:grid-cols-[.85fr_1.15fr]">
            <Panel>
              <h2 className="text-2xl font-black">Food tracker</h2>
              <div className="mt-5 flex items-center gap-2 rounded-2xl bg-stone-100 px-4 py-3">
                <Search size={20} className="text-slate-500" />
                <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search foods" className="w-full bg-transparent" />
              </div>
              <div className="mt-4 space-y-3">
                {foods.filter((f) => f.name.toLowerCase().includes(search.toLowerCase())).map((food) => (
                  <button key={food.name} onClick={() => addMeal(food)} className="flex w-full items-center justify-between rounded-2xl border bg-white p-4 text-left hover:bg-stone-50">
                    <div>
                      <p className="font-bold">{food.name}</p>
                      <p className="text-sm text-slate-500">{food.portion} · P {food.protein}g · C {food.carbs}g · F {food.fat}g</p>
                    </div>
                    <b><Plus className="inline" size={16} /> {food.calories}</b>
                  </button>
                ))}
              </div>
            </Panel>

            <Panel>
              <div className="flex justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-black">Daily diary</h2>
                  <p className="text-slate-500">Total: {totals.calories} kcal</p>
                </div>
                <input className="h-12 w-28 rounded-2xl bg-stone-100 px-4 font-bold" value={goal} onChange={(e) => setGoal(Number(e.target.value) || 1)} />
              </div>
              <div className="mt-6 space-y-3">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between rounded-3xl border p-4">
                    <div>
                      <p className="font-bold">{meal.name}</p>
                      <p className="text-sm text-slate-500">{meal.portion} · {meal.protein}g protein</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <b>{meal.calories}</b>
                      <button onClick={() => deleteMeal(meal.id)} className="rounded-full bg-stone-100 p-2">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          </section>
        )}

        {view === "ehr" && (
          <Panel>
            <h2 className="text-3xl font-black">Electronic Health Record</h2>
            <p className="mt-1 text-slate-500">Patient health profile for diet and risk recommendations.</p>
            <div className="mt-6 grid gap-3 md:grid-cols-2">
              {["fullName", "dateOfBirth", "gender", "height", "weight", "allergies", "conditions", "medication", "bloodPressure", "glucose", "doctorNotes"].map((field) => (
                <div key={field}>
                  <label className="mb-1 block text-sm font-bold capitalize">{field.replace(/([A-Z])/g, " $1")}</label>
                  <textarea rows={field === "doctorNotes" ? 4 : 1} className="w-full rounded-2xl border bg-stone-50 px-4 py-3" value={ehr[field] || ""} onChange={(e) => setEhr({ ...ehr, [field]: e.target.value })} />
                </div>
              ))}
            </div>
            <button onClick={saveEHR} className="mt-6 rounded-2xl bg-green-500 px-8 py-4 font-bold text-white hover:bg-green-600">Save EHR</button>
          </Panel>
        )}

        {view === "ai" && (
          <section className="grid gap-6 lg:grid-cols-2">
            <Panel>
              <h2 className="text-3xl font-black">AI food photo analysis</h2>
              <p className="mt-2 text-slate-500">Upload a meal image. This connects to the OpenAI API route when your API key is added.</p>
              <label className="mt-6 grid cursor-pointer place-items-center rounded-[2rem] border-2 border-dashed bg-stone-50 p-10 text-center">
                <Camera className="mb-3 text-green-600" size={48} />
                <span className="font-bold">Upload meal photo</span>
                <input type="file" accept="image/*" className="hidden" onChange={analyzeFood} />
              </label>
              {imagePreview && <img src={imagePreview} className="mt-5 max-h-80 w-full rounded-3xl object-cover" alt="Uploaded meal" />}
            </Panel>

            <div className="rounded-[2rem] bg-[#07110C] p-6 text-white shadow-sm">
              <h2 className="text-3xl font-black">Analysis result</h2>
              {analysis ? (
                <div className="mt-6 space-y-4">
                  <Stat title="Detected" value={analysis.foodName || analysis.summary} />
                  <Stat title="Calories" value={`${analysis.calories || 0} kcal`} />
                  <Stat title="Portion" value={analysis.portion || "Estimated"} />
                  <p className="rounded-3xl bg-white/10 p-4 text-slate-200">{analysis.recommendation}</p>
                  <button onClick={() => addMeal({ name: analysis.foodName || "AI detected meal", calories: Number(analysis.calories || 0), protein: Number(analysis.protein || 0), carbs: Number(analysis.carbs || 0), fat: Number(analysis.fat || 0), portion: analysis.portion || "Estimated" })} className="rounded-2xl bg-green-500 px-5 py-3 font-bold text-white">
                    Add to diary
                  </button>
                </div>
              ) : <p className="mt-5 text-slate-300">No image uploaded yet.</p>}
            </div>
          </section>
        )}

        {view === "plans" && (
          <Panel>
            <h2 className="text-3xl font-black">Diet plans & portion recommendations</h2>
            <p className="mt-2 text-slate-500">Plans are adjusted around your calorie goal and EHR profile.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {Object.keys(plans).map((p) => (
                <button key={p} onClick={() => setSelectedPlan(p)} className={`rounded-2xl px-4 py-2 font-bold ${selectedPlan === p ? "bg-[#07110C] text-white" : "bg-stone-100"}`}>
                  {p}
                </button>
              ))}
            </div>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div className="rounded-[2rem] bg-stone-100 p-5">
                <h3 className="text-xl font-black">Daily plan: ±{goal} kcal</h3>
                <ul className="mt-4 space-y-3">
                  {plans[selectedPlan].map((item) => <li key={item} className="rounded-2xl bg-white p-4">{item}</li>)}
                </ul>
              </div>
              <div className="rounded-[2rem] bg-[#07110C] p-5 text-white">
                <h3 className="text-xl font-black">Portion guide</h3>
                <div className="mt-4 space-y-3 text-slate-200">
                  <p>Protein: palm-sized portion per meal.</p>
                  <p>Carbs: fist-sized portion, reduce at dinner for weight loss.</p>
                  <p>Vegetables: 2 fists per main meal.</p>
                  <p>Fats: thumb-sized portion of oil, nuts, avocado, or dressing.</p>
                  <p className="rounded-2xl bg-white/10 p-3">EHR note: {ehr.conditions ? `Consider condition: ${ehr.conditions}` : "No chronic condition captured yet."}</p>
                </div>
              </div>
            </div>
          </Panel>
        )}

        {view === "weight" && (
          <Panel>
            <h2 className="text-3xl font-black">Weight tracker</h2>
            <p className="text-slate-500">Monitor progress over time.</p>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <Stat title="Start" value={`${weights[0]?.weight || 0} kg`} />
              <Stat title="Current" value={`${weights[weights.length - 1]?.weight || 0} kg`} />
              <Stat title="Entries" value={`${weights.length}`} />
            </div>
            <div className="mt-6 flex gap-3">
              <input className="w-full rounded-2xl border px-4 py-3" placeholder="Enter today’s weight" value={weight} onChange={(e) => setWeight(e.target.value)} />
              <button onClick={addWeight} className="rounded-2xl bg-green-500 px-8 font-bold text-white">Save</button>
            </div>
            <div className="mt-6 space-y-3">
              {weights.map((w, i) => <div key={i} className="flex justify-between rounded-2xl bg-stone-100 p-4"><span>{w.date}</span><b>{w.weight} kg</b></div>)}
            </div>
          </Panel>
        )}
      </div>
    </main>
  );
}

function Feature({ icon, text }: any) {
  return <div className="rounded-3xl bg-white/10 p-4 text-center text-sm">{React.cloneElement(icon, { className: "mx-auto mb-2 h-6 w-6 text-green-300" })}<b>{text}</b></div>;
}

function AuthInput({ icon, placeholder, value, onChange, type = "text" }: any) {
  return <div className="flex items-center gap-3 rounded-2xl border bg-stone-50 px-4 py-3">{React.cloneElement(icon, { className: "h-5 w-5 text-slate-500" })}<input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full bg-transparent" /></div>;
}

function Panel({ children }: any) {
  return <section className="rounded-[2rem] bg-white p-6 shadow-sm">{children}</section>;
}

function Stat({ title, value }: any) {
  return <div className="rounded-3xl bg-stone-100 p-4 text-slate-950"><p className="text-xs font-bold uppercase text-slate-500">{title}</p><p className="mt-1 text-xl font-black">{value}</p></div>;
}

function Quick({ title, icon, onClick }: any) {
  return <button onClick={onClick} className="flex items-center justify-between rounded-[2rem] bg-white p-5 text-left shadow-sm transition hover:scale-[1.01]"><div><p className="text-lg font-black">{title}</p><p className="text-sm text-slate-500">Open module</p></div>{React.cloneElement(icon, { className: "h-7 w-7 text-green-600" })}</button>;
}
