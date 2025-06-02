// tailwind.config.js
/** @type {import('tailwindcss').Config} */
module.exports = {
  // The 'content' array is crucial. It tells Tailwind CSS which files to scan
  // for Tailwind classes so it can generate only the CSS you need.
  // Adjust these paths if your project structure is different.
  // Common paths include:
  // - "./index.html" for your main HTML file
  // - "./src/**/*.{js,ts,jsx,tsx}" for all JavaScript/TypeScript/React files in the 'src' directory
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      // You can extend Tailwind's default theme here.
      // For example, adding custom colors, font sizes, spacing, etc.
    },
  },
  plugins: [
    // Add any Tailwind CSS plugins here.
    // For example, @tailwindcss/forms, @tailwindcss/typography.
  ],
}
