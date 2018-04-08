"use strict";

var webpack = require("webpack");

var plugins = [
  new webpack.EnvironmentPlugin({
    NODE_ENV: "development",
  }),
];

if (process.env.NODE_ENV === "production") {
  plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      compressor: {
        screw_ie8: true,
      },
      sourceMap: true,
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true,
    }),
  );
}

module.exports = {
  externals: [
    {
      react: {
        root: "React",
        commonjs2: "react",
        commonjs: "react",
        amd: "react",
      },
      "react-dom": {
        root: "ReactDOM",
        commonjs2: "react-dom",
        commonjs: "react-dom",
        amd: "react-dom",
      },
      "prop-types": {
        root: "PropTypes",
        commonjs2: "prop-types",
        commonjs: "prop-types",
        amd: "prop-types",
      },
    },
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader",
      },
    ],
  },
  output: {
    library: "Webcam",
    libraryTarget: "umd",
  },
  plugins: plugins,
};
