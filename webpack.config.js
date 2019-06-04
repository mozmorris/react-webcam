module.exports = {
  mode: process.env.NODE_ENV,
  externals: [
    {
      react: {
        root: "React",
        commonjs2: "react",
        commonjs: "react",
        amd: "react"
      },
      "react-dom": {
        root: "ReactDOM",
        commonjs2: "react-dom",
        commonjs: "react-dom",
        amd: "react-dom"
      },
      "prop-types": {
        root: "PropTypes",
        commonjs2: "prop-types",
        commonjs: "prop-types",
        amd: "prop-types"
      }
    }
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: "babel-loader"
      }
    ]
  },
  output: {
    library: "Webcam",
    libraryTarget: 'umd',
    filename:
      process.env.NODE_ENV === "production"
        ? "react-webcam.min.js"
        : "react-webcam.js"
  }
};
