/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],
	theme: {
		extend: {
			colors: {
				primary: '#0ea5e9',
				dark: '#0f172a',
				success: '#10b981',
				warning: '#f59e0b',
				// Additional colors from prototype
				'sky-400': '#38bdf8',
				'amber-400': '#fbbf24',
				'emerald-400': '#34d399',
				'slate-50': '#f8fafc',
				'slate-100': '#f1f5f9',
				'slate-200': '#e2e8f0',
				'slate-300': '#cbd5e1',
				'slate-400': '#94a3b8',
				'slate-500': '#64748b',
				'slate-600': '#475569',
				'slate-700': '#334155',
				'slate-800': '#1e293b',
				'slate-900': '#0f172a'
			},
			fontFamily: {
				sans: [
					'-apple-system',
					'BlinkMacSystemFont',
					'"Segoe UI"',
					'Roboto',
					'Helvetica',
					'Arial',
					'sans-serif'
				]
			},
			borderRadius: {
				'2xl': '1rem',
				'3xl': '1.5rem'
			}
		}
	},
	plugins: []
};