export default function Home() {
  return (
    <main style={{
      minHeight: "100vh",
      background: "#F9FAFB",
      fontFamily: "Arial, sans-serif",
      color: "#111827"
    }}>
      <section style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 40,
        padding: "60px",
        alignItems: "center"
      }}>
        <div style={{
          background: "#071118",
          color: "white",
          borderRadius: 28,
          padding: 50
        }}>
          <h1 style={{ fontSize: 64, margin: 0 }}>
            Cal<span style={{ color: "#22C55E" }}>GPT</span>
          </h1>

          <p style={{ fontSize: 26, marginTop: 20 }}>
            Track <span style={{ color: "#22C55E" }}>Smarter.</span> Eat{" "}
            <span style={{ color: "#22C55E" }}>Better.</span> Live{" "}
            <span style={{ color: "#22C55E" }}>Healthier.</span>
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 20,
            marginTop: 40
          }}>
            {["Track Calories", "Plan Meals", "Analyze Progress", "AI Insights"].map((item) => (
              <div key={item} style={{ textAlign: "center", color: "#86EFAC" }}>
                <div style={{ fontSize: 32 }}>●</div>
                <p style={{ color: "white", fontSize: 14 }}>{item}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <span style={{
            background: "#22C55E",
            color: "white",
            padding: "10px 18px",
            borderRadius: 999,
            fontWeight: 700
          }}>
            ABOUT CALGPT
          </span>

          <h2 style={{ fontSize: 42, marginTop: 24 }}>
            Your AI-powered calorie tracking assistant
          </h2>

          <p style={{ fontSize: 20, lineHeight: 1.7, color: "#374151" }}>
            CalGPT helps users scan meals, track calories, understand nutrition,
            monitor progress and receive personalized AI-powered meal plans.
          </p>

          <div style={{
            marginTop: 30,
            background: "white",
            borderRadius: 28,
            padding: 28,
            boxShadow: "0 20px 40px rgba(0,0,0,0.08)"
          }}>
            <h3>Today’s Progress</h3>
            <h1 style={{ color: "#22C55E" }}>1,260 kcal</h1>
            <p>Goal: 2,000 kcal</p>
            <p><strong>AI Insight:</strong> You’re on track today. Keep it up 💚</p>
          </div>
        </div>
      </section>

      <section style={{
        background: "#052E1A",
        color: "white",
        padding: 50,
        margin: 60,
        borderRadius: 28
      }}>
        <h2>CalGPT in Action</h2>

        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 24,
          marginTop: 30
        }}>
          {[
            "Snap or scan your food",
            "AI calorie detection",
            "Track your progress",
            "Personalized meal plans"
          ].map((item) => (
            <div key={item} style={{
              background: "white",
              color: "#111827",
              borderRadius: 24,
              padding: 24,
              minHeight: 180
            }}>
              <h3>{item}</h3>
              <p style={{ color: "#6B7280" }}>
                Simple, smart and designed for everyday health tracking.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
