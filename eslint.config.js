import tseslint from 'typescript-eslint';

export default tseslint.config(
	...tseslint.configs.recommended,
	{
		files: ['src/**/*.ts'],
		rules: {
			'indent': ['error', 'tab'],
			'linebreak-style': ['error', 'unix'],
			'quotes': ['error', 'single'],
			'semi': ['error', 'always'],
			'@typescript-eslint/no-explicit-any': 'warn',
			'@typescript-eslint/no-unsafe-function-type': 'off',
			'@typescript-eslint/no-unused-expressions': 'warn',
		},
	},
	{
		ignores: ['webpack.config.js', 'build/**', 'examples/**'],
	},
);
