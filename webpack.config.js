const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack');
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // Explicitly set mode for clarity and proper optimizations
  mode: 'production', // Ensure this is set to 'production' for deploy builds

  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'build'),
    filename: 'bundle.js',
    publicPath: '/',
    clean: true,
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
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i,
        type: 'asset/resource',
        generator: {
          filename: 'assets/[name][ext]'
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
    // Define process.env.NODE_ENV and provide a minimal polyfill for 'process' global.
    // This is a common and robust way to handle Node.js globals in browser builds.
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'production'),
      // Provide a basic 'process' object if a library somehow tries to access it directly
      'process': JSON.stringify({
          env: { NODE_ENV: process.env.NODE_ENV || 'production' },
          platform: 'browser', // Mimic browser environment
          cwd: () => '/',      // Minimal cwd implementation
          // Add other properties as needed if specific libraries complain
      })
    }),
    // FIX for manifest.json 404: Copy static files from public folder to build
    new CopyWebpackPlugin({
      patterns: [
        // Copy all files from 'public' to the root of 'build', except index.html (handled by HtmlWebpackPlugin)
        // Make sure the path 'public' is relative to webpack.config.js
        { from: 'public', to: '.', globOptions: { ignore: ['**/index.html'] } }
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'],
    // Add fallback for 'process' module if needed by deep dependencies.
    // This requires 'process' npm package: npm install process
    fallback: { "process": require.resolve("process/browser") }
  },
  // devServer configuration is typically for local development
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
