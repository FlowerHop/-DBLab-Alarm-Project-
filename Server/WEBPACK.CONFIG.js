var path = require ('path');

module.exports = {
  entry: './server.js',
  output: {
    filename: 'bundle.js'
  },
  module: {
    loaders:[
      { test: /\.css$/, loader: "style!css" },
      { test: /\.js$/, loader: 'jsx-loader?harmony' },
      { test: /\.json$/, loader: 'json-loader' }
    ]
  },
  resolve: {
    fallback: path.join(__dirname, "node_modules"),
    extensions : ['', '.js', '.jsx']
  },
  resolveLoader: { fallback: path.join(__dirname, "node_modules") },
  target: 'node'
};