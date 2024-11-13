import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{html,js,svelte,ts}'],

  theme: {
    extend: {},
    colors: {
      'purple': '#310148',
      'beige': '#FBD095',
      'lightred': '#FF3D6A'
    }
  },

  plugins: []
} satisfies Config;
