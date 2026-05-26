"use client";

import React, { useEffect, useMemo, useState } from "react";
const countries = [
  { name: "South Africa", code: "+27" },
  { name: "United Kingdom", code: "+44" },
  { name: "United States", code: "+1" },
  { name: "United Arab Emirates", code: "+971" },
  { name: "Namibia", code: "+264" },
  { name: "Zimbabwe", code: "+263" },
  { name: "New Zealand", code: "+64" },
];

const allergyOptions = ["None","Penicillin","Sulfa medicines","Aspirin / NSAIDs","Peanuts","Tree nuts","Shellfish","Fish","Eggs","Milk / lactose","Wheat / gluten","Soy","Other"];
const exerciseOptions = ["No regular exercise","Walking 1-2 days per week","Walking 3-5 days per week","Gym / strength training","Cardio training","Sport participation","Physically active at work","Limited by injury or illness"];
const eatingHabitOptions = ["Balanced meals most days","High sugar / sweet cravings","High refined carbohydrates","Large portions","Frequent snacking","Emotional eating","Late-night eating","Fast food often","Low vegetable intake","Irregular meal times"];
const waterOptions = ["None","Less than 500ml per day","500ml per day","1 litre per day","1.5 litres per day","2 litres per day","More than 2 litres per day"];
const sleepOptions = ["Less than 5 hours per night","5 to 7 hours per night","Over 8 hours per night"];

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
  targetWeight: "",
  targetDate: "",
  dietaryPreference: "Balanced",
  goal: "Weight loss",
  activity: "Sedentary",
  conditions: "",
  medications: "",
  allergies: "None",
  exerciseHistory: "No regular exercise",
  eatingHabits: "Balanced meals most days",
  waterIntake: "500ml per day",
  sleepAverage: "5 to 7 hours per night",
  consent: false,
};

type Profile = typeof defaultProfile;

type MealRecord = {
  id: number;
  date: string;
  time: string;
  category: string;
  calories: number;
  notes: string;
  image: string;
  foodGroups: string[];
  portionAdvice: string;
  confidence: string;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  sugar_g?: number;
  fibre_g?: number;
  health_score?: number;
  weight_loss_friendly?: string;
  diabetes_friendly?: string;
  risk_flag?: string;
};

type WeightRecord = { date: string; weight: number; bmi: number };
type SleepRecord = { date: string; hours: string; value: number };

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
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

function cleanAIText(text: string) {
  return String(text || "")
    .replace(/#{1,6}\s?/g, "")
    .replace(/\*\*/g, "")
    .replace(/[-•]\s/g, "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function estimateNutritionScore(notes: string, calories: number) {
  const text = notes.toLowerCase();

  let protein = 5;
  let carbs = Math.round(calories * 0.13);
  let fat = Math.round(calories * 0.03);
  let sugar = 5;
  let fibre = 3;
  let score = 70;
  let riskFlag = "Low";

  if (
    text.includes("fruit") ||
    text.includes("orange") ||
    text.includes("apple") ||
    text.includes("banana") ||
    text.includes("berries")
  ) {
    sugar = 15;
    fibre = 5;
    score += 8;
  }

  if (
    text.includes("nuts") ||
    text.includes("chicken") ||
    text.includes("egg") ||
    text.includes("fish") ||
    text.includes("beef") ||
    text.includes("tuna") ||
    text.includes("beans") ||
    text.includes("lentils")
  ) {
    protein = 18;
    score += 10;
  }

  if (
    text.includes("vegetable") ||
    text.includes("salad") ||
    text.includes("broccoli") ||
    text.includes("spinach") ||
    text.includes("greens")
  ) {
    fibre += 4;
    score += 8;
  }

  if (
    text.includes("cake") ||
    text.includes("cupcake") ||
    text.includes("fried") ||
    text.includes("chips") ||
    text.includes("cooldrink") ||
    text.includes("soda") ||
    text.includes("chocolate")
  ) {
    sugar = 25;
    fat = 18;
    score -= 20;
    riskFlag = "Moderate";
  }

  if (calories > 700) {
    score -= 15;
    riskFlag = "High";
  }

  score = Math.max(0, Math.min(100, score));

  return {
    protein_g: protein,
    carbs_g: carbs,
    fat_g: fat,
    sugar_g: sugar,
    fibre_g: fibre,
    health_score: score,
    weight_loss_friendly: score >= 70 && calories <= 500 ? "Yes" : "Use caution",
    diabetes_friendly: sugar <= 15 ? "Yes" : "Use caution",
    risk_flag: riskFlag,
  };
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

function sleepCategoryToHours(value: string | number) {
  const text = String(value || "").toLowerCase();
  if (text.includes("less than 5")) return 4.5;
  if (text.includes("5 to 7")) return 6;
  if (text.includes("over 8")) return 8.5;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function estimateFoodGroups(notes: string) {
  const text = notes.toLowerCase();
  const groups: string[] = [];
  const carbs = ["rice","pasta","bread","potato","chips","pap","oats","cereal","noodle","roti","wrap"];
  const proteins = ["chicken","beef","meat","fish","egg","tuna","steak","lamb","pork","beans","lentils","protein"];
  const veg = ["salad","vegetable","broccoli","spinach","cabbage","carrot","tomato","lettuce","greens"];
  const sugar = ["cake","sweet","chocolate","dessert","sugar","juice","soda","cooldrink","biscuit"];
  const fats = ["cheese","butter","oil","avocado","mayo","cream","nuts"];
  if (carbs.some((x) => text.includes(x))) groups.push("Carbohydrate");
  if (proteins.some((x) => text.includes(x))) groups.push("Protein / meat");
  if (veg.some((x) => text.includes(x))) groups.push("Vegetables");
  if (sugar.some((x) => text.includes(x))) groups.push("Sugar / dessert");
  if (fats.some((x) => text.includes(x))) groups.push("Fat / oils");
  return groups.length ? groups : ["Needs AI image interpretation"];
}

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const img = new Image();

      img.onload = () => {
        const canvas = document.createElement("canvas");

        const maxWidth = 500;
        const scale = Math.min(1, maxWidth / img.width);

        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Image compression failed"));
          return;
        }

        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        const compressedBase64 = canvas.toDataURL("image/jpeg", 0.35);
        resolve(compressedBase64);
      };

      img.onerror = () => reject(new Error("Could not load image"));
      img.src = reader.result as string;
    };

    reader.onerror = (error) => reject(error);
    reader.readAsDataURL(file);
  });
}

