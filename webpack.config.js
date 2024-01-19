module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'source-map',
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
      }
    }
  ],
  entry: "./src/react-webcam.tsx",
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"]
  },
  module: {
    rules: [
      {
        test: /\.(t|j)sx?$/,
        use: "awesome-typescript-loader"
      }
    ]
  },
  output: {
    library: "Webcam",
    libraryTarget: "umd",
    filename:
      process.env.NODE_ENV === "production"
        ? "react-webcam.min.js"
        : "react-webcam.js",
    globalObject: "this",
    libraryExport: "default"
  }
};
