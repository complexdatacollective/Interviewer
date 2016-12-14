var path = require('path');
var webpack = require('webpack');

module.exports = {
  entry: './src/main.js',
  output: { path: __dirname, filename: 'bundle.js' },
  devtool: 'inline-source-map',
  module: {
    loaders: [
      {
        test: /.js?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      }
    ]
  },
};
