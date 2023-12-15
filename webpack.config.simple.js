const ReactServerWebpackPlugin = require('react-server-dom-webpack/plugin')

module.exports = {
  entry: {
    'ssr-app': './public/js/app/ssr-app.js',
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        use: 'babel-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: ['.js', '.jsx'],
  },

  plugins: [new ReactServerWebpackPlugin({ isServer: false })],
}
