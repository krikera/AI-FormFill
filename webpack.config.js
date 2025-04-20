const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');

module.exports = (env, argv) => {
  const isProduction = argv.mode === 'production';

  return {
    entry: {
      background: './js/background.js',
      content: './js/content.js',
      popup: './js/popup.js',
      options: './js/options.js'
    },
    output: {
      path: path.resolve(__dirname, 'dist'),
      filename: 'js/[name].js',
      clean: true
    },
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: /node_modules/,
          use: {
            loader: 'babel-loader',
            options: {
              presets: ['@babel/preset-env']
            }
          }
        },
        {
          test: /\.css$/,
          use: ['style-loader', 'css-loader']
        }
      ]
    },
    plugins: [
      new CopyPlugin({
        patterns: [
          { from: 'manifest.json', to: 'manifest.json' },
          { from: 'popup.html', to: 'popup.html' },
          { from: 'options.html', to: 'options.html' },
          {
            from: 'css',
            to: 'css',
            globOptions: {
              ignore: ['**/*.map']
            }
          },
          {
            from: 'images',
            to: 'images'
          },
          {
            from: 'lib',
            to: 'lib',
            globOptions: {
              ignore: ['**/*.map', '**/*.ts', '**/LICENSE*', '**/README*']
            }
          },
          { from: '_locales', to: '_locales' }
        ]
      })
    ],
    optimization: {
      minimize: isProduction,
      splitChunks: {
        chunks: 'all',
        name: 'vendor'
      }
    },
    // Only include source maps in development mode
    devtool: isProduction ? false : 'source-map'
  };
} 