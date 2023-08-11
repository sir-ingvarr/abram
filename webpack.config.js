const path = require('path');

module.exports = {
	entry: './src/global_index.ts',
	devtool: 'source-map',
	mode: 'production',
	module: {
		rules: [
			{
				test: /\.tsx?$/,
				use: 'ts-loader',
				exclude: /node_modules/,
			},
		],
	},
	resolve: {
		extensions: ['.ts', '.js'],
	},
	output: {
		filename: 'abram.js',
		path: path.resolve(__dirname, 'build'),
	},
};