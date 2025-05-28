/** @type {import('tailwindcss').Config} */
const defaultTheme = require('tailwindcss/defaultTheme'); // Thêm dòng này để truy cập theme mặc định

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    // ADD FONT
    extend: {
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
      },
      // ADD MORE IF YOU WANT
      // colors: {
      //   'custom-blue': '#007bff',
      //   'brand-primary': 'var(--color-brand-primary)', // Nếu dùng CSS variables
      // },
      // spacing: {
      //   '128': '32rem',
      // }
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // ADD plugin @tailwindcss/forms
  ],
}