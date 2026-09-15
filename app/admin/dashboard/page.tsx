"use client";

import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

type UserRow = {
  id?: string;
  email?: string;
  full_name?: string;
  age?: number;
  gender?: string;
  country?: string;
  bmi?: number;
  goal?: string;
  created_at?: string;
};

type MealRow = {
  id?: string | number;
  user_email?: string;
  meal_type?: string;
  calories?: number;
  detected_groups?: string;
  visible_food?: string;
  gender?: string;
  age_band?: string;
  weight?: number;
  height?: number;
  bmi?: number;
  protein_g?: number;
  carbs_g?: number;
  fat_g?: number;
  sugar_g?: number;
  fibre_g?: number;
  health_score?: number;
  weight_loss_friendly?: string;
  diabetes_friendly?: string;
  risk_flag?: string;
  created_at?: string;
};

function numberValue(value: any) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

function percent(
  value: number,
  total: number
) {
  if (!total) return 0;

  return Math.round(
    (value / total) * 100
  );
}

function monthKey(date?: string) {
  if (!date) return "Unknown";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "Unknown";
  }

  return d.toLocaleDateString(
    "en-ZA",
    {
      month: "short",
      year: "2-digit",
    }
  );
}

function formatDate(date?: string) {
  if (!date) return "--";

  const d = new Date(date);

  if (Number.isNaN(d.getTime())) {
    return "--";
  }

  return d.toLocaleDateString(
    "en-ZA",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  );
}

