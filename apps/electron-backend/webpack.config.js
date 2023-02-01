const path = require('path');

module.exports = {
  target: 'electron-main',
  // mode: process.env.NODE_ENV == "dev" ? "development": "production",
  // mode: "development",
  mode: "production",
  entry: './src/main.ts',
  output: {
    // filename: 'main.js',
    filename: '[name].js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [{
      test: /\.ts$/,
      exclude: /node_module/,
      use: 'ts-loader',
    }]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
}