export default function Page() {
  const [screen, setScreen] = useState("landing");
  const [profile, setProfile] = useState<Profile>(defaultProfile);
  const [meals, setMeals] = useState<MealRecord[]>([]);
  const [weights, setWeights] = useState<WeightRecord[]>([]);
  const [sleepRecords, setSleepRecords] = useState<SleepRecord[]>([]);
  const [activityUpdates, setActivityUpdates] = useState<any[]>([]);
  const [login, setLogin] = useState({ email: "", password: "" });
  const [resetEmail, setResetEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [aiStatus, setAiStatus] = useState("Upload a meal photo, then tap Submit image for AI analysis.");
  const [aiLoading, setAiLoading] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isStandalone, setIsStandalone] = useState(false);

  const [mealForm, setMealForm] = useState({
    category: "Lunch",
    calories: "",
    notes: "",
    imageName: "",
    imageBase64: "",
    foodGroups: [] as string[],
    portionAdvice: "",
    confidence: "",
  });

  useEffect(() => {
    const saved = localStorage.getItem("calgpt_ehr");
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProfile(data.profile || defaultProfile);
        setMeals(data.meals || []);
        setWeights(data.weights || []);
        setSleepRecords(data.sleepRecords || []);
        setActivityUpdates(data.activityUpdates || []);
        setScreen("dashboard");
      } catch {
        localStorage.removeItem("calgpt_ehr");
      }
    }
  }, []);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    setIsStandalone(standalone);

    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as BeforeInstallPromptEvent);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  useEffect(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem("calgpt_morning_reminder");
    const hour = new Date().getHours();

    if (hour >= 6 && hour <= 11 && lastShown !== todayKey) {
      setTimeout(() => {
        alert(
          "Good morning! Remember to log your meals, water intake, sleep and weight update in CalGPT today."
        );
        localStorage.setItem("calgpt_morning_reminder", todayKey);
      }, 1200);
    }
  }, []);

  useEffect(() => {
    const selected = countries.find((c) => c.name === profile.country);
    if (selected) {
      setProfile((p) => ({ ...p, dialCode: selected.code, age: calcAge(p.dob) }));
    }
  }, [profile.country, profile.dob]);

  const today = new Date().toISOString().slice(0, 10);
  const bmi = useMemo(() => calcBMI(profile.weight, profile.height), [profile.weight, profile.height]);
  const todayMeals = meals.filter((m) => m.date === today);
  const todayCalories = todayMeals.reduce((s, m) => s + Number(m.calories || 0), 0);
  const totalCalories = meals.reduce((s, m) => s + Number(m.calories || 0), 0);
  const avgDaily = meals.length ? Math.round(totalCalories / Math.max(1, new Set(meals.map((m) => m.date)).size)) : 0;
  const avgSleepHours = sleepRecords.length
    ? (sleepRecords.reduce((s, r) => s + sleepCategoryToHours(r.hours), 0) / sleepRecords.length).toFixed(1)
    : String(sleepCategoryToHours(profile.sleepAverage));
  const avgSleep = `${avgSleepHours} hours/night`;

  const currentWeight = Number(profile.weight || 0);
  const targetWeight = Number((profile as any).targetWeight || 0);
  const weightToLose = currentWeight && targetWeight ? Math.max(0, currentWeight - targetWeight) : 0;

  const targetDateValue = (profile as any).targetDate ? new Date((profile as any).targetDate) : null;
  const weeksToTarget =
    targetDateValue && targetDateValue.getTime() > Date.now()
      ? Math.max(1, Math.ceil((targetDateValue.getTime() - Date.now()) / (1000 * 60 * 60 * 24 * 7)))
      : 12;

  const weeklyLossTarget = weightToLose ? Number((weightToLose / weeksToTarget).toFixed(1)) : 0;

  let targetCalories = 2200;

  if (profile.goal === "Weight loss") targetCalories = 1600;
  if (profile.goal === "Maintain weight") targetCalories = 2100;
  if (profile.goal === "Muscle gain") targetCalories = 2600;
  if (profile.goal === "Medical nutrition support") targetCalories = 1800;

  if (profile.activity === "Active") targetCalories += 250;
  if (profile.activity === "Moderate") targetCalories += 100;
  if (profile.activity === "Sedentary") targetCalories -= 150;

  if (weeklyLossTarget > 0) {
    const dailyDeficit = Math.round((weeklyLossTarget * 7700) / 7);
    targetCalories = Math.max(1200, targetCalories - Math.min(dailyDeficit, 750));
  }

  const proteinTarget = Math.max(70, Math.round((currentWeight || 60) * 1.6));
  const calorieWarning =
    weeklyLossTarget > 1
      ? "Your target may be aggressive. A safer weight-loss pace is usually around 0.5kg to 1kg per week."
      : "Your target appears within a practical weekly weight-loss range.";


  function saveEHR(
    nextProfile = profile,
    nextMeals = meals,
    nextWeights = weights,
    nextSleep = sleepRecords,
    nextActivity = activityUpdates
  ) {
    localStorage.setItem("calgpt_ehr", JSON.stringify({
      profile: nextProfile,
      meals: nextMeals,
      weights: nextWeights,
      sleepRecords: nextSleep,
      activityUpdates: nextActivity,
    }));
  }

  async function installApp() {
    if (!installPrompt) {
      alert("To install CalGPT: open this link in Chrome, not WhatsApp/Facebook browser. Then tap Chrome menu → Add to Home Screen / Install app. On iPhone use Safari Share → Add to Home Screen.");
      return;
    }

    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
    setIsStandalone(true);
  }

  function logout() {
    setScreen("landing");
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
    const firstSleep = [{ date: today, hours: profile.sleepAverage, value: sleepCategoryToHours(profile.sleepAverage) }];
    setProfile(nextProfile);
    setWeights(firstWeight);
    setSleepRecords(firstSleep);
    saveEHR(nextProfile, meals, firstWeight, firstSleep, activityUpdates);
    setScreen("dashboard");
  }

  function loginUser() {
    const saved = JSON.parse(localStorage.getItem("calgpt_ehr") || "null");
    if (saved?.profile?.email === login.email && saved?.profile?.password === login.password) {
      setProfile(saved.profile);
      setMeals(saved.meals || []);
      setWeights(saved.weights || []);
      setSleepRecords(saved.sleepRecords || []);
      setActivityUpdates(saved.activityUpdates || []);
      setScreen("dashboard");
    } else {
      alert("Login failed. Please check your email and password.");
    }
  }

  function resetPassword() {
    if (!resetEmail || !newPassword) {
      alert("Enter your email and a new password.");
      return;
    }

    const saved = JSON.parse(localStorage.getItem("calgpt_ehr") || "null");

    if (!saved?.profile?.email) {
      const starterProfile = {
        ...defaultProfile,
        email: resetEmail,
        password: newPassword,
        confirmPassword: newPassword,
        country: "South Africa",
        dialCode: "+27",
      };

      localStorage.setItem(
        "calgpt_ehr",
        JSON.stringify({
          profile: starterProfile,
          meals: [],
          weights: [],
          sleepRecords: [],
          activityUpdates: [],
        })
      );

      setProfile(starterProfile);
      setMeals([]);
      setWeights([]);
      setSleepRecords([]);
      setActivityUpdates([]);

      alert("Password created on this device. Please complete your enrolment profile.");
      setScreen("enroll");
      return;
    }

    if (saved.profile.email.toLowerCase() !== resetEmail.toLowerCase()) {
      alert(
        "This email does not match the saved profile on this device. For privacy, each device keeps its own local profile. New users can complete first-time enrolment."
      );
      return;
    }

    const updatedProfile = {
      ...saved.profile,
      password: newPassword,
      confirmPassword: newPassword,
    };

    localStorage.setItem(
      "calgpt_ehr",
      JSON.stringify({ ...saved, profile: updatedProfile })
    );

    setProfile(updatedProfile);
    alert("Password reset successful on this device. You can now login with your new password.");
    setScreen("login");
  }

  async function handleImage(file: File | undefined) {
    if (!file) return;
    try {
      setAiStatus("Preparing and compressing image...");
      setMealForm((p) => ({
        ...p,
        imageName: file.name,
        imageBase64: "",
        notes: "",
        calories: "",
        foodGroups: [],
        portionAdvice: "",
        confidence: "",
      }));

      const base64 = await fileToBase64(file);

      setMealForm((p) => ({
        ...p,
        imageName: file.name,
        imageBase64: base64,
      }));

      setAiStatus("Image ready. Tap Submit image for AI analysis.");
    } catch (error) {
      console.error("IMAGE ERROR:", error);
      setAiStatus("Image upload failed. Please try another photo.");
    }
  }

  function parseCaloriesFromText(text: string) {
    const calorieMatch =
      text.match(/(?:calories|kcal)[^\d]{0,20}(\d{2,5})/i) ||
      text.match(/(\d{2,5})\s*(?:calories|kcal)/i);
    return calorieMatch?.[1] || "";
  }

  async function submitImageForAI() {
    try {
      if (!mealForm.imageBase64) {
        alert("Please upload or take a photo first.");
        return;
      }

      setAiLoading(true);
      setAiStatus("Analyzing your meal with AI...");

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image: mealForm.imageBase64,
          question:
            "Estimate the calories, identify the visible food, food group, portion advice and confidence level.",
        }),
      });

      const text = await res.text();

      let data: any = {};
      try {
        data = JSON.parse(text);
      } catch {
        console.error("INVALID JSON RESPONSE:", text);

        setMealForm((p) => ({
          ...p,
          notes: "Image analysis failed",
          calories: "",
          foodGroups: ["Analysis failed"],
          portionAdvice: cleanAIText(
            text || "Server returned an invalid response. Image may still be too large."
          ),
          confidence: "low",
        }));

        setAiStatus("AI request failed");
        return;
      }

      console.log("AI RESPONSE:", data);

      if (!res.ok || data.error) {
        setMealForm((p) => ({
          ...p,
          notes: "Image analysis failed",
          calories: "",
          foodGroups: ["Analysis failed"],
          portionAdvice: cleanAIText(data?.error || "Please try again with a clearer image."),
          confidence: "low",
        }));

        setAiStatus("AI request failed");
        return;
      }

      const resultText = cleanAIText(String(
        data.result ||
          data.description ||
          data.message ||
          "AI analysis completed"
      ));

      const extractedCalories = parseCaloriesFromText(resultText);

      setMealForm((p) => ({
        ...p,
        notes: cleanAIText(data.description || resultText),
        calories: data.calories ? String(data.calories) : extractedCalories,
        foodGroups: data.foodGroup ? [cleanAIText(data.foodGroup)] : estimateFoodGroups(resultText),
        portionAdvice: cleanAIText(
          data.portionAdvice ||
          resultText ||
          "Review the AI description and edit calories manually if needed."
        ),
        confidence: cleanAIText(data.confidence || "medium"),
      }));

      setAiStatus("AI analysis completed");
    } catch (error: any) {
      console.error("AI ERROR:", error);

      setMealForm((p) => ({
        ...p,
        notes: "Image analysis failed",
        calories: "",
        foodGroups: ["Analysis failed"],
        portionAdvice: cleanAIText(error?.message || "Please check your connection and try again."),
        confidence: "low",
      }));

      setAiStatus("AI request failed");
    } finally {
      setAiLoading(false);
    }
  }

  async function addMeal() {
    try {
      const foodGroups = mealForm.foodGroups.length
        ? mealForm.foodGroups
        : estimateFoodGroups(mealForm.notes);

      const cleanNotes = cleanAIText(mealForm.notes);
      const cleanAdvice = cleanAIText(mealForm.portionAdvice);
      const cleanConfidence = cleanAIText(mealForm.confidence || "medium");

      const nutrition = estimateNutritionScore(
        cleanNotes + " " + cleanAdvice,
        Number(mealForm.calories || 0)
      );

      const record: MealRecord = {
        id: Date.now(),
        date: today,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
        category: mealForm.category,
        calories: Number(mealForm.calories || 0),
        notes: cleanNotes,
        image: mealForm.imageName,
        foodGroups,
        portionAdvice: cleanAdvice,
        confidence: cleanConfidence,
        ...nutrition,
      };

      const nextMeals = [record, ...meals];

      setMeals(nextMeals);
      saveEHR(profile, nextMeals, weights, sleepRecords, activityUpdates);

      const currentBmi =
        profile.weight && profile.height
          ? Number(profile.weight) /
            ((Number(profile.height) / 100) *
              (Number(profile.height) / 100))
          : null;

      const age = Number(profile.age || calcAge(profile.dob) || 0);

      let ageBand = "Unknown";

      if (age > 0 && age < 18) ageBand = "Under 18";
      else if (age >= 18 && age < 30) ageBand = "18-29";
      else if (age >= 30 && age < 45) ageBand = "30-44";
      else if (age >= 45 && age < 60) ageBand = "45-59";
      else if (age >= 60) ageBand = "60+";

      const mealData = {
        user_email: profile.email || "",
        meal_type: mealForm.category || "Meal",
        calories: Number(mealForm.calories || 0),
        detected_groups: foodGroups.join(", "),
        advice: cleanAdvice,
        confidence: cleanConfidence,
        visible_food: cleanNotes,
        gender: profile.gender || "",
        age_band: ageBand,
        weight: Number(profile.weight || 0) || null,
        height: Number(profile.height || 0) || null,
        bmi: currentBmi || null,
        ...nutrition,
      };

      const res = await fetch("/api/save-meal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(mealData),
      });

      const result = await res.json();

      if (!res.ok || !result.success) {
        console.error("SERVER SAVE ERROR:", result.error);
        alert("Server save failed: " + JSON.stringify(result.error));
        return;
      }

      alert("Meal saved successfully.");
    } catch (err) {
      console.error("ADD MEAL ERROR:", err);
      alert("Unexpected error while saving meal.");
    }
  }

  function updateWeight() {
    const newWeight = prompt("Enter new weight in kg");
    if (!newWeight) return;
    const nextProfile = { ...profile, weight: newWeight };
    const nextWeights = [...weights, { date: today, weight: Number(newWeight), bmi: Number(calcBMI(newWeight, profile.height) || 0) }];
    setWeights(nextWeights);
    setProfile(nextProfile);
    saveEHR(nextProfile, meals, nextWeights, sleepRecords, activityUpdates);
  }

  function updateSleep() {
    const newSleep = prompt("Enter sleep hours last night, example: 6.5");

    if (!newSleep) return;

    const value = Number(newSleep);

    if (!value || value < 0 || value > 24) {
      alert("Please enter a valid number of hours.");
      return;
    }

    const nextSleep = [
      ...sleepRecords,
      {
        date: today,
        hours: `${value} hours`,
        value,
      },
    ];

    setSleepRecords(nextSleep);
    saveEHR(profile, meals, weights, nextSleep, activityUpdates);

    alert("Sleep update saved.");
  }

  const mealPlan = [
    {
      day: "Monday",
      meals: [
        { meal: "Breakfast", food: "Greek yoghurt, berries and oats", portion: "1 cup yoghurt + ½ cup berries + ¼ cup oats", kcal: 380 },
        { meal: "Lunch", food: "Chicken salad bowl", portion: "120g chicken + 2 cups salad + 1 tablespoon olive oil", kcal: 520 },
        { meal: "Dinner", food: "Fish, vegetables and small starch", portion: "150g fish + 2 cups vegetables + ½ cup rice", kcal: 560 },
        { meal: "Snack", food: "Apple with peanut butter", portion: "1 apple + 1 tablespoon peanut butter", kcal: 210 },
      ],
    },
    {
      day: "Tuesday",
      meals: [
        { meal: "Breakfast", food: "Eggs and toast", portion: "2 eggs + 1 slice wholewheat toast + tomato", kcal: 350 },
        { meal: "Lunch", food: "Tuna wrap", portion: "1 wholewheat wrap + 100g tuna + salad", kcal: 480 },
        { meal: "Dinner", food: "Lean mince, rice and vegetables", portion: "120g lean mince + ½ cup rice + 2 cups vegetables", kcal: 600 },
        { meal: "Snack", food: "Plain yoghurt", portion: "¾ cup yoghurt + cinnamon", kcal: 160 },
      ],
    },
    {
      day: "Wednesday",
      meals: [
        { meal: "Breakfast", food: "Oats with banana", portion: "40g oats + ½ banana + 1 tablespoon seeds", kcal: 360 },
        { meal: "Lunch", food: "Chicken wrap", portion: "1 wrap + 120g chicken + salad", kcal: 510 },
        { meal: "Dinner", food: "Steak and vegetables", portion: "150g steak + 2 cups vegetables + ½ sweet potato", kcal: 640 },
        { meal: "Snack", food: "Boiled eggs", portion: "2 boiled eggs", kcal: 150 },
      ],
    },
    {
      day: "Thursday",
      meals: [
        { meal: "Breakfast", food: "Smoothie bowl", portion: "1 scoop protein + ½ banana + ½ cup berries", kcal: 340 },
        { meal: "Lunch", food: "Bean and chicken salad", portion: "100g chicken + ½ cup beans + 2 cups salad", kcal: 530 },
        { meal: "Dinner", food: "Grilled hake and vegetables", portion: "150g hake + 2 cups vegetables + ½ cup starch", kcal: 540 },
        { meal: "Snack", food: "Carrot sticks and hummus", portion: "1 cup carrots + 2 tablespoons hummus", kcal: 180 },
      ],
    },
    {
      day: "Friday",
      meals: [
        { meal: "Breakfast", food: "Cottage cheese toast", portion: "1 slice toast + ½ cup cottage cheese", kcal: 330 },
        { meal: "Lunch", food: "Chicken protein bowl", portion: "120g chicken + ½ cup rice + 2 cups salad", kcal: 560 },
        { meal: "Dinner", food: "Turkey or lean burger bowl", portion: "120g patty + salad + ½ cup potato wedges", kcal: 620 },
        { meal: "Snack", food: "Fruit and nuts", portion: "1 fruit + 10 almonds", kcal: 190 },
      ],
    },
    {
      day: "Saturday",
      meals: [
        { meal: "Breakfast", food: "Omelette", portion: "2 eggs + vegetables + ¼ avocado", kcal: 390 },
        { meal: "Lunch", food: "Grilled chicken and pap", portion: "120g chicken + ½ cup pap + chakalaka/salad", kcal: 580 },
        { meal: "Dinner", food: "Salmon or pilchards with vegetables", portion: "150g fish + 2 cups vegetables", kcal: 590 },
        { meal: "Snack", food: "Greek yoghurt", portion: "1 cup yoghurt", kcal: 170 },
      ],
    },
    {
      day: "Sunday",
      meals: [
        { meal: "Breakfast", food: "High-protein oats", portion: "40g oats + 1 scoop protein or ½ cup yoghurt", kcal: 420 },
        { meal: "Lunch", food: "Roast chicken plate", portion: "120g chicken + 2 cups vegetables + ½ cup starch", kcal: 620 },
        { meal: "Dinner", food: "Light soup and protein", portion: "2 cups vegetable soup + 100g chicken/beans", kcal: 460 },
        { meal: "Snack", food: "Apple or berries", portion: "1 apple or 1 cup berries", kcal: 100 },
      ],
    },
  ];

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: 16,
    borderRadius: 20,
    border: "1px solid #dbe3ea",
    fontSize: 16,
    marginTop: 6,
    background: "#fff",
  };

  const cardStyle: React.CSSProperties = {
    background: "rgba(255,255,255,0.92)",
    borderRadius: 30,
    padding: 22,
    marginBottom: 18,
    boxShadow: "0 18px 45px rgba(2,6,23,0.10)",
    border: "1px solid rgba(255,255,255,0.7)",
  };

  const buttonStyle: React.CSSProperties = {
    width: "100%",
    padding: 17,
    borderRadius: 999,
    border: "none",
    background: "linear-gradient(135deg,#16a34a,#22c55e)",
    color: "white",
    fontSize: 17,
    fontWeight: 900,
    cursor: "pointer",
    boxShadow: "0 12px 25px rgba(34,197,94,.25)",
  };

  const darkButtonStyle: React.CSSProperties = {
    ...buttonStyle,
    background: "linear-gradient(135deg,#0f172a,#334155)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontWeight: 800,
    color: "#334155",
    marginBottom: 14,
  };

  const pill = (text: string) => (
    <span key={text} style={{
      display: "inline-block",
      background: "#dcfce7",
      color: "#047857",
      borderRadius: 999,
      padding: "7px 10px",
      fontWeight: 800,
      fontSize: 12,
      margin: 3,
    }}>
      {text}
    </span>
  );

  const navButton = (name: string, label: string) => (
    <button onClick={() => setScreen(name)} style={{
      border: "none",
      borderRadius: 18,
      padding: 11,
      fontSize: 12,
      fontWeight: 900,
      color: screen === name ? "#047857" : "#64748b",
      background: screen === name ? "#dcfce7" : "transparent",
    }}>
      {label}
    </button>
  );

  const barGraph = (data: any[], key: string, color: string, suffix = "") => {
    const clean = data.filter((d) => Number(d[key]) > 0).slice(-7);
    if (!clean.length) return <p>No tracking data yet.</p>;
    const max = Math.max(...clean.map((d) => Number(d[key])));
    return (
      <div style={{ display: "flex", alignItems: "end", gap: 8, height: 170, paddingTop: 12 }}>
        {clean.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <b style={{ fontSize: 11 }}>{d[key]}{suffix}</b>
            <div style={{
              height: Math.max(18, (Number(d[key]) / max) * 115),
              background: color,
              borderRadius: "14px 14px 6px 6px",
              boxShadow: "0 10px 18px rgba(0,0,0,.12)",
            }} />
            <small style={{ fontSize: 10 }}>{String(d.date).slice(5)}</small>
          </div>
        ))}
      </div>
    );
  };

  const sleepGraph = () => {
    const clean = sleepRecords.map((r) => ({ ...r, value: sleepCategoryToHours(r.hours) })).filter((r) => r.value > 0).slice(-7);
    if (!clean.length) return <p>No tracking data yet.</p>;
    const max = Math.max(...clean.map((r) => r.value));
    return (
      <div style={{ display: "flex", alignItems: "end", gap: 8, height: 170, paddingTop: 12 }}>
        {clean.map((d, i) => (
          <div key={i} style={{ flex: 1, textAlign: "center" }}>
            <b style={{ fontSize: 11 }}>{d.value}h</b>
            <div style={{
              height: Math.max(18, (d.value / max) * 115),
              background: "linear-gradient(180deg,#38bdf8,#0369a1)",
              borderRadius: "14px 14px 6px 6px",
              boxShadow: "0 10px 18px rgba(0,0,0,.12)",
            }} />
            <small style={{ fontSize: 10 }}>{String(d.date).slice(5)}</small>
          </div>
        ))}
      </div>
    );
  };

  return (
    <main style={{
      minHeight: "100vh",
      background: "radial-gradient(circle at top left,#bbf7d0,#f1f5f9 35%,#e0f2fe)",
      color: "#0f172a",
      fontFamily: "Arial, sans-serif",
    }}>
      <div style={{ maxWidth: 480, margin: "0 auto", paddingBottom: 94 }}>
        {screen === "landing" && (
          <section style={{
            minHeight: "100vh",
            background: "linear-gradient(160deg,#041014,#0f172a 55%,#064e3b)",
            padding: 24,
            color: "white",
          }}>
            <h1 style={{ fontSize: 46, marginBottom: 8 }}>CalGPT</h1>
            <p style={{ color: "#bbf7d0", fontWeight: 800 }}>AI nutrition EHR and calorie tracker</p>

            <div style={{ ...cardStyle, background: "rgba(255,255,255,0.10)", color: "white" }}>
              <h2 style={{ fontSize: 36, lineHeight: 1.05 }}>Fight food noise. Build healthier habits.</h2>
              <p style={{ color: "#e2e8f0", marginTop: 16 }}>
                Anyone in the world can click the link and use CalGPT. Capture meals, identify food groups, track BMI, sleep, weight and generate patient progress reports.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginTop: 24 }}>
                {["📸 Food AI", "🩺 EHR", "📊 Reports"].map((item) => (
                  <div key={item} style={{
                    background: "white",
                    color: "#0f172a",
                    borderRadius: 22,
                    padding: 14,
                    textAlign: "center",
                    fontWeight: 900,
                  }}>
                    {item}
                  </div>
                ))}
              </div>

              <button style={{ ...buttonStyle, marginTop: 28 }} onClick={() => setScreen("enroll")}>First-time enrolment</button>
              <button style={{ ...buttonStyle, marginTop: 12, background: "transparent", border: "1px solid white", boxShadow: "none" }} onClick={() => setScreen("login")}>Login</button>
              <button style={{ ...buttonStyle, marginTop: 12, background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,.45)", boxShadow: "none" }} onClick={() => setScreen("reset")}>Forgot / reset password</button>
              <button style={{ ...buttonStyle, marginTop: 12, background: "rgba(187,247,208,0.16)", border: "1px solid rgba(187,247,208,.55)", boxShadow: "none" }} onClick={installApp}>
                {isStandalone ? "CalGPT is installed" : "Download app icon"}
              </button>

              <div style={{ marginTop: 22, textAlign: "center", fontSize: 14 }}>
                <a href="/privacy-policy" style={{ color: "#bbf7d0", marginRight: 16, textDecoration: "none", fontWeight: 800 }}>
                  Privacy Policy
                </a>
                <a href="/terms-and-conditions" style={{ color: "#bbf7d0", textDecoration: "none", fontWeight: 800 }}>
                  Terms & Conditions
                </a>
              </div>
            </div>

            <div style={{ ...cardStyle, color: "#0f172a" }}>
              <h2>About us</h2>
              <p>CalGPT was built for people struggling to fight the food noise, trying to eat healthier, and hopefully lose weight in a practical and supportive way.</p>
            </div>
          </section>
        )}

        {screen === "login" && (
          <section style={{ padding: 24 }}>
            <h1 style={{ fontSize: 38 }}>Login</h1>
            <p>Access your saved CalGPT EHR.</p>
            <div style={cardStyle}>
              <label style={labelStyle}>Email
                <input style={inputStyle} value={login.email} onChange={(e) => setLogin({ ...login, email: e.target.value })} />
              </label>
              <label style={labelStyle}>Password
                <input style={inputStyle} type="password" value={login.password} onChange={(e) => setLogin({ ...login, password: e.target.value })} />
              </label>
              <button style={buttonStyle} onClick={loginUser}>Login</button>
              <button style={{ ...buttonStyle, marginTop: 12, background: "#0f172a" }} onClick={() => setScreen("reset")}>Forgot / reset password</button>
            </div>
          </section>
        )}

        {screen === "reset" && (
          <section style={{ padding: 24 }}>
            <h1 style={{ fontSize: 38 }}>Reset password</h1>
            <p>Reset or create a password for the profile saved on this device. New users can create a password and then complete enrolment.</p>
            <div style={cardStyle}>
              <label style={labelStyle}>Registered email
                <input style={inputStyle} value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} />
              </label>
              <label style={labelStyle}>New password
                <input style={inputStyle} type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              </label>
              <button style={buttonStyle} onClick={resetPassword}>Reset password</button>
              <button style={{ ...buttonStyle, marginTop: 12, background: "#0f172a" }} onClick={() => setScreen("landing")}>Back to home</button>
            </div>
          </section>
        )}

        {screen === "enroll" && (
          <section style={{ padding: 20 }}>
            <h1 style={{ fontSize: 36 }}>First-time enrolment</h1>
            <p>Create your patient profile and EHR.</p>
            <div style={cardStyle}>
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
              <label style={labelStyle}>Target weight kg<input style={inputStyle} value={(profile as any).targetWeight} onChange={(e) => setProfile({ ...profile, targetWeight: e.target.value } as any)} /></label>
              <label style={labelStyle}>Target date<input style={inputStyle} type="date" value={(profile as any).targetDate} onChange={(e) => setProfile({ ...profile, targetDate: e.target.value } as any)} /></label>
              <label style={labelStyle}>Dietary preference<select style={inputStyle} value={(profile as any).dietaryPreference} onChange={(e) => setProfile({ ...profile, dietaryPreference: e.target.value } as any)}><option>Balanced</option><option>High protein</option><option>Lower carb</option><option>Vegetarian</option><option>Budget friendly</option><option>South African foods</option></select></label>

              <div style={{ background: "linear-gradient(135deg,#ecfdf5,#dbeafe)", borderRadius: 24, padding: 20, marginBottom: 18 }}>
                <p style={{ fontWeight: 900 }}>BMI</p>
                <p style={{ fontSize: 50, fontWeight: 950, color: "#22c55e", margin: 0 }}>{bmi || "--"}</p>
                <p>{bmiLabel(bmi)}</p>
              </div>

              <label style={labelStyle}>Sleep per night average<select style={inputStyle} value={profile.sleepAverage} onChange={(e) => setProfile({ ...profile, sleepAverage: e.target.value })}>{sleepOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label style={labelStyle}>Goal<select style={inputStyle} value={profile.goal} onChange={(e) => setProfile({ ...profile, goal: e.target.value })}><option>Weight loss</option><option>Maintain weight</option><option>Muscle gain</option><option>Medical nutrition support</option></select></label>
              <label style={labelStyle}>Activity level<select style={inputStyle} value={profile.activity} onChange={(e) => setProfile({ ...profile, activity: e.target.value })}><option>Sedentary</option><option>Light</option><option>Moderate</option><option>Active</option></select></label>
              <label style={labelStyle}>Allergies<select style={inputStyle} value={profile.allergies} onChange={(e) => setProfile({ ...profile, allergies: e.target.value })}>{allergyOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label style={labelStyle}>Exercise history<select style={inputStyle} value={profile.exerciseHistory} onChange={(e) => setProfile({ ...profile, exerciseHistory: e.target.value })}>{exerciseOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label style={labelStyle}>Eating habits<select style={inputStyle} value={profile.eatingHabits} onChange={(e) => setProfile({ ...profile, eatingHabits: e.target.value })}>{eatingHabitOptions.map((x) => <option key={x}>{x}</option>)}</select></label>
              <label style={labelStyle}>Medical conditions<input style={inputStyle} value={profile.conditions} onChange={(e) => setProfile({ ...profile, conditions: e.target.value })} /></label>
              <label style={labelStyle}>Current medication<input style={inputStyle} value={profile.medications} onChange={(e) => setProfile({ ...profile, medications: e.target.value })} /></label>
              <label style={labelStyle}>Water intake<select style={inputStyle} value={profile.waterIntake} onChange={(e) => setProfile({ ...profile, waterIntake: e.target.value })}>{waterOptions.map((x) => <option key={x}>{x}</option>)}</select></label>

              <label style={{ display: "flex", gap: 10, marginBottom: 18 }}>
                <input type="checkbox" checked={profile.consent} onChange={(e) => setProfile({ ...profile, consent: e.target.checked })} />
                <span>
                  I confirm that I am 18 or older and consent to storing my health profile, meal images and calorie records. I agree to the <a href="/terms-and-conditions" style={{ color: "#047857", fontWeight: 900 }}>Terms</a> and <a href="/privacy-policy" style={{ color: "#047857", fontWeight: 900 }}>Privacy Policy</a>.
                </span>
              </label>

              <label style={labelStyle}>Create password<input style={inputStyle} type="password" value={profile.password} onChange={(e) => setProfile({ ...profile, password: e.target.value })} /></label>
              <label style={labelStyle}>Confirm password<input style={inputStyle} type="password" value={profile.confirmPassword} onChange={(e) => setProfile({ ...profile, confirmPassword: e.target.value })} /></label>
              <button style={buttonStyle} onClick={submitEnrollment}>Submit enrolment</button>
            </div>
          </section>
        )}

        {screen === "dashboard" && (
          <section style={{ padding: 20 }}>
            <div style={{ ...cardStyle, background: "linear-gradient(135deg,#061115,#064e3b)", color: "white" }}>
              <p style={{ color: "#bbf7d0", fontWeight: 900 }}>Home</p>
              <h1 style={{ fontSize: 36 }}>{profile.fullName || "Patient"}</h1>
              <p>{profile.goal} • BMI {bmi || "--"} • Sleep: {avgSleep}</p>
              <button style={{ ...buttonStyle, background: "white", color: "#0f172a", marginTop: 14, boxShadow: "none" }} onClick={logout}>Logout</button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <div style={cardStyle}><p>Today’s Calories</p><h2 style={{ fontSize: 40, color: "#22c55e" }}>{todayCalories}</h2><p>kcal</p></div>
              <div style={cardStyle}><p>Meals Today</p><h2 style={{ fontSize: 40 }}>{todayMeals.length}</h2><p>records</p></div>
            </div>

            <div style={cardStyle}>
              <h2>Today’s food diary</h2>
              {todayMeals.length === 0 ? <p>No meals captured today.</p> : todayMeals.map((m) => (
                <div key={m.id} style={{ borderBottom: "1px solid #e2e8f0", padding: "10px 0" }}>
                  <b>{m.category}</b> • {m.calories} kcal<br />
                  <small>{m.time} • {m.foodGroups?.join(", ")}</small>
                </div>
              ))}
            </div>

            <div style={{ ...cardStyle, background: "#ecfdf5" }}>
              <h2>AI Insight</h2>
              <p>{aiStatus}</p>
            </div>

            <div style={{ ...cardStyle, background: "#f8fafc" }}>
              <h2>Daily reminder</h2>
              <p>Log your latest meal, water intake, sleep and weight updates so CalGPT can keep your weekly plan and progress report accurate.</p>
              <button style={{ ...buttonStyle, marginTop: 8 }} onClick={() => setScreen("scanner")}>
                Log latest meal
              </button>
              <button style={{ ...buttonStyle, marginTop: 10, background: "#0f172a" }} onClick={updateSleep}>
                Log sleep
              </button>
            </div>
          </section>
        )}

        {screen === "ehr" && (
          <section style={{ padding: 20 }}>
            <h1 style={{ fontSize: 36 }}>Patient EHR</h1>
            <div style={cardStyle}>
              <b>Name:</b> {profile.fullName}<br />
              <b>DOB:</b> {profile.dob}<br />
              <b>Mobile:</b> {profile.dialCode} {profile.mobile}<br />
              <b>Address:</b> {profile.address}, {profile.country}
            </div>

            <div style={cardStyle}>
              <b>Conditions:</b> {profile.conditions || "None recorded"}<br />
              <b>Medication:</b> {profile.medications || "None recorded"}<br />
              <b>Allergies:</b> {profile.allergies || "None recorded"}<br />
              <b>Exercise:</b> {profile.exerciseHistory}<br />
              <b>Eating habits:</b> {profile.eatingHabits}<br />
              <b>Water intake:</b> {profile.waterIntake}
            </div>

            <div style={cardStyle}><h2>Weight tracking</h2>{barGraph(weights, "weight", "linear-gradient(180deg,#22c55e,#15803d)", "kg")}</div>
            <div style={cardStyle}><h2>BMI tracking</h2>{barGraph(weights, "bmi", "linear-gradient(180deg,#0f172a,#334155)")}</div>
            <div style={cardStyle}>
              <h2>Weekly sleep tracker</h2>
              <p>Average sleep per night: <b>{avgSleep}</b></p>
              {sleepGraph()}
              <button style={{ ...buttonStyle, marginTop: 12, background: "#0f172a" }} onClick={updateSleep}>
                Add sleep update
              </button>
            </div>
            <button style={buttonStyle} onClick={updateWeight}>Add weight update</button>
          </section>
        )}

        {screen === "scanner" && (
          <section style={{ padding: 20 }}>
            <h1 style={{ fontSize: 36 }}>Meal Photo Scanner</h1>

            {mealForm.imageBase64 && (
              <div style={{ ...cardStyle, background: "#020617", padding: 12, overflow: "hidden" }}>
                <div style={{ background: "#0f172a", color: "white", padding: 12, borderRadius: 18, textAlign: "center", fontWeight: 900, marginBottom: 10 }}>SnapCalorie</div>
                <img src={mealForm.imageBase64} alt="Selected meal" style={{ width: "100%", maxHeight: 320, objectFit: "cover", borderRadius: 22, display: "block" }} />
                <button style={{ ...darkButtonStyle, marginTop: 12 }} onClick={submitImageForAI} disabled={aiLoading}>
                  {aiLoading ? "Analyzing..." : "Tap anywhere to analyze"}
                </button>
              </div>
            )}

            <div style={cardStyle}>
              <label style={labelStyle}>Meal category
                <select style={inputStyle} value={mealForm.category} onChange={(e) => setMealForm({ ...mealForm, category: e.target.value })}>
                  <option>Breakfast</option><option>Lunch</option><option>Dinner</option><option>Snack</option>
                </select>
              </label>

              <input type="file" accept="image/*" capture="environment" style={{ ...inputStyle, marginBottom: 12 }} onChange={(e) => handleImage(e.target.files?.[0])} />

              {!mealForm.imageBase64 && (
                <button style={{ ...darkButtonStyle, marginBottom: 16 }} onClick={submitImageForAI} disabled={aiLoading}>
                  {aiLoading ? "Analyzing..." : "Submit image for AI analysis"}
                </button>
              )}

              <div style={{ background: "linear-gradient(135deg,#f8fafc,#ecfdf5)", borderRadius: 20, padding: 16, marginBottom: 14 }}>
                <b>Food group interpreter:</b><br />
                {(mealForm.foodGroups.length ? mealForm.foodGroups : ["Upload a food image to analyze"]).map(pill)}
                <p style={{ fontSize: 13 }}>{aiStatus}</p>

                <label style={labelStyle}>Estimated calories
                  <input style={inputStyle} value={mealForm.calories} placeholder="AI estimate will appear here" onChange={(e) => setMealForm({ ...mealForm, calories: e.target.value })} />
                </label>

                <label style={labelStyle}>Describe visible food on plate
                  <input style={inputStyle} value={mealForm.notes} placeholder="AI description will appear here" onChange={(e) => setMealForm({ ...mealForm, notes: e.target.value, foodGroups: e.target.value ? estimateFoodGroups(e.target.value) : [] })} />
                </label>

                {mealForm.portionAdvice && <p style={{ fontSize: 14, marginTop: 10 }}><strong>Clinical advice:</strong> {mealForm.portionAdvice}</p>}
                {mealForm.confidence && <p style={{ fontSize: 12, fontWeight: 900, textTransform: "uppercase", color: "#64748b" }}>Confidence: {mealForm.confidence}</p>}
              </div>

              <button style={buttonStyle} onClick={addMeal}>Save this AI result to meal history</button>
            </div>

            <h2 style={{ marginLeft: 4 }}>Daily food diary and meal history</h2>
            {meals.map((m) => (
              <div style={cardStyle} key={m.id}>
                <h3>{m.category} • {m.calories} kcal</h3>
                <p>{m.date} at {m.time}</p>
                <p>{cleanAIText(m.notes)}</p>
                <p><b>Detected groups:</b> {m.foodGroups?.join(", ")}</p>
                {m.portionAdvice && <p><b>Portion advice:</b> {cleanAIText(m.portionAdvice)}</p>}
                {m.confidence && <p><b>Confidence:</b> {m.confidence}</p>}
                {m.health_score !== undefined && (
                  <div style={{ marginTop: 12, background: "#f8fafc", borderRadius: 16, padding: 12 }}>
                    <p><b>Health score:</b> {m.health_score}/100</p>
                    <p><b>Macros:</b> Protein {m.protein_g}g • Carbs {m.carbs_g}g • Fat {m.fat_g}g</p>
                    <p><b>Sugar/Fibre:</b> Sugar {m.sugar_g}g • Fibre {m.fibre_g}g</p>
                    <p><b>Weight loss:</b> {m.weight_loss_friendly} • <b>Diabetes:</b> {m.diabetes_friendly}</p>
                    <p><b>Risk flag:</b> {m.risk_flag}</p>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {screen === "planner" && (
          <section style={{ padding: 20 }}>
            <h1 style={{ fontSize: 36 }}>AI Weekly Meal Planner</h1>
            <p>Based on {profile.goal}, BMI {bmi || "--"}, {profile.activity} activity and your uploaded calorie tracker patterns.</p>

            <div style={{ ...cardStyle, background: "linear-gradient(135deg,#dcfce7,#ecfeff)" }}>
              <h2>Personal targets</h2>
              <p><b>Current weight:</b> {profile.weight || "--"} kg</p>
              <p><b>Target weight:</b> {(profile as any).targetWeight || "--"} kg</p>
              <p><b>Target date:</b> {(profile as any).targetDate || "Not set"}</p>
              <p><b>Weight to lose:</b> {weightToLose || "--"} kg</p>
              <p><b>Weekly target:</b> {weeklyLossTarget || "--"} kg/week</p>
              <p><b>Target calories:</b> {targetCalories} kcal/day</p>
              <p><b>Protein target:</b> {proteinTarget}g/day</p>
              <p><b>Diet preference:</b> {(profile as any).dietaryPreference || "Balanced"}</p>
              <p style={{ color: weeklyLossTarget > 1 ? "#b91c1c" : "#047857", fontWeight: 900 }}>{calorieWarning}</p>
            </div>

            <div style={{ ...cardStyle, background: "#f0fdf4" }}>
              <h2>AI interpretation logic</h2>
              <p>CalGPT looks at uploaded meal photos, estimated calories, food groups, visible portion size, BMI, activity level, allergies and weight goals to suggest safer portions.</p>
              <p><b>Example:</b> if a meal is above your target, CalGPT may suggest reducing starch by 50%, increasing vegetables, or swapping sugary drinks for water.</p>
            </div>

            {mealPlan.map((dayPlan) => (
              <div style={cardStyle} key={dayPlan.day}>
                <h2 style={{ color: "#16a34a", marginBottom: 18 }}>{dayPlan.day}</h2>

                {dayPlan.meals.map((item) => (
                  <div key={`${dayPlan.day}-${item.meal}`} style={{ borderBottom: "1px solid #e2e8f0", paddingBottom: 14, marginBottom: 14 }}>
                    <h3>{item.meal}</h3>
                    <p><b>Food:</b> {item.food}</p>
                    <p><b>Portion:</b> {item.portion}</p>
                    <p><b>Calories:</b> {item.kcal} kcal</p>
                    {item.kcal > targetCalories / 3 && (
                      <p style={{ color: "#b45309", fontWeight: 900 }}>
                        Portion note: keep starch controlled and add extra vegetables.
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ))}

            <div style={{ ...cardStyle, background: "#fff7ed" }}>
              <h2>Important health note</h2>
              <p>This plan is general wellness guidance only. It is not medical advice. Users with diabetes, pregnancy, kidney disease, eating disorders, allergies or chronic illness should consult a qualified healthcare professional.</p>
            </div>
          </section>
        )}

        {screen === "report" && (
          <section style={{ padding: 20 }}>
            <h1 style={{ fontSize: 36 }}>Monthly Report</h1>
            <div style={cardStyle}>
              <h2>{profile.fullName}</h2>
              <p>DOB: {profile.dob}</p>
              <p>Age: {calcAge(profile.dob)}</p>
              <p>BMI: {bmi || "--"} - {bmiLabel(bmi)}</p>
              <p>Weight: {profile.weight || "--"} kg</p>
              <p>Average sleep: {avgSleep}</p>
              <p>Goal: {profile.goal}</p>
              <p>Total meals captured: {meals.length}</p>
              <p>Total calories logged: {totalCalories}</p>
              <p>Average daily calories: {avgDaily}</p>
              <div style={{ background: "#ecfdf5", borderRadius: 20, padding: 18, marginTop: 16 }}>
                <h3>AI Progress Summary</h3>
                <p>The patient has logged {meals.length} meal records. Continue structured meal logging, portion control, water intake monitoring, sleep tracking and weekly weight updates.</p>
              </div>
              <button style={{ ...buttonStyle, marginTop: 16, background: "#0f172a" }} onClick={() => window.print()}>Print / Save Report</button>
            </div>
          </section>
        )}

        {!["landing", "login", "enroll"].includes(screen) && (
          <nav style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "rgba(255,255,255,.92)",
            backdropFilter: "blur(12px)",
            borderTop: "1px solid #e2e8f0",
            padding: 8,
          }}>
            <div style={{ maxWidth: 480, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
              {navButton("dashboard", "Home")}
              {navButton("ehr", "EHR")}
              {navButton("scanner", "Scan")}
              {navButton("planner", "Plan")}
              {navButton("report", "Report")}
            </div>
          </nav>
        )}
      </div>
    </main>
  );
}
