import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        calgreen: "#22C55E",
        caldark: "#07110C"
      }
    }
  },
plugins: [ require("@tailwindcss/forms"),
  require("@tailwindcss/typography"),
],
};

export default config;
