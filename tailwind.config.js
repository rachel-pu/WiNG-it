/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
  	fontSize: {
  		xs: '.75rem',
  		sm: '.875rem',
  		tiny: '.875rem',
  		base: '1rem',
  		lg: '1.125rem',
  		xl: '1.25rem',
  		'1.5xl': '1.375rem',
  		'2xl': '1.5rem',
  		'2.5xl': '1.625rem',
  		'3xl': '1.875rem',
  		'4xl': '2.25rem',
  		'5xl': '3rem',
  		'6xl': '4rem',
  		'7xl': '5rem',
  		'8xl': '6rem',
  		'9xl': '8rem',
  		'10xl': '9rem',
  		'11xl': '11rem',
  		'11.5xl': '11.5rem',
  		'12xl': '12rem',
  		'12.5xl': '12.5rem',
  		'12.75xl': '12.75rem',
  		'13xl': '13rem',
  		'14xl': '14rem',
  		'15xl': '15rem'
  	},
  	colors: {
  		colorF3F1EA: '#F3F1EA',
  		color8BCA67: '#8BCA67',
  		colorCDE1B1: '#CDE1B1',
  		colorBDE3E3: '#BDE3E3',
  		colorAED6EC: '#AED6EC',
  		color5C9CF5: '#5C9CF5',
  		color282523: '#282523',
  		color69ADFF: '#69ADFF',
  		colorFAF8F1: '#FAF8F1',
  		color8DA877: '#8DA877',
  		color7489B2: '#7489B2',
  		color73842F: '#73842F',
  		color6998C2: '#6998C2',
  		color3163C7: '#3163C7',
  		color6795CA: '#6795CA',
  		colorC1B1E1: '#C1B1E1',
  		color31362F: '#31362F',
  		color7DBE73: '#7DBE73',
  		color589C9B: '#589C9B',
  		color2E89BA: '#2E89BA',
  		colorD9D9D9: '#D9D9D9',
  		colorB7B7B7: '#B7B7B7',
  		colorB0B0B0: '#B0B0B0',
  		color4E4E4E: '#4E4E4E',
  		colorACD9DB: '#ACD9DB',
  		color6BAEDB: '#6BAEDB',
  		color307999: '#307999',
  		color6EAFCC: '#6EAFCC'
  	},
  	extend: {
  		spacing: {
  			'1/4': '25%',
  			'1/5': '20%',
  			'4/5': '80%',
  			'1/6': '16.666667%',
  			'1/6.5': '15.384615%',
  			'1/7': '14.285714%',
  			'1/8': '12.5%',
  			'1/9': '11.111111%',
  			'1/10': '10%',
  			'1/12': '8.333333%',
  			'1/15': '6.666667%',
  			'5/15': '33.333333%',
  			'12.75/15': '85%',
  			'1/20': '5%',
  			'1/25': '4%',
  			'1/30': '3.333333%',
  			'1/40': '2.5%',
  			'1/45': '2.222222%',
  			'1/50': '2%',
  			'1/60': '1.666667%',
  			'1/70': '1.428571%',
  			'1/75': '1.333333%',
  			'1/80': '1.25%',
  			'1/90': '1.111111%',
  			'1/100': '1%'
  		},
  		fontFamily: {
  			satoshi: [
  				'Satoshi',
  				'Arial',
  				'Helvetica',
  				'sans-serif'
  			],
  			'dm-sans': [
  				'DM Sans',
  				'Arial',
  				'Helvetica',
  				'sans-serif'
  			],
  			'dm-sans-medium': [
  				'DM Sans Medium',
  				'Arial',
  				'Helvetica',
  				'sans-serif'
  			],
  			'dm-sans-black': [
  				'DM Sans Black',
  				'Arial',
  				'Helvetica',
  				'sans-serif'
  			],
  			'dm-sans-semibold': [
  				'DM Sans SemiBold',
  				'Arial',
  				'Helvetica',
  				'sans-serif'
  			],
  			janitor: [
  				'Janitor',
  				'Arial',
  				'Helvetica',
  				'sans-serif'
  			]
  		},
  		colors: {
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
