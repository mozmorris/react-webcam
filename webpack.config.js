'use strict';

var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var plugins = [
  new webpack.optimize.OccurenceOrderPlugin(),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  new HtmlWebpackPlugin({
    template: './examples/index.html',
    minify: { collapseWhitespace: true }
  })
];

if (process.env.NODE_ENV === 'production') {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
        warnings: false
      }
    })
  );
}

module.exports = {
  entry: './src/react-webcam.js',
  externals: [{
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  }],
  module: {
    loaders: [{
      test: /\.js$/,
      loader: 'babel-loader'
    }]
  },
  output: {
    library: 'Webcam',
    libraryTarget: 'umd',
    path: `./dist`,
    filename: process.env.NODE_ENV === 'production' ? 'react-webcam.min.js' : 'react-webcam.js'
  },
  devServer: {
    port: process.env.PORT || 3333,
    host: '0.0.0.0',
    publicPath: '/'
  },
  plugins: plugins
};
