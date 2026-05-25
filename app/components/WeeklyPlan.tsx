type Meal = {
  day: string;
  breakfast: string;
  lunch: string;
  dinner: string;
  snack: string;
};

const weeklyPlan: Meal[] = [
  {
    day: "Monday",
    breakfast: "2 eggs + 1 toast + fruit",
    lunch: "120g chicken salad",
    dinner: "150g fish + vegetables",
    snack: "Greek yoghurt"
  },
  {
    day: "Tuesday",
    breakfast: "Oats 40g + berries",
    lunch: "Tuna wrap",
    dinner: "120g mince + rice",
    snack: "Apple + nuts"
  }
];

export default function WeeklyPlan() {
  return (
    <div className="bg-white rounded-3xl p-6 mt-6">
      <h2 className="text-2xl font-bold mb-4">
        Weekly Eating Plan
      </h2>

      <div className="space-y-4">
        {weeklyPlan.map((meal) => (
          <div
            key={meal.day}
            className="border rounded-2xl p-4"
          >
            <h3 className="font-bold text-lg">
              {meal.day}
            </h3>

            <p><strong>Breakfast:</strong> {meal.breakfast}</p>
            <p><strong>Lunch:</strong> {meal.lunch}</p>
            <p><strong>Dinner:</strong> {meal.dinner}</p>
            <p><strong>Snack:</strong> {meal.snack}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
