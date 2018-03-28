
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const plugins = [
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
  }),
  new HtmlWebpackPlugin({
    template: './examples/index.html',
    minify: { collapseWhitespace: true }
  })
];

const isProd = process.env.NODE_ENV === 'production'

module.exports = {
  entry: './src/react-webcam.js',
  externals: [{
    react: {
      root: 'React',
      commonjs2: 'react',
      commonjs: 'react',
      amd: 'react'
    }
  }, isProd ? /^babel-runtime/ : ''],
  module: {
    rules: [{
      test: /\.js$/,
      include: [
        `${__dirname}/src`
      ],
      use: 'babel-loader'
    }]
  },
  output: {
    library: 'Webcam',
    libraryTarget: 'umd',
    path: `${__dirname}/dist`,
    filename: 'react-webcam.js'
  },
  devServer: {
    port: process.env.PORT || 3333,
    host: '0.0.0.0',
    publicPath: '/'
  },
  plugins: plugins
};
