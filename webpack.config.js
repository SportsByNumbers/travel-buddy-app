const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // Needed for DefinePlugin
const CopyWebpackPlugin = require('copy-webpack-plugin'); // NEW: For copying public assets

module.exports = {
  // Set mode to 'production' for optimized output
  mode: 'production', // Explicitly set mode (good practice)

  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true, // Clean the output directory before emit
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
        },
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
          'postcss-loader'
        ],
      },
      {
        // Rule for image assets (png, svg, jpg, jpeg, gif, ico)
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource', // Webpack 5 asset module type
        generator: {
          filename: 'assets/[name][ext]' // Output images to an 'assets' folder in build
        }
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
      inject: 'body',
    }),
    // FIX for ReferenceError: process is not defined
    // This defines process.env.NODE_ENV and provides a fallback for 'process' global.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      // The 'process' global often needs a polyfill if used directly by libraries
      // We'll rely on the 'process' npm package for a more complete polyfill if needed.
      // For now, only define NODE_ENV
    }),
    // NEW FIX for manifest.json 404: Copy static files from public folder to build
    new CopyWebpackPlugin({
      patterns: [
        // Copy all files from 'public' to the root of 'build', except index.html (handled by HtmlWebpackPlugin)
        { from: 'public', to: '.', globOptions: { ignore: ['**/index.html'] } }
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    // FIX for ReferenceError: process is not defined: Add fallback for 'process' module
    // This requires 'process' npm package to be installed (npm install process)
    fallback: { "process": require.resolve("process/browser") }
  },
  devServer: {
    static: {
      directory: path.join(__dirname, 'public'),
    },
    compress: true,
    port: 3000,
    open: false,
    historyApiFallback: true,
  },
  target: 'web',
};
