const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const webpack = require('webpack'); // Keep this if you use webpack.DefinePlugin
const CopyWebpackPlugin = require('copy-webpack-plugin');

module.exports = {
  // 1. RECOMMENDATION: Remove 'mode' from here.
  //    It's better to define the mode via the command line in package.json scripts
  //    (e.g., 'webpack serve --mode development' and 'webpack --mode production').
  //    This makes the config reusable for both dev and prod.
  // mode: 'production', // <--- REMOVE THIS LINE from the config file itself.

  entry: './src/index.js', // Your application's entry point (can be .jsx)
  output: {
    path: path.resolve(__dirname, 'build'), // Output directory (where bundled files go)
    filename: 'bundle.js', // Name of the main bundled JavaScript file
    publicPath: '/', // Base URL for all assets. Crucial for SPA routing and asset loading.
    clean: true, // Clean the output directory before each build
  },
  module: {
    rules: [
      {
        test: /\.(js|jsx)$/, // Process .js and .jsx files
        exclude: /node_modules/, // Don't process files in node_modules
        use: {
          loader: 'babel-loader', // Use Babel for transpilation
          options: {
            presets: ['@babel/preset-env', '@babel/preset-react'], // Babel presets for environment and React
          },
        },
      },
      {
        test: /\.css$/, // Process .css files
        use: [
          'style-loader',   // Injects CSS into the DOM
          'css-loader',     // Interprets @import and url() like import/require() and resolves them
          'postcss-loader'  // Processes CSS with PostCSS (essential for Tailwind CSS)
        ],
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif|ico)$/i, // Handle image files
        type: 'asset/resource', // Webpack 5's built-in asset module type
        generator: {
          filename: 'assets/images/[name][ext]' // Output path for images within 'build' folder
        }
      },
      // You might need a rule for fonts if you use custom fonts:
      // {
      //   test: /\.(woff|woff2|eot|ttf|otf)$/i,
      //   type: 'asset/resource',
      //   generator: {
      //     filename: 'assets/fonts/[name][ext]'
      //   }
      // }
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html', // Path to your source HTML template
      filename: 'index.html', // Output HTML file name
      inject: 'body', // Inject bundled JS into the <body> tag
    }),
    // FIX for ReferenceError: process is not defined and environment variables
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'), // Default to 'development' if not set
      // Provide a basic 'process' object polyfill for older libraries
      'process': JSON.stringify({
          env: { NODE_ENV: process.env.NODE_ENV || 'development' },
          platform: 'browser',
          cwd: () => '/',
      })
    }),
    // FIX for manifest.json 404: Copy static files from public folder to build output
    new CopyWebpackPlugin({
      patterns: [
        // This copies everything from the 'public' directory (excluding index.html)
        // to the root of your 'build' directory.
        // This includes manifest.json, favicon.ico, logo192.png, logo512.png, etc.
        { from: 'public', to: '.', globOptions: { ignore: ['**/index.html'] } }
      ]
    })
  ],
  resolve: {
    extensions: ['.js', '.jsx'], // Allows you to import JS/JSX files without specifying the extension
    // Fallback for 'process' module, specifically for browser environments
    // This requires the 'process' npm package (which you have in devDependencies)
    fallback: { "process": require.resolve("process/browser") }
  },
  // devServer configuration for local development with `webpack serve`
  devServer: {
    // 2. RECOMMENDATION: Point devServer.static to your *output* directory ('build')
    //    to ensure it serves the bundled and copied assets consistently.
    static: {
      directory: path.join(__dirname, 'build'), // Serve files from the 'build' directory
    },
    compress: true, // Enable gzip compression
    port: 3000, // Port for the development server
    open: false, // Don't automatically open the browser (controlled by 'package.json' script)
    historyApiFallback: true, // Fall back to index.html for HTML5 History API routing
  },
  target: 'web', // Compile for a browser-like environment
};
