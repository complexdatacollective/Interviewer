const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const appSrc = path.resolve(__dirname, 'src');

module.exports = {
  entry: "./src/index.js",
  // target: "electron-renderer",
  output: {
    filename: "main.js",
    path: path.resolve(__dirname, "www"),
  },
  devServer: {
    static: {
      directory: path.join(__dirname, "www"),
    },
    port: 3000,
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.join(__dirname, "public", "index.html"),
    }),
  ],
  module: {
    // exclude node_modules
    rules: [
      {
        test: /\.m?js/,
        resolve: {
          fullySpecified: false
        }
      },
      {
        test: /\.(js|jsx)$/,         // <-- added `|jsx` here
        exclude: /node_modules/,
        use: ["babel-loader"],
      },
      {
        test: /\.s[ac]ss$/i,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          "css-loader",
          // Compiles Sass to CSS
          "sass-loader",
        ],
      },
      {
        test: /\.(svg|png|jpe?g|gif)$/i,
        use: [
          {
            loader: 'file-loader',
          },
        ],
      },
      {
        test: /\.woff2?$|\.woff$/,
        use: [{
          loader: 'file-loader',
          options: {
            name: 'static/fonts/[name].[ext]',
          },
        }],
      },
    ],
  },
  resolve: {
    // Any node modules need to be added here, so that the app can still build
    // for the web target.
    fallback: {
      "assert": false,
      "fs": false,
      "tls": false,
      "net": false,
      "path": false,
      "zlib": false,
      "http": false,
      "https": false,
      "stream": false,
      "os": false,
      "constants": false,
      "crypto": false,
      "url": false,
    },
    extensions: ["*", ".js", ".jsx", ".json"],
    alias: {
      '~': appSrc,
      '~behaviours': path.join(appSrc, 'behaviours'),
      '~components': path.join(appSrc, 'components'),
      '~containers': path.join(appSrc, 'containers'),
      '~contexts': path.join(appSrc, 'contexts'),
      '~ducks': path.join(appSrc, 'ducks'),
      '~hooks': path.join(appSrc, 'hooks'),
      '~images': path.join(appSrc, 'images'),
      '~selectors': path.join(appSrc, 'selectors'),
      '~utils': path.join(appSrc, 'utils'),
      '@codaco/shared-consts': require.resolve('@codaco/shared-consts/dist/index.js'),
    },
  }
};
