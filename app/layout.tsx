export const metadata = {
  title: "CalGPT",
  description: "AI calorie and nutrition tracker",
  manifest: "/manifest.json",
  themeColor: "#22C55E",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