export default function AdminDashboard() {
  const [users, setUsers] =
    useState<UserRow[]>([]);

  const [meals, setMeals] =
    useState<MealRow[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [period, setPeriod] =
    useState("all");

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(
        "/api/admin-dashboard",
        {
          cache: "no-store",
        }
      );

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(
          data.error ||
            "Dashboard could not load"
        );
      }

      setUsers(data.users || []);
      setMeals(data.meals || []);
    } catch (err: any) {
      console.error(err);

      setError(
        err?.message ||
          "Dashboard could not load"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadDashboard();
  }, []);

  const cutoffDate = useMemo(() => {
    if (period === "all") {
      return null;
    }

    const days = Number(period);

    const d = new Date();

    d.setDate(
      d.getDate() - days
    );

    return d;
  }, [period]);

  const filteredMeals =
    useMemo(() => {
      if (!cutoffDate) return meals;

      return meals.filter((meal) => {
        if (!meal.created_at) {
          return false;
        }

        return (
          new Date(meal.created_at) >=
          cutoffDate
        );
      });
    }, [meals, cutoffDate]);

  const filteredUsers =
    useMemo(() => {
      if (!cutoffDate) return users;

      return users.filter((user) => {
        if (!user.created_at) {
          return false;
        }

        return (
          new Date(user.created_at) >=
          cutoffDate
        );
      });
    }, [users, cutoffDate]);

  const analytics = useMemo(() => {
    const totalUsers =
      filteredUsers.length;

    const totalMeals =
      filteredMeals.length;

    const uniqueActiveUsers =
      new Set(
        filteredMeals
          .map((x) =>
            x.user_email
              ?.trim()
              .toLowerCase()
          )
          .filter(Boolean)
      ).size;

    const avgCalories =
      totalMeals
        ? Math.round(
            filteredMeals.reduce(
              (sum, meal) =>
                sum +
                numberValue(
                  meal.calories
                ),
              0
            ) / totalMeals
          )
        : 0;

    const bmiRows =
      filteredMeals.filter(
        (x) =>
          numberValue(x.bmi) > 0
      );

    const avgBMI =
      bmiRows.length
        ? (
            bmiRows.reduce(
              (sum, meal) =>
                sum +
                numberValue(meal.bmi),
              0
            ) / bmiRows.length
          ).toFixed(1)
        : "0";

    const scoreRows =
      filteredMeals.filter(
        (x) =>
          numberValue(
            x.health_score
          ) > 0
      );

    const avgHealth =
      scoreRows.length
        ? Math.round(
            scoreRows.reduce(
              (sum, meal) =>
                sum +
                numberValue(
                  meal.health_score
                ),
              0
            ) / scoreRows.length
          )
        : 0;

    const diabetesFriendly =
      filteredMeals.filter(
        (x) =>
          String(
            x.diabetes_friendly
          ).toLowerCase() ===
          "yes"
      ).length;

    const weightFriendly =
      filteredMeals.filter(
        (x) =>
          String(
            x.weight_loss_friendly
          ).toLowerCase() ===
          "yes"
      ).length;

    const highRisk =
      filteredMeals.filter(
        (x) =>
          String(
            x.risk_flag
          ).toLowerCase() ===
          "high"
      ).length;

    return {
      totalUsers,
      totalMeals,
      uniqueActiveUsers,
      avgCalories,
      avgBMI,
      avgHealth,

      diabetesPercent:
        percent(
          diabetesFriendly,
          totalMeals
        ),

      weightPercent:
        percent(
          weightFriendly,
          totalMeals
        ),

      highRisk,
    };
  }, [
    filteredUsers,
    filteredMeals,
  ]);

  const genderStats =
    useMemo(() => {
      const map: Record<
        string,
        number
      > = {};

      filteredUsers.forEach(
        (user) => {
          const gender =
            user.gender ||
            "Unknown";

          map[gender] =
            (map[gender] || 0) + 1;
        }
      );

      return Object.entries(map)
        .map(([label, value]) => ({
          label,
          value,
        }))
        .sort(
          (a, b) =>
            b.value - a.value
        );
    }, [filteredUsers]);

  const ageStats = useMemo(() => {
    const map: Record<
      string,
      number
    > = {};

    filteredMeals.forEach(
      (meal) => {
        const band =
          meal.age_band ||
          "Unknown";

        map[band] =
          (map[band] || 0) + 1;
      }
    );

    return Object.entries(map)
      .map(([label, value]) => ({
        label,
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      );
  }, [filteredMeals]);

  const mealTypeStats =
    useMemo(() => {
      const map: Record<
        string,
        number
      > = {};

      filteredMeals.forEach(
        (meal) => {
          const type =
            meal.meal_type ||
            "Meal";

          map[type] =
            (map[type] || 0) + 1;
        }
      );

      return Object.entries(map)
        .map(([label, value]) => ({
          label,
          value,
        }))
        .sort(
          (a, b) =>
            b.value - a.value
        );
    }, [filteredMeals]);

  const riskStats = useMemo(() => {
    const map: Record<
      string,
      number
    > = {};

    filteredMeals.forEach(
      (meal) => {
        const risk =
          meal.risk_flag ||
          "Unknown";

        map[risk] =
          (map[risk] || 0) + 1;
      }
    );

    return Object.entries(map)
      .map(([label, value]) => ({
        label,
        value,
      }))
      .sort(
        (a, b) =>
          b.value - a.value
      );
  }, [filteredMeals]);

  const monthlyStats =
    useMemo(() => {
      const map: Record<
        string,
        {
          meals: number;
          users: Set<string>;
        }
      > = {};

      filteredMeals.forEach(
        (meal) => {
          const month =
            monthKey(
              meal.created_at
            );

          if (!map[month]) {
            map[month] = {
              meals: 0,
              users: new Set(),
            };
          }

          map[month].meals += 1;

          if (meal.user_email) {
            map[month].users.add(
              meal.user_email
                .toLowerCase()
            );
          }
        }
      );

      return Object.entries(map)
        .map(
          ([
            month,
            value,
          ]) => ({
            month,
            meals:
              value.meals,
            users:
              value.users.size,
          })
        )
        .slice(-12);
    }, [filteredMeals]);

  const foodGroups =
    useMemo(() => {
      const map: Record<
        string,
        number
      > = {};

      filteredMeals.forEach(
        (meal) => {
          String(
            meal.detected_groups ||
              ""
          )
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean)
            .forEach((group) => {
              map[group] =
                (map[group] || 0) +
                1;
            });
        }
      );

      return Object.entries(map)
        .map(([label, value]) => ({
          label,
          value,
        }))
        .sort(
          (a, b) =>
            b.value - a.value
        )
        .slice(0, 10);
    }, [filteredMeals]);

  const cardStyle:
    React.CSSProperties = {
    background: "#ffffff",
    borderRadius: 22,
    padding: 22,
    border:
      "1px solid #e2e8f0",
    boxShadow:
      "0 12px 35px rgba(15,23,42,.06)",
  };

  if (loading) {
    return (
      <main
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f8fafc",
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <h2>
          Loading CalGPT
          Analytics...
        </h2>
      </main>
    );
  }

  if (error) {
    return (
      <main
        style={{
          padding: 40,
          fontFamily:
            "Arial, sans-serif",
        }}
      >
        <h1>
          CalGPT Admin
        </h1>

        <p>{error}</p>

        <button
          onClick={loadDashboard}
        >
          Try again
        </button>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(180deg,#f8fafc,#ecfdf5)",
        padding: 28,
        fontFamily:
          "Arial, sans-serif",
        color: "#0f172a",
      }}
    >
      <div
        style={{
          maxWidth: 1450,
          margin: "0 auto",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            gap: 20,
            alignItems: "center",
            flexWrap: "wrap",
            marginBottom: 28,
          }}
        >
          <div>
            <p
              style={{
                color: "#16a34a",
                fontWeight: 900,
                marginBottom: 5,
              }}
            >
              CALGPT ANALYTICS
            </p>

            <h1
              style={{
                fontSize: 38,
                margin: 0,
              }}
            >
              Admin Dashboard
            </h1>

            <p
              style={{
                color: "#64748b",
              }}
            >
              User, nutrition and
              engagement analytics
            </p>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <select
              value={period}
              onChange={(e) =>
                setPeriod(
                  e.target.value
                )
              }
              style={{
                padding:
                  "12px 18px",
                borderRadius: 14,
                border:
                  "1px solid #cbd5e1",
                background: "white",
                fontWeight: 800,
              }}
            >
              <option value="all">
                All time
              </option>

              <option value="7">
                Last 7 days
              </option>

              <option value="30">
                Last 30 days
              </option>

              <option value="90">
                Last 90 days
              </option>
            </select>

            <button
              onClick={
                loadDashboard
              }
              style={{
                padding:
                  "12px 18px",
                borderRadius: 14,
                border: "none",
                background:
                  "#0f172a",
                color: "white",
                fontWeight: 900,
                cursor: "pointer",
              }}
            >
              Refresh
            </button>
          </div>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(180px,1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Metric
            label="Registered Users"
            value={
              analytics.totalUsers
            }
          />

          <Metric
            label="Active Users"
            value={
              analytics.uniqueActiveUsers
            }
          />

          <Metric
            label="Meal Scans"
            value={
              analytics.totalMeals
            }
          />

          <Metric
            label="Average Calories"
            value={
              analytics.avgCalories
            }
            suffix=" kcal"
          />

          <Metric
            label="Average BMI"
            value={
              analytics.avgBMI
            }
          />

          <Metric
            label="Health Score"
            value={
              analytics.avgHealth
            }
            suffix="/100"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <Highlight
            title="Diabetes Friendly"
            value={`${analytics.diabetesPercent}%`}
            description="of analysed meals"
          />

          <Highlight
            title="Weight-Loss Friendly"
            value={`${analytics.weightPercent}%`}
            description="of analysed meals"
          />

          <Highlight
            title="High Risk Meals"
            value={
              analytics.highRisk
            }
            description="flagged by CalGPT"
          />
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(320px,1fr))",
            gap: 20,
          }}
        >
          <div style={cardStyle}>
            <h2>
              Monthly Usage
            </h2>

            <SimpleBars
              data={monthlyStats.map(
                (x) => ({
                  label: x.month,
                  value: x.meals,
                })
              )}
            />
          </div>

          <div style={cardStyle}>
            <h2>
              Gender
            </h2>

            <SimpleBars
              data={genderStats}
            />
          </div>

          <div style={cardStyle}>
            <h2>
              Age Groups
            </h2>

            <SimpleBars
              data={ageStats}
            />
          </div>

          <div style={cardStyle}>
            <h2>
              Meal Types
            </h2>

            <SimpleBars
              data={mealTypeStats}
            />
          </div>

          <div style={cardStyle}>
            <h2>
              Risk Distribution
            </h2>

            <SimpleBars
              data={riskStats}
            />
          </div>

          <div style={cardStyle}>
            <h2>
              Top Food Groups
            </h2>

            <SimpleBars
              data={foodGroups}
            />
          </div>
        </div>

        <div
          style={{
            ...cardStyle,
            marginTop: 24,
            overflowX: "auto",
          }}
        >
          <h2>
            Recent Meal Activity
          </h2>

          <table
            style={{
              width: "100%",
              borderCollapse:
                "collapse",
              minWidth: 900,
            }}
          >
            <thead>
              <tr>
                {[
                  "Date",
                  "User",
                  "Meal",
                  "Calories",
                  "BMI",
                  "Health",
                  "Diabetes",
                  "Weight Loss",
                  "Risk",
                ].map((heading) => (
                  <th
                    key={heading}
                    style={{
                      textAlign:
                        "left",
                      padding: 12,
                      borderBottom:
                        "2px solid #e2e8f0",
                      fontSize: 13,
                    }}
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filteredMeals
                .slice(0, 30)
                .map(
                  (
                    meal,
                    index
                  ) => (
                    <tr
                      key={
                        meal.id ||
                        index
                      }
                    >
                      <td
                        style={
                          tdStyle
                        }
                      >
                        {formatDate(
                          meal.created_at
                        )}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {meal.user_email ||
                          "--"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {meal.meal_type ||
                          "--"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {meal.calories ||
                          0}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {meal.bmi
                          ? Number(
                              meal.bmi
                            ).toFixed(
                              1
                            )
                          : "--"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {meal.health_score ??
                          "--"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {meal.diabetes_friendly ||
                          "--"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        {meal.weight_loss_friendly ||
                          "--"}
                      </td>

                      <td
                        style={
                          tdStyle
                        }
                      >
                        <RiskBadge
                          risk={
                            meal.risk_flag
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
            </tbody>
          </table>

          {!filteredMeals.length && (
            <p
              style={{
                color: "#64748b",
              }}
            >
              No meal scans have
              been recorded for this
              period.
            </p>
          )}
        </div>

        <div
          style={{
            ...cardStyle,
            marginTop: 24,
            background:
              "linear-gradient(135deg,#052e16,#064e3b)",
            color: "white",
          }}
        >
          <p
            style={{
              color: "#86efac",
              fontWeight: 900,
            }}
          >
            PARTNER ANALYTICS
          </p>

          <h2
            style={{
              fontSize: 28,
            }}
          >
            Campaign Intelligence
          </h2>

          <p
            style={{
              color: "#d1fae5",
              maxWidth: 800,
            }}
          >
            This section is ready
            for campaign impressions,
            CTA clicks, referrals and
            conversions once campaign
            events are added to
            CalGPT.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(180px,1fr))",
              gap: 14,
              marginTop: 20,
            }}
          >
            <PartnerMetric
              label="Impressions"
              value="—"
            />

            <PartnerMetric
              label="CTA Clicks"
              value="—"
            />

            <PartnerMetric
              label="Referrals"
              value="—"
            />

            <PartnerMetric
              label="Conversion"
              value="—"
            />
          </div>
        </div>
      </div>
    </main>
  );
}

const tdStyle:
  React.CSSProperties = {
  padding: 12,
  borderBottom:
    "1px solid #e2e8f0",
  fontSize: 13,
};

function Metric({
  label,
  value,
  suffix = "",
}: {
  label: string;
  value: string | number;
  suffix?: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 22,
        padding: 20,
        border:
          "1px solid #e2e8f0",
        boxShadow:
          "0 10px 30px rgba(15,23,42,.05)",
      }}
    >
      <p
        style={{
          color: "#64748b",
          fontWeight: 800,
          margin: 0,
          fontSize: 13,
        }}
      >
        {label}
      </p>

      <h2
        style={{
          fontSize: 34,
          margin:
            "10px 0 0",
        }}
      >
        {value}
        <span
          style={{
            fontSize: 14,
            color: "#64748b",
          }}
        >
          {suffix}
        </span>
      </h2>
    </div>
  );
}

function Highlight({
  title,
  value,
  description,
}: {
  title: string;
  value: string | number;
  description: string;
}) {
  return (
    <div
      style={{
        padding: 22,
        borderRadius: 22,
        background:
          "linear-gradient(135deg,#dcfce7,#f0fdf4)",
        border:
          "1px solid #bbf7d0",
      }}
    >
      <p
        style={{
          fontWeight: 900,
          color: "#166534",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          fontSize: 40,
          margin: "5px 0",
        }}
      >
        {value}
      </h2>

      <small>
        {description}
      </small>
    </div>
  );
}

function SimpleBars({
  data,
}: {
  data: {
    label: string;
    value: number;
  }[];
}) {
  if (!data.length) {
    return (
      <p
        style={{
          color: "#64748b",
        }}
      >
        No data yet.
      </p>
    );
  }

  const max =
    Math.max(
      ...data.map(
        (item) => item.value
      ),
      1
    );

  return (
    <div>
      {data
        .slice(0, 10)
        .map((item) => (
          <div
            key={item.label}
            style={{
              marginBottom: 14,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent:
                  "space-between",
                marginBottom: 5,
                fontSize: 13,
                fontWeight: 800,
              }}
            >
              <span>
                {item.label}
              </span>

              <span>
                {item.value}
              </span>
            </div>

            <div
              style={{
                height: 10,
                background:
                  "#e2e8f0",
                borderRadius: 999,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${
                    (item.value /
                      max) *
                    100
                  }%`,
                  background:
                    "linear-gradient(90deg,#16a34a,#22c55e)",
                  borderRadius: 999,
                }}
              />
            </div>
          </div>
        ))}
    </div>
  );
}

function RiskBadge({
  risk,
}: {
  risk?: string;
}) {
  const value =
    risk || "Unknown";

  const lower =
    value.toLowerCase();

  let background =
    "#e2e8f0";

  let color =
    "#334155";

  if (lower === "low") {
    background = "#dcfce7";
    color = "#166534";
  }

  if (
    lower === "moderate"
  ) {
    background = "#fef3c7";
    color = "#92400e";
  }

  if (lower === "high") {
    background = "#fee2e2";
    color = "#991b1b";
  }

  return (
    <span
      style={{
        display:
          "inline-block",
        padding:
          "5px 10px",
        borderRadius: 999,
        background,
        color,
        fontWeight: 900,
        fontSize: 11,
      }}
    >
      {value}
    </span>
  );
}

function PartnerMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        background:
          "rgba(255,255,255,.10)",
        border:
          "1px solid rgba(255,255,255,.15)",
        borderRadius: 18,
        padding: 18,
      }}
    >
      <small
        style={{
          color: "#bbf7d0",
        }}
      >
        {label}
      </small>

      <h2
        style={{
          fontSize: 30,
          marginBottom: 0,
        }}
      >
        {value}
      </h2>
    </div>
  );
}
