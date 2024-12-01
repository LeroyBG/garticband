import type { Config } from "tailwindcss";

export default {
  content: ["./src/**/*.{html,js,svelte,ts}"],

  theme: {
    extend: {
      animation: {
        fade: 'fadeIn .5s ease-in-out',
      },
      keyframes: {
				fadeIn: {
					from: { opacity: '0' },
					to: { opacity: '1' },
				},
			},
      colors: {
        purple: "#310148",
        pink: "#b515b0",
        beige: "#FBD095",
        darkbeige: "#d1a86f",
        lightred: "#FF3D6A",
        white: "#ffffff",
        darkpurple: "#1b0131",
        indigo: "#4F46E5",
        darkred: "#FF1A00",
        darkgrey: "#141414",
        grey: "#3f3f3f",
        yellow: "#00A86B",
        blue: "#0080FE",
        green: "#008000",
        lightgreen: "#15803d",
        sequencerButtonPurple: "#32244B",
        sequencerButtonPink: "#45193C"
      },
    },
    
    
  },

  plugins: [],
} satisfies Config;
