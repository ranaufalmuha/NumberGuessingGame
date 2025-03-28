export default {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        'game-bg': '#f0f4f8',
        'game-primary': '#3b82f6',
        'game-secondary': '#10b981',
      },
      animation: {
        'bounce-slow': 'bounce 2s infinite',
      }
    }
  }
};
