const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/index.ts',
    module: {
        rules: [
            {
              test: /\.ts?$/,
              loader: 'babel-loader',
              exclude: /node_modules/
            },
            {
              test: /\.js$/,
              use: ["source-map-loader"],
              enforce: "pre",
              exclude: /node_modules/
            },
            {
              test: /\.json$/,
              loader: 'json-loader',
              exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [ ".ts", ".js" ]
    },
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'development',
    target: 'node',
    resolve: {
        fallback: {
          "fs": false,
          "tls": false,
          "net": false,
          "path": false,
          "zlib": false,
          "http": false,
          "https": false,
          "stream": false,
          "crypto": false,
          "crypto-browserify": false
        } 
    }
};