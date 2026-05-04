import React, { useEffect, useMemo, useState } from "react";
import { Camera, CalendarDays, ChevronRight, ClipboardList, Download, HeartPulse, Home, LineChart, Lock, Mail, MapPin, Phone, Plus, Salad, ShieldCheck, Sparkles, User, Utensils, Weight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LineChart as RLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const countries = [
  { name: "South Africa", code: "+27" },
  { name: "United Kingdom", code: "+44" },
  { name: "United States", code: "+1" },
  { name: "United Arab Emirates", code: "+971" },
  { name: "Namibia", code: "+264" },
  { name: "Zimbabwe", code: "+263" },
  { name: "Ghana", code: "+233" },
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
  allergies: "",
  exerciseHistory: "",
  eatingHabits: "",
  waterIntake: "",
  consent: false,
};

const sampleMealPlan = [
  { meal: "Breakfast", food: "Greek yoghurt, berries, oats", portion: "1 cup yoghurt + ½ cup berries + ¼ cup oats", kcal: 380 },
  { meal: "Lunch", food: "Chicken salad bowl", portion: "1 palm protein + 2 fists salad + 1 thumb olive oil", kcal: 520 },
  { meal: "Dinner", food: "Fish, vegetables, small starch", portion: "1 palm fish + 2 fists veg + ½ fist rice", kcal: 560 },
  { meal: "Snack", food: "Apple with peanut butter", portion: "1 apple + 1 tablespoon peanut butter", kcal: 210 },
];

function calcAge(dob) {
  if (!dob) return "";
  const birth = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age > 0 ? age : "";
}

function calcBMI(weight, height) {
  const w = Number(weight);
  const h = Number(height) / 100;
  if (!w || !h) return "";
  return (w / (h * h)).toFixed(1);
}

function bmiLabel(bmi) {
  const n = Number(bmi);
  if (!n) return "Not calculated";
  if (n < 18.5) return "Underweight range";
  if (n < 25) return "Healthy range";
  if (n < 30) return "Overweight range";
  return "Obese range";
}

export default function CalGPTFullVersion() {
  const [screen, setScreen] = useState("landing");
  const [profile, setProfile] = useState(defaultProfile);
  const [meals, setMeals] = useState([]);
  const [weights, setWeights] = useState([]);
  const [mealForm, setMealForm] = useState({ category: "Lunch", calories: "520", notes: "Balanced meal", image: "" });
  const [login, setLogin] = useState({ email: "", password: "" });

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
    if (selected) setProfile((p) => ({ ...p, dialCode: selected.code, age: calcAge(p.dob) }));
  }, [profile.country, profile.dob]);

  const bmi = useMemo(() => calcBMI(profile.weight, profile.height), [profile.weight, profile.height]);
  const todayCalories = meals.filter((m) => m.date === new Date().toISOString().slice(0, 10)).reduce((s, m) => s + Number(m.calories || 0), 0);
  const totalCalories = meals.reduce((s, m) => s + Number(m.calories || 0), 0);
  const avgDaily = meals.length ? Math.round(totalCalories / Math.max(1, new Set(meals.map((m) => m.date)).size)) : 0;

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
    const next = { ...profile, age: calcAge(profile.dob), bmi, createdAt: new Date().toISOString() };
    const firstWeight = [{ date: new Date().toISOString().slice(0, 10), weight: Number(profile.weight || 0) }];
    setProfile(next);
    setWeights(firstWeight);
    saveEHR(next, meals, firstWeight);
    setScreen("dashboard");
  }

  function loginUser() {
    const saved = JSON.parse(localStorage.getItem("calgpt_ehr") || "null");
    if (saved?.profile?.email === login.email && saved?.profile?.password === login.password) {
      setProfile(saved.profile);
      setMeals(saved.meals || []);
      setWeights(saved.weights || []);
      setScreen("dashboard");
    } else alert("Login failed. Please check email and password.");
  }

  function addMeal() {
    const record = {
      id: Date.now(),
      date: new Date().toISOString().slice(0, 10),
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      category: mealForm.category,
      calories: Number(mealForm.calories || 0),
      notes: mealForm.notes,
      image: mealForm.image,
    };
    const nextMeals = [record, ...meals];
    setMeals(nextMeals);
    saveEHR(profile, nextMeals, weights);
  }

  function updateWeight() {
    const w = prompt("Enter new weight in kg");
    if (!w) return;
    const nextWeights = [...weights, { date: new Date().toISOString().slice(0, 10), weight: Number(w) }];
    const nextProfile = { ...profile, weight: w };
    setWeights(nextWeights);
    setProfile(nextProfile);
    saveEHR(nextProfile, meals, nextWeights);
  }

  const weightData = weights.length ? weights : [{ date: "Start", weight: Number(profile.weight || 0) }];
  const pieData = [
    { name: "Breakfast", value: meals.filter((m) => m.category === "Breakfast").length },
    { name: "Lunch", value: meals.filter((m) => m.category === "Lunch").length },
    { name: "Dinner", value: meals.filter((m) => m.category === "Dinner").length },
    { name: "Snack", value: meals.filter((m) => m.category === "Snack").length },
  ];

  const nav = [
    ["dashboard", Home, "Home"],
    ["ehr", HeartPulse, "EHR"],
    ["scanner", Camera, "Scan"],
    ["planner", Salad, "Plan"],
    ["report", LineChart, "Report"],
  ];

  const Input = ({ label, ...props }) => (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-600">{label}</span>
      <input {...props} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none focus:border-emerald-400" />
    </label>
  );

  const Select = ({ label, children, ...props }) => (
    <label className="block">
      <span className="mb-2 block text-sm font-semibold text-slate-600">{label}</span>
      <select {...props} className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-4 text-base outline-none focus:border-emerald-400">{children}</select>
    </label>
  );

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="mx-auto max-w-md pb-24">
        {screen === "landing" && (
          <div className="min-h-screen bg-[#061115] px-6 py-8 text-white">
            <div className="mb-8 flex items-center gap-3"><div className="rounded-2xl bg-emerald-400 p-3 text-[#061115]"><Utensils /></div><div><p className="text-2xl font-black">CalGPT</p><p className="text-sm text-emerald-100">AI nutrition EHR</p></div></div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="rounded-[2rem] bg-white/10 p-6 shadow-2xl">
              <h1 className="text-4xl font-black leading-tight">Personal calorie tracking with health records.</h1>
              <p className="mt-4 text-slate-200">Capture meals, track BMI, build an EHR, generate monthly progress reports and receive meal plans with portions.</p>
              <div className="mt-6 grid grid-cols-3 gap-3 text-center">
                <div className="rounded-2xl bg-white p-3 text-slate-900"><Camera className="mx-auto"/><p className="mt-2 text-xs font-bold">Meal pics</p></div>
                <div className="rounded-2xl bg-white p-3 text-slate-900"><HeartPulse className="mx-auto"/><p className="mt-2 text-xs font-bold">EHR</p></div>
                <div className="rounded-2xl bg-white p-3 text-slate-900"><LineChart className="mx-auto"/><p className="mt-2 text-xs font-bold">Reports</p></div>
              </div>
              <Button onClick={() => setScreen("enroll")} className="mt-8 w-full rounded-full bg-emerald-400 py-7 text-lg font-black text-[#061115] hover:bg-emerald-300">First-time enrolment</Button>
              <Button onClick={() => setScreen("login")} variant="ghost" className="mt-3 w-full rounded-full py-6 text-white hover:bg-white/10 hover:text-white">I already have a profile</Button>
            </motion.div>
          </div>
        )}

        {screen === "login" && (
          <main className="px-6 py-10">
            <h1 className="text-4xl font-black">Login</h1>
            <p className="mt-2 text-slate-600">Access your saved CalGPT EHR.</p>
            <Card className="mt-8 rounded-[2rem]"><CardContent className="space-y-4 p-6">
              <Input label="Email" value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
              <Input label="Password" type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
              <Button onClick={loginUser} className="w-full rounded-full bg-emerald-500 py-7 text-lg font-black">Login</Button>
            </CardContent></Card>
          </main>
        )}

        {screen === "enroll" && (
          <main className="px-5 py-8">
            <h1 className="text-4xl font-black">First-time enrolment</h1>
            <p className="mt-2 text-slate-600">Create your patient profile and EHR.</p>
            <Card className="mt-6 rounded-[2rem]"><CardContent className="space-y-5 p-5">
              <Input label="Full name" value={profile.fullName} onChange={(e) => setProfile({ ...profile, fullName: e.target.value })} />
              <Input label="Date of birth" type="date" value={profile.dob} onChange={(e) => setProfile({ ...profile, dob: e.target.value })} />
              <Input label="Age" value={calcAge(profile.dob)} readOnly />
              <Select label="Gender" value={profile.gender} onChange={(e) => setProfile({ ...profile, gender: e.target.value })}><option>Male</option><option>Female</option><option>Other</option></Select>
              <Input label="Email" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} />
              <Select label="Country" value={profile.country} onChange={(e) => setProfile({ ...profile, country: e.target.value })}>{countries.map(c => <option key={c.name}>{c.name}</option>)}</Select>
              <div className="grid grid-cols-3 gap-3"><Input label="Code" value={profile.dialCode} readOnly /><div className="col-span-2"><Input label="Mobile number" value={profile.mobile} onChange={(e) => setProfile({ ...profile, mobile: e.target.value })} /></div></div>
              <Input label="Address" value={profile.address} onChange={(e) => setProfile({ ...profile, address: e.target.value })} />
              <div className="grid grid-cols-2 gap-3"><Input label="Weight kg" value={profile.weight} onChange={(e) => setProfile({ ...profile, weight: e.target.value })} /><Input label="Height cm" value={profile.height} onChange={(e) => setProfile({ ...profile, height: e.target.value })} /></div>
              <div className="rounded-3xl bg-emerald-50 p-5"><p className="font-bold">BMI</p><p className="text-5xl font-black text-emerald-500">{bmi || "--"}</p><p>{bmiLabel(bmi)}</p></div>
              <Select label="Goal" value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })}><option>Weight loss</option><option>Maintain weight</option><option>Muscle gain</option><option>Medical nutrition support</option></Select>
              <Select label="Activity level" value={profile.activity} onChange={(e) => setProfile({ ...profile, activity: e.target.value })}><option>Sedentary</option><option>Light</option><option>Moderate</option><option>Active</option></Select>
              {[["Medical conditions","conditions"],["Current medication","medications"],["Allergies","allergies"],["Exercise history","exerciseHistory"],["Eating habits","eatingHabits"],["Water intake","waterIntake"]].map(([label,key]) => <Input key={key} label={label} value={profile[key]} onChange={(e) => setProfile({ ...profile, [key]: e.target.value })} />)}
              <label className="flex gap-3 rounded-2xl bg-slate-50 p-4 text-sm"><input type="checkbox" checked={profile.consent} onChange={(e) => setProfile({ ...profile, consent: e.target.checked })} />I consent to storing my health profile, meal images and calorie records.</label>
              <Input label="Create password" type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} />
              <Input label="Confirm password" type="password" value={profile.confirmPassword} onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })} />
              <Button onClick={submitEnrollment} className="w-full rounded-full bg-emerald-500 py-7 text-lg font-black">Submit enrolment</Button>
            </CardContent></Card>
          </main>
        )}

        {screen === "dashboard" && (
          <main className="px-5 py-8">
            <div className="rounded-[2rem] bg-[#061115] p-6 text-white"><p className="text-sm text-emerald-200">Welcome back</p><h1 className="text-4xl font-black">{profile.fullName || "Patient"}</h1><p className="mt-2 text-slate-300">{profile.goal} • BMI {bmi || "--"}</p></div>
            <div className="mt-5 grid grid-cols-2 gap-4">
              <Card className="rounded-[2rem]"><CardContent className="p-5"><Utensils className="text-emerald-500"/><p className="mt-3 text-sm">Today</p><p className="text-3xl font-black text-emerald-500">{todayCalories}</p><p className="text-xs">kcal</p></CardContent></Card>
              <Card className="rounded-[2rem]"><CardContent className="p-5"><Weight className="text-emerald-500"/><p className="mt-3 text-sm">Weight</p><p className="text-3xl font-black">{profile.weight || "--"}</p><p className="text-xs">kg</p></CardContent></Card>
            </div>
            <Card className="mt-5 rounded-[2rem]"><CardContent className="p-5"><h2 className="text-xl font-black">Progress infographic</h2><div className="mt-4 h-44"><ResponsiveContainer width="100%" height="100%"><LineChart data={weightData}><XAxis dataKey="date" hide/><YAxis hide/><Tooltip/><Line type="monotone" dataKey="weight" strokeWidth={4} dot /></LineChart></ResponsiveContainer></div><Button onClick={updateWeight} className="mt-4 w-full rounded-full bg-slate-950 py-6">Add weight update</Button></CardContent></Card>
            <Card className="mt-5 rounded-[2rem] bg-emerald-50"><CardContent className="p-5"><Sparkles className="text-emerald-500"/><p className="mt-3 font-black">AI Insight</p><p className="text-slate-700">Your EHR, meals and weight records are saved locally for this MVP. Connect a database and OpenAI Vision API for production image analysis.</p></CardContent></Card>
          </main>
        )}

        {screen === "ehr" && (
          <main className="px-5 py-8"><h1 className="text-4xl font-black">Patient EHR</h1><div className="mt-6 space-y-4">{[[User, "Name", profile.fullName], [CalendarDays, "DOB", profile.dob], [Phone, "Mobile", `${profile.dialCode} ${profile.mobile}`], [MapPin, "Address", `${profile.address}, ${profile.country}`], [HeartPulse, "Conditions", profile.conditions], [ShieldCheck, "Allergies", profile.allergies], [ClipboardList, "Medication", profile.medications]].map(([Icon,label,value]) => <Card key={label} className="rounded-3xl"><CardContent className="flex items-center gap-4 p-5"><Icon className="text-emerald-500"/><div><p className="text-xs font-bold text-slate-500">{label}</p><p className="font-semibold">{value || "Not recorded"}</p></div></CardContent></Card>)}</div></main>
        )}

        {screen === "scanner" && (
          <main className="px-5 py-8"><h1 className="text-4xl font-black">Meal scanner</h1><p className="mt-2 text-slate-600">Upload or capture a meal record with date and time.</p><Card className="mt-6 rounded-[2rem]"><CardContent className="space-y-4 p-5"><Select label="Meal category" value={mealForm.category} onChange={(e) => setMealForm({ ...mealForm, category: e.target.value })}><option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option></Select><Input label="Estimated calories" value={mealForm.calories} onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })} /><Input label="Meal notes" value={mealForm.notes} onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value })} /><input type="file" accept="image/*" capture="environment" className="w-full rounded-2xl border p-4" onChange={(e) => setMealForm({ ...mealForm, image: e.target.files?.[0]?.name || "Meal image" })} /><Button onClick={addMeal} className="w-full rounded-full bg-emerald-500 py-7 text-lg font-black"><Plus className="mr-2"/>Save meal</Button></CardContent></Card><div className="mt-6 space-y-3">{meals.map(m => <Card key={m.id} className="rounded-3xl"><CardContent className="p-5"><p className="font-black">{m.category} • {m.calories} kcal</p><p className="text-sm text-slate-500">{m.date} at {m.time}</p><p>{m.notes}</p></CardContent></Card>)}</div></main>
        )}

        {screen === "planner" && (
          <main className="px-5 py-8"><h1 className="text-4xl font-black">Meal planner</h1><p className="mt-2 text-slate-600">Based on {profile.goal}, BMI {bmi || "--"} and {profile.activity} activity.</p><div className="mt-6 space-y-4">{sampleMealPlan.map(item => <Card key={item.meal} className="rounded-[2rem]"><CardContent className="p-5"><div className="flex justify-between"><h2 className="text-xl font-black">{item.meal}</h2><span className="rounded-full bg-emerald-100 px-3 py-1 text-sm font-bold text-emerald-700">{item.kcal} kcal</span></div><p className="mt-2 font-semibold">{item.food}</p><p className="mt-1 text-sm text-slate-600">Portion: {item.portion}</p></CardContent></Card>)}</div></main>
        )}

        {screen === "report" && (
          <main className="px-5 py-8"><h1 className="text-4xl font-black">Monthly report</h1><Card className="mt-6 rounded-[2rem]"><CardContent className="space-y-4 p-5"><div className="rounded-3xl bg-[#061115] p-5 text-white"><p className="text-sm text-emerald-200">Patient progress summary</p><h2 className="text-2xl font-black">{profile.fullName}</h2><p>DOB: {profile.dob} • Age: {calcAge(profile.dob)}</p></div><div className="grid grid-cols-2 gap-3"><div className="rounded-3xl bg-emerald-50 p-4"><p className="text-sm">BMI</p><p className="text-3xl font-black text-emerald-500">{bmi || "--"}</p></div><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm">Meals</p><p className="text-3xl font-black">{meals.length}</p></div><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm">Avg daily kcal</p><p className="text-3xl font-black">{avgDaily}</p></div><div className="rounded-3xl bg-slate-50 p-4"><p className="text-sm">Weight</p><p className="text-3xl font-black">{profile.weight || "--"}</p></div></div><div className="h-44"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={pieData} dataKey="value" outerRadius={70} label>{pieData.map((_, i) => <Cell key={i} />)}</Pie></PieChart></ResponsiveContainer></div><div className="rounded-3xl bg-emerald-50 p-5"><p className="font-black">AI progress summary</p><p>Your records show {meals.length} meal captures and an average of {avgDaily} kcal/day. Continue structured meal logging, portion control and weekly weight updates.</p></div><Button onClick={() => window.print()} className="w-full rounded-full bg-slate-950 py-7"><Download className="mr-2"/>Print / save report</Button></CardContent></Card></main>
        )}

        {!["landing", "login", "enroll"].includes(screen) && (
          <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 px-3 py-2 backdrop-blur"><div className="mx-auto grid max-w-md grid-cols-5 gap-1">{nav.map(([id, Icon, label]) => <button key={id} onClick={() => setScreen(id)} className={`rounded-2xl px-2 py-2 text-xs font-bold ${screen === id ? "bg-emerald-100 text-emerald-700" : "text-slate-500"}`}><Icon className="mx-auto mb-1 h-5 w-5"/>{label}</button>)}</div></div>
        )}
      </div>
    </div>
  );
}
