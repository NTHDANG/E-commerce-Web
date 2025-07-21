/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        "tiki-red": "#FF424E",
        "tiki-blue": "#1890FF",
        "tiki-dark-blue": "#0A68FF", // Màu xanh đậm hơn trong header
        "tiki-text-gray": "#333333",
        "tiki-light-gray": "#F5F5FA",
        "tiki-border-gray": "#E0E0E0",
        "tiki-green": "#00B050",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
