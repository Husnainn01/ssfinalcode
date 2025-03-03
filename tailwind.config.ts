import type { Config } from "tailwindcss";
import {nextui} from "@nextui-org/react";


const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./node_modules/@nextui-org/theme/dist/**/*.{js,ts,jsx,tsx}"
  ],
  theme: {
  	extend: {
  		backgroundImage: {
  			'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
  			'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))'
  		},
  		fontFamily: {
  			inter: ['var(--font-inter)'],
  		},
  		colors: {
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			},
  			theme: {
  				primary: '#28464B',
  				secondary: '#2C8C99',
  				accent: '#FFFFFF',
  				background: '#F8F9FA',
  				'primary-hover': '#000000',
  				'secondary-hover': '#E2F1E7',
  				'accent-hover': '#F5F5F5',
  				'background-dark': '#E9ECEF'
  			}
  		},
  		animation: {
  			'shimmer': 'shimmer 2s linear infinite',
  			'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  		},
  		keyframes: {
  			shimmer: {
  				'0%': { backgroundPosition: '200% 50%' },
  				'100%': { backgroundPosition: '-200% 50%' },
  			}
  		},
  		backgroundSize: {
  			'auto': 'auto',
  			'cover': 'cover',
  			'contain': 'contain',
  			'200%': '200% 200%',
  		},
  	}
  },
  darkMode: ["class"],
  plugins: [nextui()]
};
export default config;
