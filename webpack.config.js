module.exports = {
  entry: './index.js',
  output: {
    filename: './dist/react-webcam.js',
    sourceMapFilename: './dist/react-webcam.map',
    library: 'Webcam',
    libraryTarget: 'umd'
  },
  externals: {
    'react': 'React',
    'react/addons': 'React'
  },
  module: {
    loaders: [
      {test: /\.js$/, loader: 'jsx-loader'}
    ]
  }
};
