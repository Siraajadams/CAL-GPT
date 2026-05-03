import "./globals.css";

export const metadata = {
  title: "CalGPT | AI Calorie Tracker",
  description: "AI calorie tracking, EHR, diet plans and weight management.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
